import type { Entity, Player } from '@/entities';
import type { IDrawable } from '@/entities/interfaces';
import type { EventsManager } from './EventsManager';
import type { MapManager } from './MapManager';

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

    constructor(eventsManager: EventsManager) {
        this.factory = {};
        this.entities = [];
        this.fireNum = 0;
        this.player = null;
        this.laterKill = [];

        this.eventsManager = eventsManager;
        this.mapManager = null;
    }

    setMapManager(mapManager: MapManager): void {
        this.mapManager = mapManager;
    }

    initPlayer(obj: Player): void {
        this.player = obj;
    }

    kill(obj: T): void {
        this.laterKill.push(obj);
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

        // очистка массива laterKill
        if (this.mapManager) {
            this.mapManager.draw(ctx);
            this.mapManager.centerAt(this.player.pos_x, this.player.pos_y);
        }
        this.draw(ctx);
    }

    draw(ctx: CanvasRenderingContext2D) {
        for (let i: number = 0; i < this.entities.length; ++i) {
            this.entities[i].draw(ctx);
        }
    }

    play() {}
}
