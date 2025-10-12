/**
 * @fileOverview Основной файл игры
 * @author KorzikAlex
 * @license MIT
 * @copyright 2025
 * @module main
 */
import {USERNAME_KEY} from './utils/utils'; // Импортируем константу ключа для имени пользователя
import {Game} from './components/Game' // Импортируем класс игры
import {RecordStorageManager} from "./components/RecordStorageManager"; // Импортируем класс для работы с localStorage

const recordStorageManager = new RecordStorageManager(); // Создаем экземпляр менеджера для работы с localStorage

const usernameLabel: HTMLLabelElement = document.getElementById('username') as HTMLLabelElement; // Получаем элемент для отображения имени пользователя
const name: string = recordStorageManager.read(USERNAME_KEY) as string; // Читаем имя пользователя из localStorage
usernameLabel.textContent = name; // Инициализируем поле с именем пользователя

const canvasPlayfield: HTMLCanvasElement = document.getElementById('playfield') as HTMLCanvasElement; // Получаем элемент canvas для игрового поля
const canvasNextFigure: HTMLCanvasElement = document.getElementById('nextFigure') as HTMLCanvasElement; // Получаем элемент canvas для следующей фигуры

const spanScoreValue: HTMLSpanElement = document.getElementById('scoreValue') as HTMLSpanElement; // Получаем элемент для отображения счета
const spanLevelValue: HTMLSpanElement = document.getElementById('levelValue') as HTMLSpanElement; // Получаем элемент для отображения уровня

const startButton: HTMLButtonElement = document.getElementById('startButton') as HTMLButtonElement; // Получаем кнопку "Start Game"

const game = new Game(canvasPlayfield, canvasNextFigure, spanScoreValue, spanLevelValue); // Создаем экземпляр игры

// Добавляем обработчик события клика на кнопку "Start Game"
startButton.addEventListener('click', () => {
    if (startButton.textContent === 'Перезапустить игру') {
        window.location.reload(); // Перезагружаем страницу, если игра уже запущена
        return;
    }
    startButton.textContent = 'Перезапустить игру'; // Меняем текст кнопки на "Restart Game"
    startButton.classList.remove('btn-primary'); // Убираем класс btn-primary
    startButton.classList.add('btn-danger'); // Добавляем класс btn-danger

    game.start(); // Запускаем игру
});
