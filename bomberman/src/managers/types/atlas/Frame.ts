/**
 * @file Frame.ts
 * @description Определяет типы для кадров атласа текстур.
 * @module managers/types/atlas/Frame
 */

/**
 * Тип данных для кадра в атласе текстур.
 */
export type Frame = {
    /**
     * Позиция и размер кадра в атласе.
     */
    frame: {
        x: number;
        y: number;
        w: number;
        h: number;
    };
    /**
     * Флаг, указывающий, был ли кадр повернут.
     */
    rotated: boolean;
    /**
     * Флаг, указывающий, был ли кадр обрезан.
     */
    trimmed: boolean;
    /**
     * Позиция и размер спрайта внутри исходного изображения.
     */
    spriteSourceSize: {
        x: number;
        y: number;
        w: number;
        h: number;
    };
    /**
     * Исходный размер изображения до обрезки.
     */
    sourceSize: {
        w: number;
        h: number;
    };
};
