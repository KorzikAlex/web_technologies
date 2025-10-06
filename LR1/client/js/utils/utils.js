/**
 * Генерирует случайное целое число в диапазоне от min до max
 * @param min
 * @param max
 * @returns {number}
 */
export const STORAGE_KEY = "tetris.username";

export function randInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function storeToLocalStorage(key, value) {
    console.log(key, ": ", value);
    try {
        localStorage.setItem(key, String(value));
    } catch (e) {
        console.error("Не удалось сохранить в localStorage:", e);
    }
}

export function readFromLocalStorage(key) {
    try {
        return localStorage.getItem(key);
    } catch (e) {
        console.error("Не удалось прочитать из localStorage:", e);
        return null;
    }
}