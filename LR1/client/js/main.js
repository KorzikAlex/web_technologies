/**
 * @fileoverview Основной файл игры
 * @author KorzikAlex
 * @license MIT
 * @copyright 2025
 * @module main
 * @version 1.0.0
 */
import { read, STORAGE_KEY } from './init.js'
import { Game } from './components/game.js'

const usernameLabel = document.getElementById('username')
usernameLabel.textContent = read(STORAGE_KEY)

if (usernameLabel) {
  const name = read(STORAGE_KEY)
  usernameLabel.textContent = name !== null ? name : ''
} else {
  console.warn('Элемент #username не найден на странице main.js')
}

document.getElementById('controlInfoButton').addEventListener('click', (e) => {

})

const canvasPlayfield = document.getElementById('playfield') // Получаем элемент canvas для игрового поля
const canvasNextFigure = document.getElementById('nextFigure') // Получаем элемент canvas для следующей фигуры

const spanScoreValue = document.getElementById('scoreValue') // Получаем элемент для отображения счета
const spanLevelValue = document.getElementById('levelValue') // Получаем элемент для отображения уровня

const game = new Game(canvasPlayfield, canvasNextFigure, spanScoreValue, spanLevelValue) // Создаем экземпляр игры

