/**
 * @file MapTileset.ts
 * @description Определяет типы для тайлсета карты.
 * @module managers/types/MapTileset
 */

/**
 * Тип данных для тайлсета карты.
 */
export type MapTileset = {
    /**
     * Первый глобальный идентификатор тайла в этом тайлсете.
     */
    firstgid: number;
    /**
     * Изображение тайлсета.
     */
    image: HTMLImageElement;
    /**
     * Имя тайлсета.
     */
    name: string;
    /**
     * Количество тайлов по горизонтали.
     */
    xCount: number;
    /**
     * Количество тайлов по вертикали.
     */
    yCount: number;
};
