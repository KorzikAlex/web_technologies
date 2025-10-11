/**
 * @fileOverview Файл инициализации
 * @author KorzikAlex
 * @license MIT
 * @copyright 2025
 * @module main
 */
import {STORAGE_KEY} from './utils/utils'
import {RecordStorageManager} from "./components/RecordStorageManager"; // Импортируем функции для работы с localStorage

const localStorageManager: RecordStorageManager = new RecordStorageManager();

const inputUsername: HTMLInputElement = document.getElementById('username') as HTMLInputElement // Получаем элемент input для имени пользователя
const savedUsername: string | null = localStorageManager.read(STORAGE_KEY) // Получаем сохраненное имя пользователя из localStorage

if (savedUsername != null) {
    inputUsername.value = savedUsername // Если имя пользователя сохранено, устанавливаем его в поле ввода
}

inputUsername.addEventListener('input', () => {
    localStorageManager.store(STORAGE_KEY, inputUsername.value) // Сохраняем имя пользователя в localStorage при изменении поля ввода
})
