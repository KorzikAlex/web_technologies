/**
 * @file types.ts
 * @fileoverview Типы для конфигурации сборки Webpack
 * @module types/types
 */

/**
 * Пути для сборки
 * @interface BuildPaths
 * @property {string} tsConfig - Путь к файлу tsconfig.json
 * @property {string} output - Путь к выходной директории сборки
 * @property {string} views - Путь к директории с Pug шаблонами
 */
export interface BuildPaths {
    tsConfig: string,
    output: string,
    views: string,
}

/**
 * Режимы сборки для Webpack
 * @type BuildMode
 * 'production' - Режим продакшн
 * 'development' - Режим разработки
 */
export type BuildMode = 'production' | 'development';

/**
 * Опции сборки для Webpack
 * @interface BuildOptions
 * @property {number} port - Порт для dev server
 * @property {BuildPaths} paths - Пути для сборки
 * @property {BuildMode} mode - Режим сборки (production или development)
 */
export interface BuildOptions {
    port: number,
    paths: BuildPaths,
    mode: BuildMode,
}