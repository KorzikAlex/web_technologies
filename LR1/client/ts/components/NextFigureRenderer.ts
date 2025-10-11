import {Renderer} from "./Renderer";
import type {Figure} from "./Figure";

class NextFigureRenderer extends Renderer<Figure> {
    render(nextFigure: Figure): void {
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const shape = nextFigure.shape;
        const offsetX = Math.floor((this.canvas.width - shape[0]!.length * this.cellSize) / 2);
        const offsetY = Math.floor((this.canvas.height - shape.length * this.cellSize) / 2);

        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y]!.length; x++) {
                if (shape[y]![x]) {
                    this.drawCell(
                        offsetX + x * this.cellSize,
                        offsetY + y * this.cellSize,
                        this.cellSize,
                        nextFigure.color,
                        "black")
                }
            }
        }
    }
}