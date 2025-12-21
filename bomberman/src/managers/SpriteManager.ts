import type { MapManager } from './';
import type { Atlas } from './types';

type Sprite = {
    name: string;
    x: number;
    y: number;
    w: number;
    h: number;
    image: HTMLImageElement;
};

export class SpriteManager {
    images: Map<string, HTMLImageElement>;
    sprites: Sprite[];

    imgLoaded: boolean;
    jsonLoaded: boolean;

    mapManager: MapManager;

    constructor(mapManager: MapManager) {
        this.images = new Map();
        this.sprites = [];

        this.imgLoaded = false;
        this.jsonLoaded = false;

        this.mapManager = mapManager;
    }

    loadAtlas(atlasJson: string, atlasPath: string): void {
        const request: XMLHttpRequest = new XMLHttpRequest();
        request.onreadystatechange = (): void => {
            if (request.readyState === 4 && request.status === 200) {
                this.parseAtlas(request.responseText, atlasPath);
            }
        };
        request.open('GET', atlasJson, true);
        request.send();
        this.loadImg(atlasPath);
    }

    loadImg(imgName: string): void {
        if (this.images.has(imgName)) {
            return; // Изображение уже загружается или загружено
        }

        const image = new Image();
        image.onload = (): void => {
            this.imgLoaded = true;
        };
        image.src = imgName;
        this.images.set(imgName, image);
    }

    parseAtlas(responseText: string, imagePath: string): void {
        const atlas: Atlas = JSON.parse(responseText);
        const image = this.images.get(imagePath);

        if (!image) {
            console.error(`Image not found for atlas: ${imagePath}`);
            return;
        }

        for (const name in atlas.frames) {
            const frame: { x: number; y: number; w: number; h: number } = atlas.frames[name].frame;
            this.sprites.push({
                name: name,
                x: frame.x,
                y: frame.y,
                w: frame.w,
                h: frame.h,
                image: image,
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
        ctx.drawImage(sprite.image, sprite.x, sprite.y, sprite.w, sprite.h, x, y, sprite.w, sprite.h);
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
