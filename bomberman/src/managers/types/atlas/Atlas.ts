/**
 * @file Atlas.ts
 * @description Определяет типы для атласа текстур.
 * @module managers/types/atlas/Atlas
 */
import type { MetaInfo, Frame } from '.';

/**
 * Тип данных для атласа текстур.
 */
export type Atlas = {
    /**
     * Коллекция кадров в атласе, где ключ - имя кадра, а значение - данные кадра.
     */
    frames: Record<string, Frame>;
    /**
     * Метаданные атласа.
     */
    meta: MetaInfo;
};
