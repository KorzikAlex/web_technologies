export abstract class LocalStorageManager {
    /**
     * Записывает в localstorage информацию по ключу со значением value
     * @param key
     * @param value
     */
    store(key: string, value: string): void {
        localStorage.setItem(key, String(value));
    }

    /**
     * Читает данные по ключу из localStorage
     * @param key
     */
    read(key: string): string | null {
        return localStorage.getItem(key);
    }
}