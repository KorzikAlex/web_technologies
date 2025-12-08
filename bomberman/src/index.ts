import { MapManager } from "./managers/MapManager";

function getCanvasContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D | null {
    return canvas.getContext('2d');
}

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }

    const ctx = getCanvasContext(canvas);
    if (!ctx) {
        console.error('Unable to get 2D context');
        return;
    }

    // Укажите корректный путь к вашему JSON, например 'maps/tiledmap.json'
    MapManager.loadMap('tiledmap.json');

    // попытка отрисовки (повторит сама, пока не загрузится)
    MapManager.draw(ctx);
});
