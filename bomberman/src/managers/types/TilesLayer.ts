/**
 * @file TilesLayer.ts
 * @description Определяет типы для слоя тайлов карты.
 * @module managers/types/TilesLayer
 */

/**
 * Тип данных для слоя тайлов карты.
 */
export type TilesLayer = {
    /**
     * Массив глобальных идентификаторов тайлов в слое.
     */
    data: number[];
    /**
     * Высота слоя в тайлах.
     */
    height: number;
    /**
     * Ширина слоя в тайлах.
     */
    width: number;
    /**
     * Уникальный идентификатор слоя.
     */
    id: number;
    /**
     * Имя слоя.
     */
    name: string;
    /**
     * Тип слоя.
     */
    type: string;
    /**
     * Непрозрачность слоя.
     */
    opacity: number;
    /**
     * Видимость слоя.
     */
    visible: boolean;
    /**
     * Положение слоя по оси X.
     */
    x: number;
    /**
     * Положение слоя по оси Y.
     */
    y: number;
    /**
     * Дополнительные свойства слоя.
     */
    properties?: { name: string; value: string | number | boolean; type: string }[];
};
