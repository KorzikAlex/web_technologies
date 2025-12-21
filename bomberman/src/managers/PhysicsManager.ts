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

        const newX: number = obj.pos_x + obj.move_x * obj.speed;
        const newY: number = obj.pos_y + obj.move_y * obj.speed;

        const margin = 2; // Отступ от краев для более плавного столкновения

        // Проверяем возможность движения по обеим осям одновременно
        const canMoveBoth = this.canMove(obj, newX, newY, margin);

        if (canMoveBoth) {
            // Свободное движение по обеим осям
            obj.pos_x = newX;
            obj.pos_y = newY;
            return 'move';
        }

        // Если движение по обеим осям заблокировано, пробуем двигаться только по одной оси
        // Это создает эффект скольжения вдоль стен

        // Сохраняем исходные координаты
        const oldX = obj.pos_x;
        const oldY = obj.pos_y;

        let moved = false;

        // Пробуем движение только по оси X (горизонтальное скольжение)
        if (obj.move_x !== 0) {
            const canMoveX = this.canMove(obj, newX, oldY, margin);
            if (canMoveX) {
                obj.pos_x = newX;
                moved = true;
            }
        }

        // Пробуем движение только по оси Y (вертикальное скольжение)
        if (obj.move_y !== 0) {
            const canMoveY = this.canMove(obj, oldX, newY, margin);
            if (canMoveY) {
                obj.pos_y = newY;
                moved = true;
            }
        }

        return moved ? 'slide' : 'break';
    }

    /**
     * Проверяет, может ли объект переместиться в указанную позицию
     */
    private canMove(obj: T, x: number, y: number, margin: number): boolean {
        // Проверяем 4 угла объекта на новой позиции
        const checkPoints = [
            { x: x + margin, y: y + margin }, // верхний левый
            { x: x + obj.size_x - margin, y: y + margin }, // верхний правый
            { x: x + margin, y: y + obj.size_y - margin }, // нижний левый
            { x: x + obj.size_x - margin, y: y + obj.size_y - margin }, // нижний правый
        ];

        // Проверяем, есть ли стена в любой из точек
        for (const point of checkPoints) {
            const ts = this.mapManager.getTilesetIdx(point.x, point.y, 'walls');
            if (ts !== 0) {
                if (obj.onTouchMap) {
                    obj.onTouchMap(ts);
                }
                return false; // Стена блокирует движение
            }
        }

        // Проверяем столкновение с другими объектами
        const entity = this.entityAtXY(obj, x, y);
        if (entity !== null) {
            if (obj.onTouchEntity) {
                obj.onTouchEntity(entity);
            }
            return false; // Объект блокирует движение
        }

        return true; // Движение разрешено
    }

    entityAtXY(obj: T, x: number, y: number) {
        // Используем больший отступ для более комфортного прохода между объектами
        const margin = 3;

        for (let i: number = 0; i < this.gameManager.entities.length; ++i) {
            const e = this.gameManager.entities[i];
            if (e.name !== obj.name) {
                // Проверяем отсутствие пересечения с учетом отступа
                // Если любое из условий истинно - объекты НЕ пересекаются
                if (
                    x + obj.size_x - margin <= e.pos_x || // obj полностью слева от e
                    y + obj.size_y - margin <= e.pos_y || // obj полностью выше e
                    x + margin >= e.pos_x + e.size_x ||   // obj полностью справа от e
                    y + margin >= e.pos_y + e.size_y      // obj полностью ниже e
                ) {
                    continue; // проверка следующего объекта
                }
                return e; // найден пересекающийся объект
            }
        }
        return null; // пересекающихся объектов нет
    }
}
