/**
 * @file utils.ts
 * @fileOverview Утилиты для игры Тетрис
 * @author KorzikAlex
 * @version 1.0
 * @license MIT
 * @copyright 2025
 * @module utils
 */
export const USERNAME_KEY: string = "username"; // Ключ с никнеймом игрока
export const TETRIS_ROWS = 20; // Количество строк в игровом поле
export const TETRIS_COLS = 10; // Количество столбцов в игровом поле
export const TETRIS_BLOCK_SIZE = 40;

/**
 * Генерирует случайное целое число в диапазоне от min до max
 * @param {number} min - Минимальное значение (включительно)
 * @param {number} max - Максимальное значение (включительно)
 * @returns {number} Случайное целое число в диапазоне [min, max]
 */
export function randInt(min: number, max: number): number {
    min = Math.ceil(min); // Округляем min в большую сторону
    max = Math.floor(max); // Округляем max в меньшую сторону
    return Math.floor(Math.random() * (max - min + 1)) + min; // Генерируем случайное число
}
