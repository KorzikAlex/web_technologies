/**
 * @file LocalStorageManager.ts
 * @fileOverview Это файл содержит определение класса LocalStorageManager, который предоставляет методы для работы с localStorage.
 * @author Korzik
 * @license MIT
 * @copyright 2025
 * @module LocalStorageManager
 */

/**
 * Менеджер для работы с localStorage
 * @class LocalStorageManager
 */
export abstract class LocalStorageManager {
    /**
     * Записывает в localstorage информацию по ключу со значением value
     * @param key - ключ
     * @param value - значение
     */
    store(key: string, value: string): void {
        localStorage.setItem(key, String(value));
    }

    /**
     * Читает данные по ключу из localStorage
     * @param key - ключ
     * @returns значение any или null, если значение не найдено
     */
    read(key: string): any | null {
        return localStorage.getItem(key);
    }
}