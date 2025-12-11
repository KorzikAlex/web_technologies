import { MapManager } from '@/managers';

function getCanvasContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D | null {
    return canvas.getContext('2d');
}

document.addEventListener('DOMContentLoaded', () => {
    const canvas: HTMLCanvasElement = document.getElementById('gameCanvas') as HTMLCanvasElement;
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }

    const ctx: CanvasRenderingContext2D | null = getCanvasContext(canvas);
    if (!ctx) {
        console.error('Unable to get 2D context');
        return;
    }

    const mapManager: MapManager = new MapManager('assets/maps/map1.json');
    mapManager.draw(ctx);
});
