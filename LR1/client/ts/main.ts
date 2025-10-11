/**
 * @fileOverview Основной файл игры
 * @author KorzikAlex
 * @license MIT
 * @copyright 2025
 * @module main
 */
import {STORAGE_KEY} from './utils/utils';
import {Game} from './components/Game'
import {RecordStorageManager} from "./components/RecordStorageManager";

const recordStorageManager = new RecordStorageManager();

const usernameLabel: HTMLLabelElement = document.getElementById('username') as HTMLLabelElement; // Получаем элемент для отображения имени пользователя
usernameLabel.textContent = recordStorageManager.read(STORAGE_KEY); // Инициализируем поле с именем пользователя
const name: string | null = recordStorageManager.read(STORAGE_KEY) // Получаем имя пользователя из localStorage
usernameLabel.textContent = name // Устанавливаем имя пользователя в элемент

const canvasPlayfield: HTMLCanvasElement = document.getElementById('playfield') as HTMLCanvasElement // Получаем элемент canvas для игрового поля
const canvasNextFigure: HTMLCanvasElement = document.getElementById('nextFigure') as HTMLCanvasElement // Получаем элемент canvas для следующей фигуры

const spanScoreValue: HTMLSpanElement = document.getElementById('scoreValue') as HTMLSpanElement // Получаем элемент для отображения счета
const spanLevelValue: HTMLSpanElement = document.getElementById('levelValue') as HTMLSpanElement // Получаем элемент для отображения уровня


document.getElementById("startButton")?.addEventListener('click', () => {
    const game = new Game(canvasPlayfield, canvasNextFigure, spanScoreValue, spanLevelValue)
    game.startGame()
})



