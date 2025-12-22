/**
 * @file MapManager.ts
 * @description Менеджер для загрузки и управления картой из Tiled.
 * @module managers/MapManager
 */
import {
    Entity,
    Player,
    Obstacle,
    Enemy,
    type EnemyType,
    type IDrawable,
    type IHaveName,
} from '@/entities';
import { GameManager, SpriteManager } from './';
import type {
    TiledMapData,
    Tile,
    Tileset,
    MapTileset,
    TilesLayer,
    ObjectsLayer,
    ObjectProperty,
} from './types';

/**
 * Менеджер для загрузки и управления картой из Tiled.
 */
export class MapManager {
    /**
     * Данные карты из Tiled
     */
    mapData: TiledMapData | null;
    /**
     * Слои тайлов карты
     */
    tileLayers: TilesLayer[];
    /**
     * Количество тайлов по оси X
     */
    xCount: number;
    /**
     * Количество тайлов по оси Y
     */
    yCount: number;
    /**
     * Размер тайла в пикселях
     */
    tSize: Record<string, number>;
    /**
     * Размер карты в пикселях
     */
    mapSize: Record<string, number>;
    /**
     * Тайлсеты карты
     */
    tilesets: MapTileset[];
    /**
     * Количество загруженных изображений тайлсетов
     */
    imgLoadCount: number;
    /**
     * Флаг полной загрузки изображений тайлсетов
     */
    imgLoaded: boolean;
    /**
     * Флаг полной загрузки JSON карты
     */
    jsonLoaded: boolean;
    /**
     * Просмотр карты (кадр камеры)
     */
    view: Record<string, number>;
    /**
     * Масштаб отображения карты
     */
    scale: number;
    /**
     * Менеджер игры
     */
    gameManager: GameManager<Entity & IDrawable>;
    /**
     * Путь к файлу карты JSON
     */
    mapPath: string;

    /**
     * Сохранённое количество жизней игрока при переходе между уровнями
     */
    private savedPlayerLives: number;
    /**
     * Сохранённое имя игрока при переходе между уровнями
     */
    private savedPlayerName: string;

    /**
     * Конструктор MapManager
     * @constructor
     * @param jsonPath
     * @param gameManager
     */
    constructor(jsonPath: string, gameManager: GameManager<Entity & IDrawable>) {
        this.mapData = null;
        this.tileLayers = [];
        this.tilesets = [];

        this.imgLoadCount = 0;
        this.imgLoaded = false;
        this.jsonLoaded = false;

        this.xCount = 0;
        this.yCount = 0;

        this.tSize = { x: 0, y: 0 };
        this.mapSize = { x: 0, y: 0 };

        this.view = { x: 0, y: 0, w: 800, h: 600 };
        this.scale = 1;

        this.gameManager = gameManager;
        this.mapPath = jsonPath;

        this.savedPlayerLives = 5;
        this.savedPlayerName = 'Player';

        this.loadMap(jsonPath);
    }

    /**
     * Загружает новую карту (для перехода на следующий уровень)
     */
    loadNewMap(path: string, playerLives: number = 5, playerName: string = 'Player'): void {
        console.log(`Loading new map: ${path}, player lives: ${playerLives}`);

        // Сохраняем параметры игрока
        this.savedPlayerLives = playerLives;
        this.savedPlayerName = playerName;

        // Сбрасываем состояние карты
        this.mapData = null;
        this.tileLayers = [];
        this.tilesets = [];

        this.imgLoadCount = 0;
        this.imgLoaded = false;
        this.jsonLoaded = false;

        this.xCount = 0;
        this.yCount = 0;

        this.tSize = { x: 0, y: 0 };
        this.mapSize = { x: 0, y: 0 };

        this.scale = 1;
        this.mapPath = path;

        // Загружаем новую карту
        this.loadMap(path);
    }

    /**
     * Вычисляет масштаб карты для вписывания в canvas
     * @param canvasWidth Ширина canvas
     * @param canvasHeight Высота canvas
     * @returns Масштаб карты
     */
    private calculateScale(canvasWidth: number, canvasHeight: number): number {
        const scaleX: number = canvasWidth / this.mapSize.x;
        const scaleY: number = canvasHeight / this.mapSize.y;

        // Используем минимальный масштаб для сохранения пропорций
        return Math.min(scaleX, scaleY);
    }

