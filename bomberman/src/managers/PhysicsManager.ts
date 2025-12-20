import type { Entity } from '@/entities';
import type { GameManager } from './GameManager';
import type { MapManager } from './MapManager';
import type { IHaveName, IInteractEntity, IInteractMap, IDrawable, IMovable } from '@/entities/interfaces';

export class PhysicsManager<T extends Entity & IDrawable & IInteractEntity & IInteractMap & IHaveName & IMovable> {
    mapManager: MapManager;
    gameManager: GameManager<T>;

    constructor(mapManager: MapManager, gameManager: GameManager<T>) {
        this.mapManager = mapManager;
        this.gameManager = gameManager;
    }

    update(obj: T): string {
        if (obj.move_x === 0 && obj.move_y === 0) {
            return 'stop';
        }

        const newX: number = obj.pos_x + Math.floor(obj.move_x * obj.speed);
        const newY: number = obj.pos_y + Math.floor(obj.move_y * obj.speed);

        const ts = this.mapManager.getTilesetIdx(newX + obj.size_x / 2, newY + obj.size_y / 2);
        const e = this.entityAtXY(obj, newX, newY); // объект на пути
        if (e !== null && obj.onTouchEntity) {
            obj.onTouchEntity(e);
        }
        if (ts !== 7 && obj.onTouchMap) {
            obj.onTouchMap(ts);
        }
        if (ts === 7 && e === null) {
            obj.pos_x = newX;
            obj.pos_y = newY;
            return 'move';
        }
        return 'break';
    }

    entityAtXY(obj: T, x: number, y: number) {
        for (let i: number = 0; i < this.gameManager.entities.length; ++i) {
            const e = this.gameManager.entities[i];
            if (e.name !== obj.name) {
                if (
                    x + obj.size_x < e.pos_x || // не пересекаются
                    y + obj.size_y < e.pos_y ||
                    x > e.pos_x + e.size_x ||
                    y > e.pos_y + e.size_y
                ) {
                    continue; // проверка следующего объекта
                }
                return e; // найден пересекающийся объект
            }
        }
        return null; // пересекающихся объектов нет
    }
}
