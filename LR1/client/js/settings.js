/**
 * Определение всех тетрамино в виде матриц
 * @type {{I: number[][], O: number[][], T: number[][], S: number[][], Z: number[][], J: number[][], L: number[][]}}
 */
export const TETROMINOES = {
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
export const TETROMINO_COLORS = {
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
export const SCORES = {
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

export const LEVELS = {
    1: 500,
    2: 400,
    3: 300,
    4: 250,
    5: 190,
};