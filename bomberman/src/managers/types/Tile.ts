/**
 * @file Tile.ts
 * @description Определяет типы для тайла карты.
 * @module managers/types/Tile
 */

/**
 * Тип данных для тайла карты.
 */
export type Tile = {
    /**
     * Глобальный идентификатор тайла.
     */
    img: HTMLImageElement | null;
    /**
     * Положение тайла по оси X в пикселях.
     */
    px: number;
    /**
     * Положение тайла по оси Y в пикселях.
     */
    py: number;
};
