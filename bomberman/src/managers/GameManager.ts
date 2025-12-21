import type { Entity, Player } from '@/entities';
import { Bomb, Explosion } from '@/entities';
import type { IDrawable } from '@/entities/interfaces';
import type { EventsManager } from './EventsManager';
import type { MapManager } from './MapManager';
import { PhysicsManager } from './PhysicsManager';

type EntityCtor<T extends Entity> = {
    prototype: T;
};

type FactoryMap<T extends Entity> = Record<string, EntityCtor<T>>;

export class GameManager<T extends Entity & IDrawable> {
    factory: FactoryMap<T>;
    entities: T[];
    fireNum: number;
    player: null | Player;
    laterKill: T[];

    eventsManager: EventsManager;
    mapManager: MapManager | null;
    physicsManager: PhysicsManager<Player> | null;
    bombGameManager: GameManager<Bomb> | null;
    explosionGameManager: GameManager<Explosion> | null;

    constructor(eventsManager: EventsManager) {
        this.factory = {};
        this.entities = [];
        this.fireNum = 0;
        this.player = null;
        this.laterKill = [];

        this.eventsManager = eventsManager;
        this.mapManager = null;
        this.physicsManager = null;
        this.bombGameManager = null;
        this.explosionGameManager = null;
    }

    setMapManager(mapManager: MapManager): void {
        this.mapManager = mapManager;
        // Инициализируем PhysicsManager после установки MapManager
        // PhysicsManager будет создан для конкретного игрока позже

        // Создаем отдельный GameManager для бомб только если его еще нет
        // Это предотвращает бесконечную рекурсию
        if (!this.bombGameManager) {
            this.bombGameManager = new GameManager<Bomb>(this.eventsManager);
            this.bombGameManager.mapManager = mapManager;
        }

        // Создаем отдельный GameManager для взрывов
        if (!this.explosionGameManager) {
            this.explosionGameManager = new GameManager<Explosion>(this.eventsManager);
            this.explosionGameManager.mapManager = mapManager;
        }
    }

    initPlayer(obj: Player): void {
        this.player = obj;
        // Создаем PhysicsManager для игрока
        if (this.mapManager && !this.physicsManager) {
            this.physicsManager = new PhysicsManager<Player>(this.mapManager, this as unknown as GameManager<Player>);
        }
        // Устанавливаем ссылку на physicsManager
        if (this.physicsManager) {
            obj.physicsManager = this.physicsManager;
        }
        // Устанавливаем ссылку на bombGameManager
        if (this.bombGameManager) {
            obj.gameManager = this.bombGameManager;
        }
        // Устанавливаем ссылку на explosionGameManager
        if (this.explosionGameManager) {
            obj.explosionGameManager = this.explosionGameManager;
        }
        // Устанавливаем ссылку на главный GameManager для доступа к препятствиям
        obj.mainGameManager = this;
    }

    kill(obj: T): void {
        this.laterKill.push(obj);
    }

    killEntity(obj: Entity & IDrawable): void {
        // Универсальный метод для удаления любых сущностей
        this.laterKill.push(obj as T);
    }

    update(ctx: CanvasRenderingContext2D): void {
        if (this.player === null) {
            return;
        }

        // по умолчанию игрок никуда не двигается
        this.player.move_x = 0;
        this.player.move_y = 0;

        // поймали событие - обрабатываем
        if (this.eventsManager.action['up']) {
            this.player.move_y = -1;
        }
        if (this.eventsManager.action['down']) {
            this.player.move_y = 1;
        }
        if (this.eventsManager.action['left']) {
            this.player.move_x = -1;
        }
        if (this.eventsManager.action['right']) {
            this.player.move_x = 1;
        }
        if (this.eventsManager.action['bomb']) {
            this.player.placeBomb();
        }

        // Обновляем игрока
        this.player.update();

        // Обновляем бомбы
        if (this.bombGameManager) {
            this.bombGameManager.entities.forEach((bomb: Bomb): void => {
                bomb.update();
            });
        }

        // Обновляем взрывы
        if (this.explosionGameManager) {
            this.explosionGameManager.entities.forEach((explosion: Explosion): void => {
                explosion.update();
            });
        }

        // обновление информации по всем объектам на карте
        this.entities.forEach((e: T): void => {
            try {
                if ('update' in e && typeof e.update === 'function') {
                    e.update();
                }
            } catch {
                // игнорируем ошибки обновления
            }
        });

        // удаление всех объектов, попавших в laterKill
        for (let i: number = 0; i < this.laterKill.length; ++i) {
            const idx = this.entities.indexOf(this.laterKill[i]);
            if (idx > -1) {
                this.entities.splice(idx, 1); // удаление из массива 1 объекта
            }
        }

        if (this.laterKill.length > 0) {
            this.laterKill.length = 0;
        }

        // Удаление бомб, попавших в laterKill
        if (this.bombGameManager && this.bombGameManager.laterKill.length > 0) {
            for (let i: number = 0; i < this.bombGameManager.laterKill.length; ++i) {
                const idx = this.bombGameManager.entities.indexOf(this.bombGameManager.laterKill[i]);
                if (idx > -1) {
                    this.bombGameManager.entities.splice(idx, 1);
                }
            }
            this.bombGameManager.laterKill.length = 0;
        }

        // Удаление взрывов, попавших в laterKill
        if (this.explosionGameManager && this.explosionGameManager.laterKill.length > 0) {
            for (let i: number = 0; i < this.explosionGameManager.laterKill.length; ++i) {
                const idx = this.explosionGameManager.entities.indexOf(this.explosionGameManager.laterKill[i]);
                if (idx > -1) {
                    this.explosionGameManager.entities.splice(idx, 1);
                }
            }
            this.explosionGameManager.laterKill.length = 0;
        }

        // очистка массива laterKill
        if (this.mapManager) {
            // Используем новый метод для отрисовки карты вместе с сущностями
            this.mapManager.drawWithEntities(ctx, () => {
                // Отрисовка сущностей происходит внутри масштабированного контекста
                this.draw(ctx);
            });
            this.mapManager.centerAt(this.player.pos_x, this.player.pos_y);
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        // Отрисовка бомб (они на земле, рисуем первыми)
        if (this.bombGameManager) {
            for (let i: number = 0; i < this.bombGameManager.entities.length; ++i) {
                this.bombGameManager.entities[i].draw(ctx);
            }
        }

        // Отрисовка взрывов (они на земле, после бомб)
        if (this.explosionGameManager) {
            for (let i: number = 0; i < this.explosionGameManager.entities.length; ++i) {
                this.explosionGameManager.entities[i].draw(ctx);
            }
        }

        // Собираем все сущности (препятствия и игрока) для сортировки по Y
        const drawableEntities: (Entity & IDrawable)[] = [...this.entities];

        // Добавляем игрока в список для отрисовки
        if (this.player) {
            drawableEntities.push(this.player as unknown as Entity & IDrawable);
        }

        // Сортируем по Y-координате (объекты выше рисуются первыми)
        drawableEntities.sort((a, b) => a.pos_y - b.pos_y);

        // Отрисовка в правильном порядке
        for (let i: number = 0; i < drawableEntities.length; ++i) {
            drawableEntities[i].draw(ctx);
        }
    }

    play() {}
}
