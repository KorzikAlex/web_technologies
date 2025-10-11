export const STORAGE_KEY: string = "tetris.username"; // Ключ с никнеймом игрока

/**
 * Генерирует случайное целое число в диапазоне от min до max
 * @param min
 * @param max
 * @returns {number}
 */
export function randInt(min: number, max: number): number {
    min = Math.ceil(min); // Округляем min в большую сторону
    max = Math.floor(max); // Округляем max в меньшую сторону
    return Math.floor(Math.random() * (max - min + 1)) + min; // Генерируем случайное число
}
