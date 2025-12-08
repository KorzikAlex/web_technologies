type TileSet = {
    firstgid: number;
    image: HTMLImageElement;
    name: string;
    xCount: number;
    yCount: number;
};

type Tile = {
    img: HTMLImageElement | null;
    px: number;
    py: number;
};


// export const MapManager = {
//     mapData: null as any,
//     tLayer: null as any,
//     xCount: 0,
//     yCount: 0,
//     tSize: { x: 64, y: 64 },
//     mapSize: { x: 64, y: 64 },
//     tilesets: [] as TileSet[],
//     imgLoadCount: 0,
//     imgLoaded: false,
//     jsonLoaded: false,
//     view: { x: 0, y: 0, w: 800, h: 600 },

//     parseMap(tilesJSON: string): void {
//         MapManager.mapData = JSON.parse(tilesJSON);

//         MapManager.xCount = MapManager.mapData.width;
//         MapManager.yCount = MapManager.mapData.height;
//         MapManager.tSize.x = MapManager.mapData.tilewidth;
//         MapManager.tSize.y = MapManager.mapData.tileheight;
//         MapManager.mapSize.x = MapManager.xCount * MapManager.tSize.x;
//         MapManager.mapSize.y = MapManager.yCount * MapManager.tSize.y;

//         for (let i = 0; i < MapManager.mapData.tilesets.length; i++) {

//             const img = new Image();

//             img.onload = () => {
//                 MapManager.imgLoadCount++;
//                 if (MapManager.imgLoadCount === MapManager.mapData.tilesets.length) {
//                     MapManager.imgLoaded = true;
//                 }
//             };

//             const t = MapManager.mapData.tilesets[i];
//             img.src = t.image;


//             const ts: TileSet = {
//                 firstgid: t.firstgid,
//                 image: img,
//                 name: t.name,
//                 xCount: Math.floor((t.imagewidth ?? img.width) / MapManager.tSize.x),
//                 yCount: Math.floor((t.imageheight ?? img.height) / MapManager.tSize.y),
//             };
//             MapManager.tilesets.push(ts);
//         }

//         MapManager.jsonLoaded = true;
//     },

//     loadMap(path: string): void {
//         const request = new XMLHttpRequest();
//         request.onreadystatechange = () => {
//             if (request.readyState === 4 && request.status === 200) {
//                 MapManager.parseMap(request.responseText);
//             }
//         };
//         request.open('GET', path, true);
//         request.send();
//     },

//     getTileset(tileIndex: number): TileSet | null {
//         for (let i = MapManager.tilesets.length - 1; i >= 0; i--) {
//             if (MapManager.tilesets[i].firstgid <= tileIndex) {
//                 return MapManager.tilesets[i];
//             }
//         }
//         return null;
//     },

//     getTile(tileIndex: number): Tile {
//         const tileSet = this.getTileset(tileIndex);
//         if (!tileSet) {
//             throw new Error(`Tileset not found for tile index: ${tileIndex}`);
//         }
//         const id = tileIndex - tileSet.firstgid; // индекс внутри tileset
//         const x = id % tileSet.xCount;
//         const y = Math.floor(id / tileSet.xCount);
//         return {
//             img: tileSet.image,
//             px: x * MapManager.tSize.x,
//             py: y * MapManager.tSize.y,
//         };
//     },

//     draw(ctx: CanvasRenderingContext2D): void {
//         if (!MapManager.jsonLoaded || !MapManager.imgLoaded) {
//             setTimeout(() => MapManager.draw(ctx), 100);
//             return;
//         }

//         if (!MapManager.tLayer) {
//             for (let id = 0; id < MapManager.mapData.layers.length; id++) {
//                 const layer = MapManager.mapData.layers[id];
//                 if (layer.type === 'tilelayer') {
//                     MapManager.tLayer = layer;
//                     break;
//                 }
//             }
//         }

//         const data: number[] = MapManager.tLayer.data;
//         for (let i = 0; i < data.length; i++) {
//             const gid = data[i];
//             if (gid !== 0) {
//                 const tile = MapManager.getTile(gid);
//                 if (!tile.img) {
//                     continue;
//                 }
//                 let pX = (i % MapManager.xCount) * MapManager.tSize.x;
//                 let pY = Math.floor(i / MapManager.xCount) * MapManager.tSize.y;

//                 // drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
//                 if (!this.isVisible(pX, pY, MapManager.tSize.x, MapManager.tSize.y)) {
//                     continue;
//                 }
//                 pX -= this.view.x;
//                 pY -= this.view.y;
//                 ctx.drawImage(tile.img, tile.px, tile.py, MapManager.tSize.x, MapManager.tSize.y, pX, pY, MapManager.tSize.x, MapManager.tSize.y);
//             }
//         }
//     },

//     isVisible(x: number, y: number, width: number, height: number): boolean {
//         return !(
//             x + width < this.view.x ||
//             y + height < this.view.y ||
//             x > this.view.x + this.view.w ||
//             y > this.view.y + this.view.h
//         );
//     },

//     parseEntities() {
//         if (!MapManager.imgLoaded || !MapManager.jsonLoaded) {
//             setTimeout(() => {
//                 MapManager.parseEntities();
//             }, 100);
//         }
//         for (let j = 0; j < this.mapData.layers.length; j++) {
//             if (this.mapData.layers[j].type === 'objectgroup') {
//                 const entities = this.mapData.layers[j];
//                 for (let i = 0; i < entities.objects.length; i++) {
//                     const e = entities.objects[i];
//                     try {
//                         const obj = Object.create(gameManager.factory[e.type]);
//                         obj.name = e.name;
//                         obj.pos_x = e.x;
//                         obj.pos_y = e.y;
//                         obj.size_x = e.width;
//                         obj.size_y = e.height;
//                         gameManager.entities.push(obj);
//                         if (obj.name === "player")
//                             gameManager.initPlayer(obj);
//                     } catch (ex) {
//                         console.log("Error while creating: [" + e.gid + "] " + e.type +
//                             ", " + ex);
//                     }
//                 }
//             }
//         }
//     },

//     getTilesetldx(x: number, y: number): number {
//         const wX: number = x;
//         const wY: number = y;
//         const idx: number = Math.floor(wY / this.tSize.y) * this.xCount + Math.floor(wX / this.tSize.x);
//         return this.tLayer.data[idx];
//     },

//     centerAt(x: number, y: number): void {
//         if (x < this.view.w / 2) {
//             this.view.x = 0;
//         }
//         else {
//             if (x > this.mapSize.x - this.view.w / 2) {
//                 this.view.x = this.mapSize.x - this.view.w;
//             }
//             else {
//                 this.view.x = x - (this.view.w / 2);
//             }
//         }

//         if (y < this.view.h / 2) {
//             this.view.y = 0;
//         }
//         else {
//             if (y > this.mapSize.y - this.view.h / 2) {
//                 this.view.y = this.mapSize.y - this.view.h;
//             }
//             else {
//                 this.view.y = y - (this.view.h / 2);
//             }
//         }

//     }
// };


export class MapManager {
    mapData: any = null;
    tLayer: any = null;

    xCount: number = 0;
    yCount: number = 0;

    tSize = { x: 64, y: 64 };
    mapSize = { x: 64, y: 64 };
    tilesets: TileSet[] = [];

    imgLoadCount: number = 0
    imgLoaded: boolean = false;
    jsonLoaded: boolean = false;
    view = { x: 0, y: 0, w: 800, h: 600 };

    pasreMap(tilesJSON: string): void {
        MapManagerInstance.mapData = JSON.parse(tilesJSON);
    }
}