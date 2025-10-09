/**
 * @fileOverview Основной файл игры
 * @author KorzikAlex
 * @license MIT
 * @copyright 2025
 * @module main
 */
import {readFromLocalStorage, STORAGE_KEY} from './utils/utils';
import {Game} from './components/Game'

const usernameLabel: HTMLLabelElement = document.getElementById('username') as HTMLLabelElement;
usernameLabel.textContent = readFromLocalStorage(STORAGE_KEY);
const name: string | null = readFromLocalStorage(STORAGE_KEY)
usernameLabel.textContent = name

document.getElementById('controlInfoButton')?.addEventListener('click', (e) => {

})

const canvasPlayfield: HTMLCanvasElement = document.getElementById('playfield') as HTMLCanvasElement
const canvasNextFigure: HTMLCanvasElement = document.getElementById('nextFigure') as HTMLCanvasElement

const spanScoreValue: HTMLSpanElement = document.getElementById('scoreValue') as HTMLSpanElement
const spanLevelValue: HTMLSpanElement = document.getElementById('levelValue') as HTMLSpanElement

const game = new Game(canvasPlayfield, canvasNextFigure, spanScoreValue, spanLevelValue) // Создаем экземпляр игры

