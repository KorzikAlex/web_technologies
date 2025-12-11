export class PhysicsManager {
    update(obj: any): string {
        if (obj.move_x === 0 && obj.move_y === 0) {
            return 'stop';
        }

        const newX = obj.pos_x + Math.floor(obj.move_x * obj.speed);
        const newY = obj.pos_y + Math.floor(obj.move_y * obj.speed);

        const ts = mapManager.getTilesetldx(newX + obj.size_x / 2, newY + obj.size_y / 2);
        const e = this.entityAtXY(obj, newX, newY); // объект на пути
        if (e !== null && obj.onTouchEntity) {
            obj.onTouchEntity(e);
        }
        if (ts !== 7 && obj.onTouchМаp) {
            obj.onTouchMap(ts);
        }
        if (ts === 7 && e === null) {
            obj.pos_x = newX;
            obj.pos_y = newY;
            return 'move';
        }
        return 'break';
    }
    entityAtXY(obj: any, newX: any, newY: any) {
        for (var i = 0; i < gameManager.entities.length; i++) {
            var e = gameManager.entities[i]; // Bce o6beKTb Kapты
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
