/**
 * @file ObjectProperty.ts
 * @description Определяет типы для свойств объекта карты.
 * @module managers/types/ObjectProperty
 */

/**
 * Тип данных для свойства объекта карты.
 */
export type ObjectProperty = {
    /**
     * Глобальный идентификатор тайла, связанного с этим объектом.
     */
    gid: number;
    /**
     * Высота объекта.
     */
    height: number;
    /**
     * Уникальный идентификатор объекта.
     */
    id: number;
    /**
     * Имя объекта.
     */
    name: string;
    /**
     * Дополнительные свойства объекта.
     */
    properties: { name: string; value: string | number | boolean; type: string }[];
    /**
     * Тип объекта.
     */
    type: string;
    /**
     * Непрозрачность объекта.
     */
    visible: boolean;
    /**
     * Ширина объекта.
     */
    width: number;
    /**
     * Положение объекта по оси X.
     */
    x: number;
    /**
     * Положение объекта по оси Y.
     */
    y: number;
};
