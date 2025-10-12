/**
 * @file init.ts
 * @fileOverview Файл инициализации
 * @author KorzikAlex
 * @license MIT
 * @copyright 2025
 * @module main
 */
import {USERNAME_KEY} from './utils/utils' // Импортируем константу ключа для имени пользователя
import {RecordStorageManager} from "./components/RecordStorageManager"; // Импортируем функции для работы с localStorage

const recordStorageManager: RecordStorageManager = new RecordStorageManager();

const inputUsername: HTMLInputElement = document.getElementById('username') as HTMLInputElement // Получаем элемент input для имени пользователя
const savedUsername: string = recordStorageManager.read(USERNAME_KEY) as string // Получаем сохраненное имя пользователя из localStorage

if (savedUsername != null) {
    inputUsername.value = savedUsername // Если имя пользователя сохранено, устанавливаем его в поле ввода
}

inputUsername.addEventListener('input', () => {
    recordStorageManager.store(USERNAME_KEY, inputUsername.value) // Сохраняем имя пользователя в localStorage при изменении поля ввода
})
