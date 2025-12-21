import type { Entity } from '@/entities';
import type { GameManager } from './GameManager';
import type { MapManager } from './MapManager';
import type { IHaveName, IInteractEntity, IInteractMap, IDrawable, IMovable } from '@/entities/interfaces';

export class PhysicsManager<T extends Entity & IDrawable & IInteractEntity & IInteractMap & IHaveName & IMovable> {
    mapManager: MapManager;
    gameManager: GameManager<T>;

    // Размер тайла для расчётов коллизий
    private readonly TILE_SIZE = 16;
    // Порог для автокоррекции (corner cutting) - насколько пикселей персонаж может быть смещён от прохода
    private readonly CORNER_CUT_THRESHOLD = 10;
    // Скорость автокоррекции
    private readonly CORNER_CUT_SPEED = 1.2;

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

        // Используем минимальный margin для точных коллизий
        const margin = 1;

        // Центрирование по перпендикулярной оси при движении
        // Если двигаемся горизонтально - центрируем по Y
        // Если двигаемся вертикально - центрируем по X
        let adjustedX = newX;
        let adjustedY = newY;

        if (obj.move_x !== 0 && obj.move_y === 0) {
            // Горизонтальное движение - центрируем по Y
            adjustedY = this.alignToGrid(obj.pos_y, obj.speed);
        } else if (obj.move_y !== 0 && obj.move_x === 0) {
            // Вертикальное движение - центрируем по X
            adjustedX = this.alignToGrid(obj.pos_x, obj.speed);
        }

        // Проверяем возможность движения с учётом центрирования
        const canMoveBoth = this.canMove(obj, adjustedX, adjustedY, margin);

        if (canMoveBoth) {
            // Свободное движение с центрированием
            obj.pos_x = adjustedX;
            obj.pos_y = adjustedY;
            return 'move';
        }

        // Пробуем движение без центрирования
        const canMoveOriginal = this.canMove(obj, newX, newY, margin);
        if (canMoveOriginal) {
            obj.pos_x = newX;
            obj.pos_y = newY;
            return 'move';
        }

        // Если движение по обеим осям заблокировано, пробуем раздельное движение
        // с применением автокоррекции (corner cutting)

        const oldX = obj.pos_x;
        const oldY = obj.pos_y;
        let moved = false;

        // Движение по горизонтали (влево/вправо)
        if (obj.move_x !== 0 && obj.move_y === 0) {
            // Пробуем с центрированием по Y
            const alignedY = this.alignToGrid(oldY, obj.speed);
            const canMoveAligned = this.canMove(obj, newX, alignedY, margin);
            if (canMoveAligned) {
                obj.pos_x = newX;
                obj.pos_y = alignedY;
                moved = true;
            } else {
                const canMoveX = this.canMove(obj, newX, oldY, margin);
                if (canMoveX) {
                    obj.pos_x = newX;
                    moved = true;
                } else {
                    // Пробуем автокоррекцию - ищем проход сверху или снизу
                    const correction = this.findVerticalPassage(obj, newX, oldY, margin);
                    if (correction !== 0) {
                        obj.pos_y += correction;
                        moved = true;
                    }
                }
            }
        }
        // Движение по вертикали (вверх/вниз)
        else if (obj.move_y !== 0 && obj.move_x === 0) {
            // Пробуем с центрированием по X
            const alignedX = this.alignToGrid(oldX, obj.speed);
            const canMoveAligned = this.canMove(obj, alignedX, newY, margin);
            if (canMoveAligned) {
                obj.pos_x = alignedX;
                obj.pos_y = newY;
                moved = true;
            } else {
                const canMoveY = this.canMove(obj, oldX, newY, margin);
                if (canMoveY) {
                    obj.pos_y = newY;
                    moved = true;
                } else {
                    // Пробуем автокоррекцию - ищем проход слева или справа
                    const correction = this.findHorizontalPassage(obj, oldX, newY, margin);
                    if (correction !== 0) {
                        obj.pos_x += correction;
                        moved = true;
                    }
                }
            }
        }
        // Диагональное движение
        else {
            // Пробуем движение только по X
            if (obj.move_x !== 0) {
                const canMoveX = this.canMove(obj, newX, oldY, margin);
                if (canMoveX) {
                    obj.pos_x = newX;
                    moved = true;
                }
            }

            // Пробуем движение только по Y
            if (obj.move_y !== 0) {
                const canMoveY = this.canMove(obj, obj.pos_x, newY, margin);
                if (canMoveY) {
                    obj.pos_y = newY;
                    moved = true;
                }
            }
        }

