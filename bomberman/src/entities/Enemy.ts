import type { SpriteManager, MapManager } from '@/managers';
import { Entity } from './Entity';
import type { IDrawable, IHaveName, IMovable, IInteractEntity, IInteractMap } from './interfaces/';

export type EnemyType = 'Slime' | 'Firefly';

export class Enemy extends Entity implements IDrawable, IHaveName, IMovable, IInteractEntity, IInteractMap {
    name: string;
    enemyType: EnemyType;
    move_x: number;
    move_y: number;
    speed: number;
    spriteManager: SpriteManager;
    mapManager: MapManager;

    // Спрайты для анимации
    private animationFrame: number;
    private animationTimer: number;
    private readonly animationSpeed: number = 200; // мс между кадрами

    constructor(
        x: number,
        y: number,
        enemyType: EnemyType,
        spriteManager: SpriteManager,
        mapManager: MapManager,
    ) {
        super(x, y, 16, 16);

        this.enemyType = enemyType;
        this.name = enemyType;
        this.spriteManager = spriteManager;
        this.mapManager = mapManager;

        // Начальное направление движения (случайное)
        this.move_x = 0;
        this.move_y = 0;
        this.chooseRandomDirection();

        // Скорость зависит от типа врага
        this.speed = enemyType === 'Firefly' ? 0.4 : 0.3; // Светлячок быстрее слайма

        // Анимация
        this.animationFrame = 0;
        this.animationTimer = 0;
    }

    /**
     * Выбирает случайное направление движения (только по одной оси)
     */
    private chooseRandomDirection(): void {
        const directions = [
            { x: 1, y: 0 },   // вправо
            { x: -1, y: 0 },  // влево
            { x: 0, y: 1 },   // вниз
            { x: 0, y: -1 },  // вверх
        ];

        const dir = directions[Math.floor(Math.random() * directions.length)];
        this.move_x = dir.x;
        this.move_y = dir.y;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        // Получаем имя спрайта в зависимости от типа и кадра анимации
        const frameNum = this.animationFrame + 1;
        const spriteName = this.enemyType === 'Slime'
            ? `slime_${frameNum}`
            : `firefly_${frameNum}`;

        this.spriteManager.drawSprite(ctx, spriteName, this.pos_x, this.pos_y);
    }

    /**
     * Выравнивает координату к ближайшей позиции на тайловой сетке
     */
    private alignToGrid(pos: number): number {
        const TILE_SIZE = 16;
        const tilePos = Math.round(pos / TILE_SIZE) * TILE_SIZE;
        const diff = tilePos - pos;

        // Если разница меньше скорости - выравниваем сразу
        if (Math.abs(diff) <= this.speed * 1.5) {
            return tilePos;
        }

        // Иначе двигаемся к выровненной позиции
        if (diff > 0) {
            return pos + Math.min(this.speed, diff);
        } else {
            return pos - Math.min(this.speed, -diff);
        }
    }

    update(): void {
        const deltaTime = 16.67; // ~60 FPS

        // Обновляем таймер анимации
        this.animationTimer += deltaTime;
        if (this.animationTimer >= this.animationSpeed) {
            this.animationTimer = 0;
            this.animationFrame = (this.animationFrame + 1) % 2; // 2 кадра анимации
        }

        // Пытаемся двигаться
        if (this.move_x !== 0 || this.move_y !== 0) {
            let newX = this.pos_x + this.move_x * this.speed;
            let newY = this.pos_y + this.move_y * this.speed;

            // Центрирование по перпендикулярной оси
            if (this.move_x !== 0 && this.move_y === 0) {
                // Горизонтальное движение - центрируем по Y
                newY = this.alignToGrid(this.pos_y);
            } else if (this.move_y !== 0 && this.move_x === 0) {
                // Вертикальное движение - центрируем по X
                newX = this.alignToGrid(this.pos_x);
            }

            if (this.canMoveTo(newX, newY)) {
                this.pos_x = newX;
                this.pos_y = newY;
            } else {
                // Пробуем без центрирования
                const origX = this.pos_x + this.move_x * this.speed;
                const origY = this.pos_y + this.move_y * this.speed;

                if (this.canMoveTo(origX, origY)) {
                    this.pos_x = origX;
                    this.pos_y = origY;
                } else {
                    // Упёрлись в препятствие - ищем доступные направления
                    this.findNewDirection();
                }
            }
        }
    }

