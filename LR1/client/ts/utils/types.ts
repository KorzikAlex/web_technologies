/**
 * @file types.ts
 * @fileOverview Настройки и типы для игры в Тетрис
 * @author KorzikAlex
 * @license MIT
 * @copyright 2025
 * @module types
 */

/**
 * Настройки и типы для игры в Тетрис
 */
export type tetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L'; // Тип для всех тетрамино
export type tetrominoMatrix = number[][]; // Тип для матрицы тетромино
export type colorType = "cyan" | "yellow" | "purple" | "green" | "red" | "blue" | "orange" | "none"; // Тип для цветов тетромино
export type tetrominoColor = Record<tetrominoType, colorType>; // Тип для цветов всех тетромино

/**
 * Определим тип для уровней
 */
export interface Levels {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
}

/**
 * Определение типа для всех тетрамино
 */
export interface Tetrominoes {
    I: tetrominoMatrix;
    O: tetrominoMatrix;
    T: tetrominoMatrix;
    S: tetrominoMatrix;
    Z: tetrominoMatrix;
    J: tetrominoMatrix;
    L: tetrominoMatrix;
}

/**
 * Определение типа для записи рекорда
 */
export type ScoreRec = { score: number; date: number };

/**
 * Определение всех тетрамино и их форм
 */
export const TETROMINOES: Tetrominoes = {
    I: [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ],
    O: [
        [1, 1],
        [1, 1],
    ],
    T: [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0]
    ],
    S: [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0],
    ],
    Z: [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0],
    ],
    J: [
        [1, 0, 0],
        [1, 1, 1],
        [0, 0, 0],
    ],
    L: [
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 0],
    ]
};

/**
 * Определение цветов для всех тетрамино
 */
export const TETROMINO_COLORS: tetrominoColor = {
    I: "cyan",
    O: "yellow",
    T: "purple",
    S: "green",
    Z: "red",
    J: "blue",
    L: "orange"
};

/**
 * Определим уровни и соответствующие им скорости падения фигур (в миллисекундах)
 */
export const LEVELS: Levels = {
    1: 500,
    2: 400,
    3: 300,
    4: 250,
    5: 190,
};
