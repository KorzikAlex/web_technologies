// Определим тип для фигур тетрамино
export type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

// Определим тип для матрицы тетрамино
export type TetrominoMatrix = number[][];
export type colorType = "cyan" | "yellow" | "purple" | "green" | "red" | "blue" | "orange";

// Определим тип для цвета тетрамино
export type TetrominoColors = Record<TetrominoType, colorType>;

// Определим тип для очков
export interface Scores {
    oneLine: number;
    twoLines: number;
    threeLines: number;
    fourLines: number;
    softDrop: number;
    hardDrop: number;
    tSpin: number;
    tSpinMini: number;
    backToBack: number;
    combo: number;
}

// Определим тип для уровней
export interface Levels {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
}

// Определим тип для всех тетрамино
export interface Tetrominoes {
    I: TetrominoMatrix;
    O: TetrominoMatrix;
    T: TetrominoMatrix;
    S: TetrominoMatrix;
    Z: TetrominoMatrix;
    J: TetrominoMatrix;
    L: TetrominoMatrix;
}

export interface Colors {
    I: colorType;
    O: colorType;
    T: colorType;
    S: colorType;
    Z: colorType;
    J: colorType;
    L: colorType;
}

/**
 * Определение всех тетрамино в виде матриц
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
 * Цвета для каждой фигуры
 */
export const TETROMINO_COLORS: TetrominoColors = {
    I: "cyan", // Цвет для фигуры I (голубой)
    O: "yellow",
    T: "purple",
    S: "green",
    Z: "red",
    J: "blue",
    L: "orange"
};

/**
 * Очки за различные действия в игре
 */
export const SCORES: Scores = {
    oneLine: 100, // Очки за одну линию
    twoLines: 300,  // Очки за две линии
    threeLines: 500,  // Очки за три линии
    fourLines: 800,  // Очки за четыре линии
    softDrop: 1, // Очки за мягкое падение
    hardDrop: 2, // Очки за жесткое падение
    tSpin: 400, // Очки за T-Spin
    tSpinMini: 100, // Очки за T-Spin Mini
    backToBack: 1.5, // Множитель для back-to-back
    combo: 50, // Бонус за комбо
};

/**
 * Очки, необходимые для перехода на следующий уровень
 */
export const LEVELS: Levels = {
    1: 500,
    2: 400,
    3: 300,
    4: 250,
    5: 190,
};
