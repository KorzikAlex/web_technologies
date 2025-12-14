import { EventsManager, GameManager, MapManager } from '@/managers';
import type { Entity } from './entities';
import type { IDrawable } from './entities/interfaces';

function getCanvasContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D | null {
    return canvas.getContext('2d');
}

document.addEventListener('DOMContentLoaded', () => {
    const mapPaths: string[] = ['assets/maps/map1.json', 'assets/maps/map2.json'];

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
    const eventsManager = new EventsManager();

    const gameManager = new GameManager<Entity & IDrawable>(eventsManager);
    const mapManager = new MapManager(mapPaths[0], gameManager);
    gameManager.setMapManager(mapManager);
    
    mapManager.draw(ctx);
});
