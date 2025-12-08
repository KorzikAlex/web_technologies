
export const GameManager = {
    factory: {},
    entities: [],
    fireNum: 0,
    player: null,
    laterKill: [],
    initPlayer: function (playerObj: any) {
        this.player = playerObj;
    },

    kill: function (obj: any) {
        this.laterKill.push(obj);
    },
    update: function () { },
    draw: function (ctx: CanvasRenderingContext2D) {
        for (let i = 0; i < this.entities.length; i++) {
            this.entities[i].draw(ctx);
        }
    },
    loadAll: function () {},
    play: function () { }

}