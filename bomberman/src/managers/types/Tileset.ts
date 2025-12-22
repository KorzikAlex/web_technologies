/**
 * @file Tileset.ts
 * @description Определяет типы для тайлсета карты.
 * @module managers/types/Tileset
 */

/**
 * Тип данных для тайлсета карты.
 */
export type Tileset = {
    /**
     * Первый глобальный идентификатор тайла в этом тайлсете.
     */
    firstgid: number;
    /**
     * Источник тайлсета.
     */
    source?: string;
    /**
     * Изображение тайлсета.
     */
    image?: string;
    /**
     * Высота изображения тайлсета в пикселях.
     */
    imageheight?: number;
    /**
     * Ширина изображения тайлсета в пикселях.
     */
    imagewidth?: number;
    /**
     * Отступ между тайлами в пикселях.
     */
    margin?: number;
    /**
     * Имя тайлсета.
     */
    name?: string;
    /**
     * Дополнительные свойства тайлсета.
     */
    properties?: { name: string; value: string | number | boolean; type: string }[];
    /**
     * Отступ между рядами тайлов в пикселях.
     */
    spacing?: number;
    /**
     * Высота тайла в пикселях.
     */
    tileheight?: number;
    /**
     * Ширина тайла в пикселях.
     */
    tilewidth?: number;
    /**
     * Количество столбцов в тайлсете.
     */
    columns?: number;
    /**
     * Общее количество тайлов в тайлсете.
     */
    tilecount?: number;
};
