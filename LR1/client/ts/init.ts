/**
 * @fileOverview Файл инициализации
 * @author KorzikAlex
 * @license MIT
 * @copyright 2025
 * @module main
 */
import {readFromLocalStorage, STORAGE_KEY, storeToLocalStorage} from './utils/utils'

const inputUsername: HTMLInputElement = document.getElementById('username')as HTMLInputElement
const savedUsername: string | null = readFromLocalStorage(STORAGE_KEY)

if (savedUsername != null) {
    inputUsername.value = savedUsername
}

inputUsername.addEventListener('input', () => {
    storeToLocalStorage(STORAGE_KEY, inputUsername.value)
})