    /**
     * Преобразует относительный путь в абсолютный на основе базового пути
     * @param relativePath Относительный путь
     * @param basePath Базовый путь
     * @returns Абсолютный путь
     */
    private resolveRelativePath(relativePath: string, basePath: string): string {
        // Если путь уже абсолютный, возвращаем его
        if (relativePath.startsWith('/') || relativePath.startsWith('http')) {
            return relativePath;
        }

        // Получаем директорию базового пути
        const baseDir: string = basePath.substring(0, basePath.lastIndexOf('/'));

        // Разбиваем пути на части
        const baseParts: string[] = baseDir.split('/').filter((p: string): string => p);
        const relativeParts: string[] = relativePath.split('/').filter((p: string): string => p);

        // Обрабатываем ".." в относительном пути
        for (const part of relativeParts) {
            if (part === '..') {
                baseParts.pop();
            } else if (part !== '.') {
                baseParts.push(part);
            }
        }

        return '/' + baseParts.join('/');
    }

    /**
     * Загружает карту из указанного пути
     * @param path Путь к файлу карты JSON
     */
    private loadMap(path: string): void {
        console.log('Loading map from:', path);

        // Формируем правильный URL для Vite dev сервера
        const url: string = new URL(path, window.location.origin).href;
        console.log('Full URL:', url);

        fetch(url)
            .then((response: Response): Promise<string> => {
                console.log(
                    'Response status:',
                    response.status,
                    'Content-Type:',
                    response.headers.get('Content-Type'),
                );
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            })
            .then((text: string): void => {
                this.parseMap(text);
            })
            .catch((error: Error): void => {
                console.error(`Failed to load map: ${path}`, error);
            });
    }
    /**
     * Парсит JSON карты и инициализирует слои и тайлсеты
     * @param tilesJSON JSON карта в виде строки
     * @returns void
     */
    private parseMap(tilesJSON: string): void {
        try {
            // Проверяем, что получили JSON, а не HTML
            if (tilesJSON.trim().startsWith('<!DOCTYPE') || tilesJSON.trim().startsWith('<html')) {
                console.error(
                    'Received HTML instead of JSON. Response starts with:',
                    tilesJSON.substring(0, 100),
                );
                return;
            }
            this.mapData = JSON.parse(tilesJSON) as TiledMapData;
        } catch (error) {
            console.error('Failed to parse map JSON:', error);
            console.error('Response text:', tilesJSON.substring(0, 200));
            return;
        }

        this.xCount = this.mapData.width;
        this.yCount = this.mapData.height;

        this.tSize.x = this.mapData.tilewidth;
        this.tSize.y = this.mapData.tileheight;

        this.mapSize.x = this.xCount * this.tSize.x;
        this.mapSize.y = this.yCount * this.tSize.y;

        // Инициализируем tileLayers сразу после загрузки карты
        console.log(`Total layers: ${this.mapData.layers.length}`);
        const tempLayers: TilesLayer[] = [];

        for (let id: number = 0; id < this.mapData.layers.length; ++id) {
            const layer = this.mapData.layers[id];
            console.log(`Layer ${id}: type="${layer.type}", name="${layer.name}"`);
            if (layer.type === 'tilelayer') {
                tempLayers.push(layer as TilesLayer);
            }
        }

        // Сортируем слои по имени: field, walls, obstacles
        const layerOrder: string[] = ['field', 'walls', 'obstacles'];
        this.tileLayers = tempLayers.sort((a: TilesLayer, b: TilesLayer): number => {
            const indexA: number = layerOrder.indexOf(a.name);
            const indexB: number = layerOrder.indexOf(b.name);
            return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
        });

        console.log('Layer render order:', this.tileLayers.map((l) => l.name).join(' → '));

        for (let i: number = 0; i < this.mapData.tilesets.length; ++i) {
            const tileset: Tileset = this.mapData.tilesets[i];

            // Если тайлсет внешний (с полем source), загружаем его
            if (tileset.source) {
                // Преобразуем относительный путь в абсолютный
                const absolutePath: string = this.resolveRelativePath(tileset.source, this.mapPath);
                this.loadExternalTileset(absolutePath, tileset.firstgid, tileset.source);
            } else if (tileset.image) {
                // Если тайлсет встроенный
                const absoluteImagePath: string = this.resolveRelativePath(
                    tileset.image,
                    this.mapPath,
                );
                const tilesetWithAbsolutePath = { ...tileset, image: absoluteImagePath };
                this.loadTilesetImage(tilesetWithAbsolutePath, tileset.firstgid);
            }
        }

        this.jsonLoaded = true;

        // Запускаем парсинг сущностей после загрузки карты
        this.parseEntities();
    }
    /**
     * Загружает внешний тайлсет из указанного пути
     * @param absolutePath Абсолютный путь к файлу тайлсета
     * @param firstgid Первый GID тайлсета
     * @param originalPath Оригинальный путь к файлу тайлсета (для логов)
     */
    private loadExternalTileset(
        absolutePath: string,
        firstgid: number,
        originalPath: string,
    ): void {
        console.log('Loading tileset:', originalPath, '-> resolved to:', absolutePath);

        const url: string = new URL(absolutePath, window.location.origin).href;
        console.log('Tileset full URL:', url);

        fetch(url)
            .then((response: Response): Promise<string> => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            })
            .then((text: string): void => {
                try {
                    const tilesetData: Tileset = JSON.parse(text) as Tileset;
                    // Преобразуем путь к изображению тайлсета
                    if (tilesetData.image) {
                        const absoluteImagePath: string = this.resolveRelativePath(
                            tilesetData.image,
                            absolutePath,
                        );
                        tilesetData.image = absoluteImagePath;
                    }
                    this.loadTilesetImage(tilesetData, firstgid);
                } catch (error) {
                    console.error(`Failed to parse tileset JSON: ${absolutePath}`, error);
                    console.error('Response:', text.substring(0, 200));
                }
            })
            .catch((error: Error): void => {
                console.error(`Failed to load tileset: ${absolutePath}`, error);
            });
    }
    /**
     * Загружает изображение тайлсета и сохраняет его
     * @param tileset Тайлсет для загрузки
     * @param firstgid Первый GID тайлсета
     * @returns void
     */
    private loadTilesetImage(tileset: Tileset, firstgid: number): void {
        if (!tileset.image) {
            console.error('Tileset has no image');
            return;
        }

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

        img.src = tileset.image;

        this.tilesets.push({
            firstgid: firstgid,
            image: img,
            name: tileset.name || '',
            xCount: Math.floor((tileset.imagewidth || 0) / this.tSize.x),
            yCount: Math.floor((tileset.imageheight || 0) / this.tSize.y),
        });
    }
    /**
     * Отрисовывает карту на указанном контексте
     * @param ctx Контекст canvas для отрисовки
     * @return void
     */
    draw(ctx: CanvasRenderingContext2D): void {
        if (!this.imgLoaded || !this.jsonLoaded || this.mapData === null) {
            // Карта ещё не готова - сохраняем контекст (для drawWithEntities) и выходим
            ctx.save();
            return;
        }

        // Вычисляем масштаб и настраиваем canvas при первой отрисовке
        if (this.scale === 1) {
            // Вычисляем масштаб
            this.scale = this.calculateScale(ctx.canvas.width, ctx.canvas.height);

            // Адаптируем canvas под размер карты
            const scaledWidth: number = Math.floor(this.mapSize.x * this.scale);
            const scaledHeight: number = Math.floor(this.mapSize.y * this.scale);

            if (ctx.canvas.width !== scaledWidth || ctx.canvas.height !== scaledHeight) {
                ctx.canvas.width = scaledWidth;
                ctx.canvas.height = scaledHeight;
                // Пересчитываем масштаб после изменения размера canvas
                this.scale = this.calculateScale(ctx.canvas.width, ctx.canvas.height);
            }

            console.log(
                `Map size: ${this.mapSize.x}x${this.mapSize.y}, Canvas: ${ctx.canvas.width}x${ctx.canvas.height}, Scale: ${this.scale.toFixed(2)}`,
            );
            console.log(`Loaded ${this.tileLayers.length} tile layers`);
        }

        // Сохраняем состояние контекста (всегда, даже если нечего рисовать)
        ctx.save();

        if (this.tileLayers.length === 0) {
            // НЕ восстанавливаем - это сделает drawWithEntities
            return;
        }

        // Отключаем сглаживание для pixel-art
        ctx.imageSmoothingEnabled = false;

        // Применяем масштабирование
        ctx.scale(this.scale, this.scale);

        // Отрисовываем все слои по порядку
        for (const tilesLayer of this.tileLayers) {
            this.drawLayer(ctx, tilesLayer);
        }
    }

    /**
     * Отрисовывает карту вместе с сущностями
     * @param ctx Контекст canvas для отрисовки
     * @param drawEntitiesCallback Функция обратного вызова для отрисовки сущностей
     * @returns void
     */
    drawWithEntities(ctx: CanvasRenderingContext2D, drawEntitiesCallback: () => void): void {
        // Проверяем готовность карты
        if (!this.imgLoaded || !this.jsonLoaded || this.mapData === null) {
            // Карта ещё не загружена - только запускаем отложенную отрисовку
            this.draw(ctx);
            return;
        }

        this.draw(ctx);

        // Рисуем сущности в том же масштабированном контексте
        drawEntitiesCallback();

        // Восстанавливаем контекст после всего
        ctx.restore();
    }
    /**
     * Отрисовывает один слой тайлов
     * @param ctx Контекст canvas
     * @param tilesLayer Слой тайлов для отрисовки
     */
    private drawLayer(ctx: CanvasRenderingContext2D, tilesLayer: TilesLayer): void {
        // Флаги отражения/поворота из Tiled
        const FLIPPED_HORIZONTALLY_FLAG: number = 0x80000000;
        const FLIPPED_VERTICALLY_FLAG: number = 0x40000000;
        const FLIPPED_DIAGONALLY_FLAG: number = 0x20000000;

        // Небольшое перекрытие для устранения зазоров
        const overlap: number = 0.5;

        for (let i: number = 0; i < tilesLayer.data.length; ++i) {
            const tileIndex: number = tilesLayer.data[i];

            if (tileIndex === 0) {
                continue;
            }

            // Извлекаем флаги
            const flippedH: boolean = (tileIndex & FLIPPED_HORIZONTALLY_FLAG) !== 0;
            const flippedV: boolean = (tileIndex & FLIPPED_VERTICALLY_FLAG) !== 0;
            const flippedD: boolean = (tileIndex & FLIPPED_DIAGONALLY_FLAG) !== 0;

            const tile: Tile = this.getTile(tileIndex);

            // Вычисляем позицию тайла
            const tileX: number = i % this.xCount;
            const tileY: number = Math.floor(i / this.xCount);

            let pX: number = tileX * this.tSize.x;
            let pY: number = tileY * this.tSize.y;

            if (!this.isVisible(pX, pY, this.tSize.x, this.tSize.y)) {
                continue;
            }

            pX -= this.view.x;
            pY -= this.view.y;

            if (!tile.img) {
                continue;
            }

            ctx.save();

            // Применяем трансформации для отражённых тайлов
            if (flippedH || flippedV || flippedD) {
                // Перемещаем origin в центр тайла
                ctx.translate(pX + this.tSize.x / 2, pY + this.tSize.y / 2);

                // Применяем отражения
                if (flippedD) {
                    // Диагональное отражение = поворот на 90° + горизонтальное отражение
                    ctx.rotate(Math.PI / 2);
                    ctx.scale(-1, 1);
                }
                if (flippedH) {
                    ctx.scale(-1, 1);
                }
                if (flippedV) {
                    ctx.scale(1, -1);
                }

                // Отрисовываем относительно центра с перекрытием
                ctx.drawImage(
                    tile.img,
                    tile.px,
                    tile.py,
                    this.tSize.x,
                    this.tSize.y,
                    -this.tSize.x / 2 - overlap,
                    -this.tSize.y / 2 - overlap,
                    this.tSize.x + overlap * 2,
                    this.tSize.y + overlap * 2,
                );
            } else {
                // Обычная отрисовка без трансформаций с перекрытием
                ctx.drawImage(
                    tile.img,
                    tile.px,
                    tile.py,
                    this.tSize.x,
                    this.tSize.y,
                    pX - overlap,
                    pY - overlap,
                    this.tSize.x + overlap * 2,
                    this.tSize.y + overlap * 2,
                );
            }

            ctx.restore();
        }
    }
    /**
     * Проверяет, виден ли прямоугольник в текущем просмотре
     * @param x Координата X прямоугольника
     * @param y Координата Y прямоугольника
     * @param width Ширина прямоугольника
     * @param height Высота прямоугольника
     * @return true, если прямоугольник виден, иначе false
     */
    isVisible(x: number, y: number, width: number, height: number): boolean {
        return !(
            x + width < this.view.x ||
            x > this.view.x + this.view.w ||
            y + height < this.view.y ||
            y > this.view.y + this.view.h
        );
    }
    /**
     * Получает тайл по его индексу
     * @param tileIndex Индекс тайла
     * @returns Тайл
     */
    getTile(tileIndex: number): Tile {
        const tile: Tile = {
            img: null,
            px: 0,
            py: 0,
        };

        // Обработка флагов отражения/поворота из Tiled
        // Флаги в старших битах: FLIP_HORIZONTAL = 0x80000000, FLIP_VERTICAL = 0x40000000, FLIP_DIAGONAL = 0x20000000
        const FLIPPED_HORIZONTALLY_FLAG: number = 0x80000000;
        const FLIPPED_VERTICALLY_FLAG: number = 0x40000000;
        const FLIPPED_DIAGONALLY_FLAG: number = 0x20000000;

        // Извлекаем реальный GID без флагов
        const realGID: number =
            tileIndex &
            ~(FLIPPED_HORIZONTALLY_FLAG | FLIPPED_VERTICALLY_FLAG | FLIPPED_DIAGONALLY_FLAG);

        const tileset: MapTileset | null = this.getTileset(realGID);

        if (tileset === null) {
            return tile;
        }

        tile.img = tileset.image;
        const id: number = realGID - tileset.firstgid;

        const x: number = id % tileset.xCount;
        const y: number = Math.floor(id / tileset.xCount);

        tile.px = x * this.tSize.x;
        tile.py = y * this.tSize.y;

        // Сохраняем флаги для отрисовки (добавим позже если нужно)
        return tile;
    }

    /**
     * Получает тайлсет для заданного индекса тайла
     * @param tileIndex Индекс тайла
     * @return Тайлсет или null, если не найден
     */
    getTileset(tileIndex: number): MapTileset | null {
        for (let i: number = this.tilesets.length - 1; i >= 0; --i) {
            if (this.tilesets[i].firstgid <= tileIndex) {
                return this.tilesets[i];
            }
        }
        return null;
    }
    /**
     * Парсит сущности из слоев объектов карты и создает их
     */
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
                console.log(
                    `Processing layer: ${entities.name}, objects: ${entities.objects.length}`,
                );
                for (let i: number = 0; i < entities.objects.length; ++i) {
                    const e: ObjectProperty = entities.objects[i];
                    try {
                        // Создаем объекты по имени (name), а не по type
                        if (e.name === 'Player') {
                            // Выравниваем позицию игрока по тайловой сетке
                            const tileSize: number = 16;
                            const alignedX: number = Math.round(e.x / tileSize) * tileSize;
                            const alignedY: number =
                                Math.round((e.y - e.height) / tileSize) * tileSize;

                            console.log(`Creating Player at (${alignedX}, ${alignedY})`);
                            // Создаем игрока
                            const spriteManager: SpriteManager = new SpriteManager(this);
                            // Загружаем атлас спрайтов для игрока
                            spriteManager.loadAtlas(
                                '/assets/atlas/player.json',
                                '/assets/images/Player.png',
                            );
                            // Загружаем атлас спрайтов для бомб
                            spriteManager.loadAtlas(
                                '/assets/atlas/bomb.json',
                                '/assets/images/bomb.png',
                            );
                            // Загружаем атлас спрайтов для препятствий
                            spriteManager.loadAtlas(
                                '/assets/atlas/obstacle.json',
                                '/assets/images/PeaceTown.png',
                            );
                            // Загружаем атлас спрайтов для бонусов
                            spriteManager.loadAtlas(
                                '/assets/atlas/bonus.json',
                                '/assets/images/bonus.png',
                            );

                            const player = new Player(
                                alignedX,
                                alignedY,
                                e.width,
                                e.height,
                                100,
                                0,
                                0,
                                0.25, // Оптимальная скорость для комфортного управления
                                spriteManager,
                            );

                            // Восстанавливаем параметры игрока при переходе между уровнями
                            player.lives = this.savedPlayerLives;
                            player.name = this.savedPlayerName;

                            this.gameManager.entities.push(player);
                            this.gameManager.initPlayer(player);
                        } else if (this.gameManager.factory[e.type]) {
                            // Создаем другие объекты через фабрику
                            const obj: Entity & IDrawable & IHaveName = Object.create(
                                this.gameManager.factory[e.type],
                            );
                            obj.name = e.name;
                            obj.pos_x = e.x;
                            obj.pos_y = e.y;
                            obj.size_x = e.width;
                            obj.size_y = e.height;
                            this.gameManager.entities.push(obj);
                        }
                    } catch (error) {
                        console.error(`Error while creating: ["${e.gid}"]${e.name}, ${error}`);
                    }
                }
            }
        }

        // Генерируем разрушаемые препятствия после создания игрока
        this.generateObstacles();
    }

    /**
     * Генерирует разрушаемые препятствия на карте
     */
    private generateObstacles(): void {
        if (!this.gameManager.player) {
            return; // Игрок еще не создан
        }

        const tileSize: number = 16;
        const player: Player = this.gameManager.player;
        const playerTileX: number = Math.floor(player.pos_x / tileSize);
        const playerTileY: number = Math.floor(player.pos_y / tileSize);
        const safeZoneRadius: number = 2; // Радиус безопасной зоны вокруг игрока (в тайлах)

        // Флаги из Tiled для очистки GID
        const FLIPPED_HORIZONTALLY_FLAG: number = 0x80000000;
        const FLIPPED_VERTICALLY_FLAG: number = 0x40000000;
        const FLIPPED_DIAGONALLY_FLAG: number = 0x20000000;
        const FLAGS_MASK: number =
            FLIPPED_HORIZONTALLY_FLAG | FLIPPED_VERTICALLY_FLAG | FLIPPED_DIAGONALLY_FLAG;

        // Создаем SpriteManager для препятствий (можно использовать тот же, что у игрока)
        const spriteManager: SpriteManager = player.spriteManager;

        // Собираем все свободные позиции на карте
        const freeTiles: { x: number; y: number }[] = [];

        for (let tileY: number = 0; tileY < this.yCount; tileY++) {
            for (let tileX: number = 0; tileX < this.xCount; tileX++) {
                const worldX: number = tileX * tileSize;
                const worldY: number = tileY * tileSize;

                // Проверка 1: Не слишком близко к игроку
                const distX: number = Math.abs(tileX - playerTileX);
                const distY: number = Math.abs(tileY - playerTileY);
                if (distX <= safeZoneRadius && distY <= safeZoneRadius) {
                    continue;
                }

                // Проверка 2: Нет стены на этой позиции
                const wallTileIdxRaw: number = this.getTilesetIdx(worldX, worldY, 'walls');
                const wallTileIdx: number = wallTileIdxRaw & ~FLAGS_MASK;
                if (wallTileIdx !== 0) {
                    continue; // Есть стена - пропускаем
                }

                // Не размещаем на границах карты (первые 2 и последние 2 колонки/строки)
                if (
                    tileX < 2 ||
                    tileX >= this.xCount - 2 ||
                    tileY < 1 ||
                    tileY >= this.yCount - 1
                ) {
                    continue;
                }

                freeTiles.push({ x: tileX, y: tileY });
            }
        }

        // Перемешиваем массив свободных тайлов (алгоритм Фишера-Йетса)
        for (let i = freeTiles.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [freeTiles[i], freeTiles[j]] = [freeTiles[j], freeTiles[i]];
        }

        // Количество препятствий - 40-50% свободного поля
        const obstacleCount: number = Math.floor(freeTiles.length * 0.35);

        // Создаем препятствия
        for (let i: number = 0; i < obstacleCount && i < freeTiles.length; i++) {
            const tile: { x: number; y: number } = freeTiles[i];
            const worldX: number = tile.x * tileSize;
            const worldY: number = tile.y * tileSize;

            const obstacle: Obstacle = new Obstacle(worldX, worldY, spriteManager);
            this.gameManager.entities.push(obstacle);
        }

        console.log(
            `Generated ${Math.min(obstacleCount, freeTiles.length)} obstacles out of ${freeTiles.length} free tiles`,
        );

        // Генерируем врагов
        this.generateEnemies();
    }

    /**
     * Генерирует врагов на карте
     */
    private generateEnemies(): void {
        if (!this.gameManager.player) {
            return;
        }

        const tileSize: number = 16;
        const player: Player = this.gameManager.player;
        const playerTileX: number = Math.floor(player.pos_x / tileSize);
        const playerTileY: number = Math.floor(player.pos_y / tileSize);
        const safeZoneRadius: number = 4; // Враги не спавнятся близко к игроку

        // Флаги из Tiled
        const FLIPPED_HORIZONTALLY_FLAG: number = 0x80000000;
        const FLIPPED_VERTICALLY_FLAG: number = 0x40000000;
        const FLIPPED_DIAGONALLY_FLAG: number = 0x20000000;
        const FLAGS_MASK: number =
            FLIPPED_HORIZONTALLY_FLAG | FLIPPED_VERTICALLY_FLAG | FLIPPED_DIAGONALLY_FLAG;

        // Определяем количество врагов в зависимости от карты
        const isMap1: boolean = this.mapPath.includes('map1');
        const enemyCount: number = isMap1 ? 2 : 3;

        // SpriteManager для врагов
        const spriteManager: SpriteManager = new SpriteManager(this);
        spriteManager.loadAtlas('/assets/atlas/enemies.json', '/assets/images/Enemies.png');

        // Собираем свободные позиции для спавна врагов
        const freeSpawnTiles: { x: number; y: number }[] = [];

        for (let tileY: number = 0; tileY < this.yCount; tileY++) {
            for (let tileX: number = 0; tileX < this.xCount; tileX++) {
                const worldX: number = tileX * tileSize;
                const worldY: number = tileY * tileSize;

                // Не близко к игроку
                const distX: number = Math.abs(tileX - playerTileX);
                const distY: number = Math.abs(tileY - playerTileY);
                if (distX <= safeZoneRadius && distY <= safeZoneRadius) {
                    continue;
                }

                // Нет стены
                const wallTileIdxRaw: number = this.getTilesetIdx(worldX, worldY, 'walls');
                const wallTileIdx: number = wallTileIdxRaw & ~FLAGS_MASK;
                if (wallTileIdx !== 0) {
                    continue;
                }

                // Не на границах
                if (
                    tileX < 2 ||
                    tileX >= this.xCount - 2 ||
                    tileY < 1 ||
                    tileY >= this.yCount - 1
                ) {
                    continue;
                }

                // Не на препятствии
                let hasObstacle: boolean = false;
                for (const entity of this.gameManager.entities) {
                    if ('name' in entity && entity.name === 'Obstacle') {
                        const obsTileX: number = Math.floor(entity.pos_x / tileSize);
                        const obsTileY: number = Math.floor(entity.pos_y / tileSize);
                        if (obsTileX === tileX && obsTileY === tileY) {
                            hasObstacle = true;
                            break;
                        }
                    }
                }
                if (hasObstacle) {
                    continue;
                }

                freeSpawnTiles.push({ x: tileX, y: tileY });
            }
        }

        // Перемешиваем
        for (let i: number = freeSpawnTiles.length - 1; i > 0; i--) {
            const j: number = Math.floor(Math.random() * (i + 1));
            [freeSpawnTiles[i], freeSpawnTiles[j]] = [freeSpawnTiles[j], freeSpawnTiles[i]];
        }

        // Создаём врагов
        const enemyTypes: EnemyType[] = ['Slime', 'Firefly'];
        for (let i: number = 0; i < enemyCount && i < freeSpawnTiles.length; i++) {
            const tile = freeSpawnTiles[i];
            const worldX: number = tile.x * tileSize;
            const worldY: number = tile.y * tileSize;

            // Чередуем типы врагов
            const enemyType: EnemyType = enemyTypes[i % enemyTypes.length];
            const enemy: Enemy = new Enemy(worldX, worldY, enemyType, spriteManager, this);
            this.gameManager.entities.push(enemy);
        }

        console.log(`Generated ${Math.min(enemyCount, freeSpawnTiles.length)} enemies`);
    }
    /**
     * Получает индекс тайлсета по координатам и имени слоя
     * @param x координата X
     * @param y координата Y
     * @param layerName имя слоя
     * @returns индекс тайлсета
     */
    getTilesetIdx(x: number, y: number, layerName?: string): number {
        const wX: number = x;
        const wY: number = y;
        const idx = Math.floor(wY / this.tSize.y) * this.xCount + Math.floor(wX / this.tSize.x);

        // Если указано имя слоя, ищем в нём
        if (layerName) {
            const layer: TilesLayer | undefined = this.tileLayers.find((l: TilesLayer): boolean => {
                return l.name === layerName;
            });
            if (layer) {
                return layer.data[idx];
            }
        }

        // Иначе проверяем все слои и возвращаем первый непустой тайл
        for (const layer of this.tileLayers) {
            if (layer.data[idx] !== 0) {
                return layer.data[idx];
            }
        }

        return 0;
    }

    /**
     * Центрирует просмотр карты на указанных координатах
     * @param x Координата X
     * @param y Координата Y
     */
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
