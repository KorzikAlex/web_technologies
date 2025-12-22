/**
 * @file TiledMapData.ts
 * @description Определяет типы для данных карты Tiled.
 * @module managers/types/TiledMapData
 */
import type { Tileset, TilesLayer, ObjectsLayer } from './';

/**
 * Тип данных для карты Tiled.
 */
export type TiledMapData = {
    /**
     * Высота карты в тайлах.
     */
    height: number;
    /**
     * Массив слоев карты.
     */
    layers: (TilesLayer | ObjectsLayer)[];
    /**
     * Ориентация карты.
     */
    orientation: string;
    /**
     * Дополнительные свойства карты.
     */
    properties: { name: string; value: string | number | boolean; type: string }[];
    /**
     * Высота тайла в пикселях.
     */
    tileheight: number;
    /**
     * Массив тайлсетов карты.
     */
    tilesets: Tileset[];
    /**
     * Ширина тайла в пикселях.
     */
    tilewidth: number;
    /**
     * Версия формата карты.
     */
    version: string;
    /**
     * Ширина карты в тайлах.
     */
    width: number;
    /**
     * Порядок отрисовки слоев карты.
     */
    renderorder: string;
    /**
     * Версия редактора Tiled, использованная для создания карты.
     */
    tiledversion: string;
    /**
     * Следующий идентификатор слоя.
     */
    nextlayerid: number;
    /**
     * Следующий идентификатор объекта.
     */
    nextobjectid: number;
    /**
     * Уровень сжатия данных.
     */
    compressionlevel: number;
    /**
     * Флаг бесконечности карты
     */
    infinite: boolean;
};
