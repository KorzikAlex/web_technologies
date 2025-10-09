export const STORAGE_KEY: string = "tetris.username"; // Ключ с никнеймом игрока

/**
 * Генерирует случайное целое число в диапазоне от min до max
 * @param min
 * @param max
 * @returns {number}
 */
export function randInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Записывает в localstorage информацию по ключу со значением value
 * @param key
 * @param value
 */
export function storeToLocalStorage(key: string, value: string): void {
    localStorage.setItem(key, String(value));
}

/**
 * Читает данные по ключу из localStorage
 * @param key
 */
export function readFromLocalStorage(key: string): string | null {
    return localStorage.getItem(key);
}