        return moved ? 'slide' : 'break';
    }

    /**
     * Выравнивает координату к ближайшей позиции на тайловой сетке
     */
    private alignToGrid(pos: number, speed: number): number {
        const tilePos = Math.round(pos / this.TILE_SIZE) * this.TILE_SIZE;
        const diff = tilePos - pos;

        // Если разница меньше скорости - выравниваем сразу
        if (Math.abs(diff) <= speed * 1.5) {
            return tilePos;
        }

        // Иначе двигаемся к выровненной позиции
        if (diff > 0) {
            return pos + Math.min(speed, diff);
        } else {
            return pos - Math.min(speed, -diff);
        }
    }

    /**
     * Ищет горизонтальный проход для вертикального движения.
     * Если персонаж пытается идти вверх/вниз, но путь заблокирован,
     * проверяем есть ли проход слева или справа в пределах порога.
     */
    private findHorizontalPassage(obj: T, currentX: number, targetY: number, margin: number): number {
        // Проверяем проходы на позициях, выровненных по тайловой сетке
        const objLeft = currentX;
        const objRight = currentX + obj.size_x;

        // Находим тайлы слева и справа от персонажа
        const leftTileX = Math.floor(objLeft / this.TILE_SIZE) * this.TILE_SIZE;
        const rightTileX = Math.floor(objRight / this.TILE_SIZE) * this.TILE_SIZE;

        // Позиция для выравнивания по левому тайлу
        const alignedLeftX = leftTileX;
        // Позиция для выравнивания по правому тайлу
        const alignedRightX = rightTileX;

        // Проверяем, насколько персонаж смещён от выровненных позиций
        const distanceToLeft = Math.abs(currentX - alignedLeftX);
        const distanceToRight = Math.abs(currentX - alignedRightX);

        // Пробуем сдвинуться влево (к левому тайлу)
        if (distanceToLeft > 0 && distanceToLeft <= this.CORNER_CUT_THRESHOLD) {
            if (this.canMove(obj, alignedLeftX, targetY, margin)) {
                // Есть проход слева - двигаемся туда
                return -Math.min(this.CORNER_CUT_SPEED, distanceToLeft);
            }
        }

        // Пробуем сдвинуться вправо (к правому тайлу)
        if (distanceToRight > 0 && distanceToRight <= this.CORNER_CUT_THRESHOLD) {
            if (this.canMove(obj, alignedRightX, targetY, margin)) {
                // Есть проход справа - двигаемся туда
                return Math.min(this.CORNER_CUT_SPEED, distanceToRight);
            }
        }

        // Дополнительная проверка: ищем ближайший свободный проход в обе стороны
        for (let offset = 1; offset <= this.CORNER_CUT_THRESHOLD; offset++) {
            // Проверяем влево
            if (this.canMove(obj, currentX - offset, targetY, margin)) {
                return -this.CORNER_CUT_SPEED;
            }
            // Проверяем вправо
            if (this.canMove(obj, currentX + offset, targetY, margin)) {
                return this.CORNER_CUT_SPEED;
            }
        }

        return 0;
    }

    /**
     * Ищет вертикальный проход для горизонтального движения.
     * Если персонаж пытается идти влево/вправо, но путь заблокирован,
     * проверяем есть ли проход сверху или снизу в пределах порога.
     */
    private findVerticalPassage(obj: T, targetX: number, currentY: number, margin: number): number {
        // Находим тайлы сверху и снизу от персонажа
        const objTop = currentY;
        const objBottom = currentY + obj.size_y;

        const topTileY = Math.floor(objTop / this.TILE_SIZE) * this.TILE_SIZE;
        const bottomTileY = Math.floor(objBottom / this.TILE_SIZE) * this.TILE_SIZE;

        // Позиции для выравнивания
        const alignedTopY = topTileY;
        const alignedBottomY = bottomTileY;

        // Расстояния до выровненных позиций
        const distanceToTop = Math.abs(currentY - alignedTopY);
        const distanceToBottom = Math.abs(currentY - alignedBottomY);

        // Пробуем сдвинуться вверх
        if (distanceToTop > 0 && distanceToTop <= this.CORNER_CUT_THRESHOLD) {
            if (this.canMove(obj, targetX, alignedTopY, margin)) {
                return -Math.min(this.CORNER_CUT_SPEED, distanceToTop);
            }
        }

        // Пробуем сдвинуться вниз
        if (distanceToBottom > 0 && distanceToBottom <= this.CORNER_CUT_THRESHOLD) {
            if (this.canMove(obj, targetX, alignedBottomY, margin)) {
                return Math.min(this.CORNER_CUT_SPEED, distanceToBottom);
            }
        }

        // Дополнительная проверка: ищем ближайший свободный проход
        for (let offset = 1; offset <= this.CORNER_CUT_THRESHOLD; offset++) {
            // Проверяем вверх
            if (this.canMove(obj, targetX, currentY - offset, margin)) {
                return -this.CORNER_CUT_SPEED;
            }
            // Проверяем вниз
            if (this.canMove(obj, targetX, currentY + offset, margin)) {
                return this.CORNER_CUT_SPEED;
            }
        }

        return 0;
    }

    /**
     * Проверяет, может ли объект переместиться в указанную позицию
     */
    private canMove(obj: T, x: number, y: number, margin: number): boolean {
        // Проверяем 4 угла объекта на новой позиции
        const checkPoints = [
            { x: x + margin, y: y + margin }, // верхний левый
            { x: x + obj.size_x - margin - 1, y: y + margin }, // верхний правый
            { x: x + margin, y: y + obj.size_y - margin - 1 }, // нижний левый
            { x: x + obj.size_x - margin - 1, y: y + obj.size_y - margin - 1 }, // нижний правый
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

        // Проверяем столкновение с другими объектами (Obstacle, Bonus и т.д.)
        const entity = this.entityAtXY(obj, x, y);
        if (entity !== null) {
            if (obj.onTouchEntity) {
                obj.onTouchEntity(entity);
            }
            // Бонусы не блокируют движение, только Obstacle
            if ('name' in entity && entity.name === 'Obstacle') {
                return false;
            }
        }

        // Проверяем столкновение с бомбами
        if (this.gameManager.bombGameManager) {
            for (const bomb of this.gameManager.bombGameManager.entities) {
                // Проверяем коллизию с бомбой
                const noCollision =
                    x + obj.size_x - margin <= bomb.pos_x ||
                    y + obj.size_y - margin <= bomb.pos_y ||
                    x + margin >= bomb.pos_x + bomb.size_x ||
                    y + margin >= bomb.pos_y + bomb.size_y;

                if (!noCollision) {
                    // Есть коллизия - проверяем, может ли игрок проходить через эту бомбу
                    if (bomb.canPassThrough(obj as unknown as Entity)) {
                        continue; // Игрок ещё может проходить через эту бомбу
                    }
                    return false; // Бомба блокирует движение
                } else {
                    // Нет коллизии - если игрок был в списке прохода, убираем его
                    // (он вышел из клетки с бомбой)
                    if (bomb.canPassThrough(obj as unknown as Entity)) {
                        bomb.removePassThrough(obj as unknown as Entity);
                    }
                }
            }
        }

        return true; // Движение разрешено
    }

    /**
     * Находит сущность в указанной позиции с учётом размеров объекта
     */
    entityAtXY(obj: T, x: number, y: number) {
        // Минимальный margin для точного определения коллизий
        const margin = 1;

        for (let i: number = 0; i < this.gameManager.entities.length; ++i) {
            const e = this.gameManager.entities[i];
            if (e.name !== obj.name) {
                // Проверяем пересечение AABB (Axis-Aligned Bounding Box)
                // Два прямоугольника НЕ пересекаются, если выполняется хотя бы одно условие:
                const noCollision =
                    x + obj.size_x - margin <= e.pos_x || // obj полностью слева от e
                    y + obj.size_y - margin <= e.pos_y || // obj полностью выше e
                    x + margin >= e.pos_x + e.size_x ||   // obj полностью справа от e
                    y + margin >= e.pos_y + e.size_y;     // obj полностью ниже e

                if (!noCollision) {
                    return e; // найден пересекающийся объект
                }
            }
        }
        return null; // пересекающихся объектов нет
    }
}