    /**
     * Находит новое направление при столкновении с препятствием.
     * Выбирает случайное из доступных направлений.
     */
    private findNewDirection(): void {
        const testDistance = this.speed * 2; // Проверяем на небольшом расстоянии
        const availableDirections: { x: number; y: number }[] = [];

        // Все возможные направления
        const directions = [
            { x: 1, y: 0 },   // вправо
            { x: -1, y: 0 },  // влево
            { x: 0, y: 1 },   // вниз
            { x: 0, y: -1 },  // вверх
        ];

        // Проверяем каждое направление
        for (const dir of directions) {
            // Пропускаем текущее направление (в него мы уже упёрлись)
            if (dir.x === this.move_x && dir.y === this.move_y) {
                continue;
            }

            const testX = this.pos_x + dir.x * testDistance;
            const testY = this.pos_y + dir.y * testDistance;

            if (this.canMoveTo(testX, testY)) {
                availableDirections.push(dir);
            }
        }

        // Если есть доступные направления - выбираем случайное
        if (availableDirections.length > 0) {
            const newDir = availableDirections[Math.floor(Math.random() * availableDirections.length)];
            this.move_x = newDir.x;
            this.move_y = newDir.y;
        } else {
            // Если некуда идти - останавливаемся
            this.move_x = 0;
            this.move_y = 0;
        }
    }

    /**
     * Проверяет возможность движения в указанную позицию
     */
    private canMoveTo(x: number, y: number): boolean {
        const margin = 1;

        // Проверяем 4 угла
        const checkPoints = [
            { x: x + margin, y: y + margin },
            { x: x + this.size_x - margin - 1, y: y + margin },
            { x: x + margin, y: y + this.size_y - margin - 1 },
            { x: x + this.size_x - margin - 1, y: y + this.size_y - margin - 1 },
        ];

        // Проверяем стены
        for (const point of checkPoints) {
            const ts = this.mapManager.getTilesetIdx(point.x, point.y, 'walls');
            if (ts !== 0) {
                return false;
            }
        }

        // Проверяем столкновение с Obstacle
        for (const entity of this.mapManager.gameManager.entities) {
            if ('name' in entity && entity.name === 'Obstacle') {
                // AABB коллизия
                if (!(x + this.size_x - margin <= entity.pos_x ||
                      y + this.size_y - margin <= entity.pos_y ||
                      x + margin >= entity.pos_x + entity.size_x ||
                      y + margin >= entity.pos_y + entity.size_y)) {
                    return false;
                }
            }
        }

        // Проверяем столкновение с бомбами
        if (this.mapManager.gameManager.bombGameManager) {
            for (const bomb of this.mapManager.gameManager.bombGameManager.entities) {
                // AABB коллизия с бомбой
                const noCollision =
                    x + this.size_x - margin <= bomb.pos_x ||
                    y + this.size_y - margin <= bomb.pos_y ||
                    x + margin >= bomb.pos_x + bomb.size_x ||
                    y + margin >= bomb.pos_y + bomb.size_y;

                if (!noCollision) {
                    // Есть коллизия - проверяем, может ли враг проходить через эту бомбу
                    if (bomb.canPassThrough(this)) {
                        continue; // Враг ещё может проходить через эту бомбу
                    }
                    return false; // Бомба блокирует движение врага
                } else {
                    // Нет коллизии - если враг был в списке прохода, убираем его
                    if (bomb.canPassThrough(this)) {
                        bomb.removePassThrough(this);
                    }
                }
            }
        }

        return true;
    }

    onTouchEntity<T extends Entity>(_obj: T): void {
        // Враги не взаимодействуют с другими объектами напрямую
    }

    onTouchMap(_tileIndex: number): void {
        // При столкновении со стеной - ищем новое направление (обрабатывается в update)
    }

    /**
     * Уничтожает врага (вызывается при попадании взрыва)
     */
    kill(): void {
        // Враг помечается для удаления через GameManager
    }
}
