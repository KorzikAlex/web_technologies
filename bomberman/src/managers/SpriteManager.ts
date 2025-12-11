export class SpriteManager {
    image: HTMLImageElement;
    sprites: unknown[];

    imgLoaded: boolean;
    jsonLoaded: boolean;

    constructor() {
        this.image = new Image();
        this.sprites = [];

        this.imgLoaded = false;
        this.jsonLoaded = false;
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

    loadImg(imgName: string) {
        this.image.onload = (): void => {
            this.imgLoaded = true;
        };
        this.image.src = imgName;
    }

    parseAtlas(responseText: string): void {
        const atlas: unknown = JSON.parse(responseText);

        for (const name in atlas.frames) {
            const frame = atlas.frames[name].frame;
            this.sprites.push({
                name,
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
        const sprite = this.getSprite(name); // получить спрайт по имени
        if (!mapManager.isVisible(x, y, sprite.w, sprite.h)) return; // не рисуем за пределами видимой зоны
        // сдвигаем видимую зону
        x -= mapManager.view.x;
        y -= mapManager.view.y;
        // отображаем спрайт на холсте
        ctx.drawImage(this.image, sprite.x, sprite.y, sprite.w, sprite.h, x, y, sprite.w, sprite.h);
    }

    getSprite(name: string) {
        for (let i = 0; i < this.sprites.length; ++i) {
            const s = this.sprites[i];
            if (s.name === name) {
                return s;
            }
        }
        return null;
    }
}
