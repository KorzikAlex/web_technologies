import type { Entity } from '@/entities';
import type { IDrawable} from '@/entities/interfaces';
import type { GameManager } from './GameManager';
import type {
    TiledMapData,
    Tile,
    Tileset,
    MapTileset,
    TilesLayer,
    ObjectsLayer,
    ObjectProperty,
} from './types';

export class MapManager<T extends Entity & IDrawable> {
    mapData: TiledMapData | null;
    tLayer: TilesLayer | ObjectsLayer | null;
    xCount: number;
    yCount: number;
    tSize: Record<string, number>;
    mapSize: Record<string, number>;
    tilesets: MapTileset[];

    imgLoadCount: number;
    imgLoaded: boolean;
    jsonLoaded: boolean;

    view: Record<string, number>;

    gameManager: GameManager<T>;

    constructor(jsonPath: string, gameManager: GameManager<T>) {
        this.mapData = null;
        this.tLayer = null;
        this.tilesets = [];

        this.imgLoadCount = 0;
        this.imgLoaded = false;
        this.jsonLoaded = false;

        this.xCount = 0;
        this.yCount = 0;

        this.tSize = { x: 0, y: 0 };
        this.mapSize = { x: 0, y: 0 };

        this.view = { x: 0, y: 0, w: 800, h: 600 };

        this.gameManager = gameManager;

        this.loadMap(jsonPath);
    }

    private loadMap(path: string): void {
        const request: XMLHttpRequest = new XMLHttpRequest();
        request.onreadystatechange = (): void => {
            if (request.readyState === 4 && request.status === 200) {
                this.parseMap(request.responseText);
            }
        };
        request.open('GET', path, true);
        request.send();
    }

    private parseMap(tilesJSON: string): void {
        this.mapData = JSON.parse(tilesJSON) as TiledMapData;

        this.xCount = this.mapData.width;
        this.yCount = this.mapData.height;

        this.tSize.x = this.mapData.tilewidth;
        this.tSize.y = this.mapData.tileheight;

        this.mapSize.x = this.xCount * this.tSize.x;
        this.mapSize.y = this.yCount * this.tSize.y;

        for (let i = 0; i < this.mapData.tilesets.length; ++i) {
            const img: HTMLImageElement = new Image();

            img.onload = (): void => {
                this.imgLoadCount++;

                if (this.mapData === null) {
                    return;
                }

                if (this.imgLoadCount === this.mapData.tilesets.length) {
                    this.imgLoaded = true;
                }
            };

            img.src = this.mapData.tilesets[i].image;

            const t: Tileset = this.mapData.tilesets[i];
            this.tilesets.push({
                firstgid: t.firstgid,
                image: img,
                name: t.name,
                xCount: Math.floor(t.imagewidth / this.tSize.x),
                yCount: Math.floor(t.imageheight / this.tSize.y),
            });
        }

        this.jsonLoaded = true;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        if (!this.imgLoaded || !this.jsonLoaded || this.mapData === null) {
            setTimeout((): void => {
                this.draw(ctx);
            }, 100);
            return;
        }

        if (this.tLayer === null) {
            for (let id: number = 0; id < this.mapData.layers.length; ++id) {
                if (this.mapData.layers[id].type === 'tilelayer') {
                    this.tLayer = this.mapData.layers[id];
                    break;
                }
            }
        }

        if (this.tLayer === null) {
            return;
        }

        const tilesLayer: TilesLayer = this.tLayer as TilesLayer;

        for (let i: number = 0; i < tilesLayer.data.length; ++i) {
            if (tilesLayer.data[i] !== 0) {
                const tile: Tile = this.getTile(tilesLayer.data[i]);
                let pX: number = (i % this.xCount) * this.tSize.x;
                let pY: number = Math.floor(i / this.xCount) * this.tSize.y;

                if (!this.isVisible(pX, pY, this.tSize.x, this.tSize.y)) {
                    continue;
                }

                pX -= this.view.x;
                pY -= this.view.y;

                if (!tile.img) {
                    continue;
                }

                ctx.drawImage(
                    tile.img,
                    tile.px,
                    tile.py,
                    this.tSize.x,
                    this.tSize.y,
                    pX,
                    pY,
                    this.tSize.x,
                    this.tSize.y,
                );
            }
        }
    }
    isVisible(x: number, y: number, width: number, height: number): boolean {
        return !(
            x + width < this.view.x ||
            x > this.view.x + this.view.w ||
            y + height < this.view.y ||
            y > this.view.y + this.view.h
        );
    }

    getTile(tileIndex: number): Tile {
        const tile: Tile = {
            img: null,
            px: 0,
            py: 0,
        };

        const tileset: MapTileset | null = this.getTileset(tileIndex);

        if (tileset === null) {
            return tile;
        }

        tile.img = tileset.image;
        const id: number = tileIndex - tileset.firstgid;

        const x: number = id % tileset.xCount;
        const y: number = Math.floor(id / tileset.xCount);

        tile.px = x * this.tSize.x;
        tile.py = y * this.tSize.y;
        return tile;
    }

    getTileset(tileIndex: number): MapTileset | null {
        for (let i: number = this.tilesets.length - 1; i >= 0; --i) {
            if (this.tilesets[i].firstgid <= tileIndex) {
                return this.tilesets[i];
            }
        }
        return null;
    }

    parseEntities(): void {
        if (!this.imgLoaded || !this.jsonLoaded || this.mapData === null) {
            setTimeout((): void => {
                this.parseEntities();
            }, 100);
            return;
        }
        for (let j: number = 0; j < this.mapData.layers.length; ++j) {
            const entities: ObjectsLayer = this.mapData.layers[j] as ObjectsLayer;
            if (this.mapData.layers[j].type === 'objectgroup') {
                if (!entities.objects) {
                    continue;
                }
                for (let i: number = 0; i < entities.objects.length; ++i) {
                    const e: ObjectProperty = entities.objects[i];
                    try {
                        const obj = Object.create(this.gameManager.factory[e.type]); // FIXME: Типизация и метод factory
                        // в соответствии с типом создаем экземпляр объекта
                        obj.name = e.name;
                        obj.pos_x = e.x;
                        obj.pos_y = e.y;
                        obj.size_x = e.width;
                        obj.size_y = e.height;
                        // помещаем в массив объектов
                        this.gameManager.entities.push(obj);
                        if (obj.name === 'player') {
                            // инициализируем параметры игрока
                            this.gameManager.initPlayer(obj);
                        }
                    } catch (error) {
                        console.error(`Error while creating: ["${e.gid}"]${e.type}, ${error}`);
                    }
                }
            }
        }
    }

    getTilesetIdx(x: number, y: number): number {
        const tLayer: TilesLayer | null = this.tLayer as TilesLayer;

        const wX = x;
        const wY = y;
        const idx = Math.floor(wY / this.tSize.y) * this.xCount + Math.floor(wX / this.tSize.x);
        if (tLayer === null) {
            return -1;
        }
        return tLayer.data[idx];
    }

    centerAt(x: number, y: number): void {
        if (x < this.view.w / 2) {
            this.view.x = 0;
        } else if (x > this.mapSize.x - this.view.w / 2) {
            this.view.x = this.mapSize.x - this.view.w;
        } else {
            this.view.x = x - this.view.w / 2;
        }
        if (y < this.view.h / 2) {
            this.view.y = 0;
        } else if (y > this.mapSize.y - this.view.h / 2) {
            this.view.y = this.mapSize.y - this.view.h;
        } else {
            this.view.y = y - this.view.h / 2;
        }
    }
}
