import type { Entity } from '@/entities';
import type { MapManager } from './';
import type { Atlas } from './types';
import type { IDrawable } from '@/entities/interfaces';

type Sprite = {
    name: string;
    x: number;
    y: number;
    w: number;
    h: number;
};

export class SpriteManager<T extends Entity & IDrawable> {
    image: HTMLImageElement;
    sprites: Sprite[];

    imgLoaded: boolean;
    jsonLoaded: boolean;

    mapManager: MapManager<T>;

    constructor(mapManager: MapManager<T>) {
        this.image = new Image();
        this.sprites = [];

        this.imgLoaded = false;
        this.jsonLoaded = false;

        this.mapManager = mapManager;
    }

    loadAtlas(atlasJson: string, atlasPath: string): void {
        const request: XMLHttpRequest = new XMLHttpRequest();
        request.onreadystatechange = (): void => {
            if (request.readyState === 4 && request.status === 200) {
                this.parseAtlas(request.responseText);
            }
        };
        request.open('GET', atlasJson, true);
        request.send();
        this.loadImg(atlasPath);
    }

    loadImg(imgName: string): void {
        this.image.onload = (): void => {
            this.imgLoaded = true;
        };
        this.image.src = imgName;
    }

    parseAtlas(responseText: string): void {
        const atlas: Atlas = JSON.parse(responseText);

        for (const name in atlas.frames) {
            const frame: { x: number; y: number; w: number; h: number } = atlas.frames[name].frame;
            this.sprites.push({
                name: name,
                x: frame.x,
                y: frame.y,
                w: frame.w,
                h: frame.h,
            });
            this.jsonLoaded = true;
        }
    }

    drawSprite(ctx: CanvasRenderingContext2D, name: string, x: number, y: number) {
        // если изображение не загружено, то повторить запрос через
        // 100 мсек
        if (!this.imgLoaded || !this.jsonLoaded) {
            setTimeout(() => {
                this.drawSprite(ctx, name, x, y);
            }, 100);
            return;
        }
        const sprite: Sprite | null = this.getSprite(name); // получить спрайт по имени
        if (sprite === null) {
            return;
        }

        if (!this.mapManager.isVisible(x, y, sprite.w, sprite.h)) {
            return; // не рисуем за пределами видимой зоны
        }

        // сдвигаем видимую зону
        x -= this.mapManager.view.x;
        y -= this.mapManager.view.y;

        // отображаем спрайт на холсте
        ctx.drawImage(this.image, sprite.x, sprite.y, sprite.w, sprite.h, x, y, sprite.w, sprite.h);
    }

    getSprite(name: string) {
        for (let i: number = 0; i < this.sprites.length; ++i) {
            const s = this.sprites[i];
            if (s.name === name) {
                return s;
            }
        }
        return null;
    }
}
