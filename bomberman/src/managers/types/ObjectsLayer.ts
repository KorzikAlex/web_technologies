/**
 * @file ObjectsLayer.ts
 * @description Определяет типы для слоя объектов карты.
 * @module managers/types/ObjectsLayer
 */
import type { ObjectProperty } from './';

/**
 * Тип данных для слоя объектов карты.
 */
export type ObjectsLayer = {
    /**
     * Уникальный идентификатор слоя.
     */
    id: number;
    /**
     * Высота слоя в тайлах.
     */
    height?: number;
    /**
     * Ширина слоя в тайлах.
     */
    width?: number;
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
     * Массив объектов на слое.
     */
    objects?: ObjectProperty[];
    /**
     * Положение слоя по оси X.
     */
    x: number;
    /**
     * Положение слоя по оси Y.
     */
    y: number;
    /**
     * Порядок отрисовки объектов на слое.
     * @default "topdown"
     */
    draworder?: string;
    /**
     * Дополнительные свойства слоя.
     */
    properties?: { name: string; value: string | number | boolean; type: string }[];
};
