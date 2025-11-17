/**
 * @file buildResolvers.ts
 * @fileoverview Функция для создания конфигурации резолверов (resolvers) для Webpack на основе переданных опций сборки
 * @module buildResolvers
 */
import { Configuration } from "webpack";
import { BuildOptions } from "./types/types";

/**
 * Создает конфигурацию резолверов (resolvers) для Webpack на основе переданных опций сборки
 * @param options Опции сборки
 * @returns {Configuration['resolve']} Конфигурация резолверов для Webpack
 */
export function buildResolvers(options: BuildOptions): Configuration['resolve'] {
    const { alias } = options;

    return {
        extensions: ['.tsx', '.ts', '.js'], // Расширения файлов для резолвинга
        extensionAlias: {
            ".js": [".js", ".ts"],
            ".cjs": [".cjs", ".cts"],
            ".mjs": [".mjs", ".mts"]
        }, // Алиасы расширений файлов
        alias: alias, // Использование переданных алиасов для путей
    }
}