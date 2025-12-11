import type { Entity, Player } from '@/entities';

export class GameManager {
    factory: unknown;
    entities: Entity[];
    fireNum: number;
    player: null | Player;
    laterKill: [];

    constructor() {
        this.factory = {};
        this.entities = [];
        this.fireNum = 0;
        this.player = null;
        this.laterKill = [];
    }

    initPlayer(obj: Player): void {
        this.player = obj;
    }

    kill(obj: Entity): void {
        this.laterKill.push(obj);
    }

    update() {}

    draw(ctx: CanvasRenderingContext2D) {
        for (let i = 0; i < this.entities.length; i++) {
            this.entities[i].draw(ctx);
        }
    }

    loadAll() {}

    play() {}
}
