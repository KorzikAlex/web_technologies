/**
 * @file MetaInfo.ts
 * @description Определяет типы для метаданных атласа текстур.
 * @module managers/types/atlas/MetaInfo
 */

/**
 * Тип данных для метаданных атласа текстур.
 */
export type MetaInfo = {
    /**
     * Имя приложения, создавшего атлас.
     */
    app: string;
    /**
     * Версия приложения, создавшего атлас.
     */
    version: string;
    /**
     * Тип атласа.
     */
    size: {
        w: number;
        h: number;
    };
    /**
     * Масштаб атласа.
     */
    scale: number;
};
