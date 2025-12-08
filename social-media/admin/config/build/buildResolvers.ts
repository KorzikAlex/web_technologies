/**
 * @file buildResolvers.ts
 * @fileoverview Функция для создания конфигурации резолверов (resolvers) для Webpack на основе переданных опций сборки
 * @module buildResolvers
 */
import { Configuration } from "webpack";

/**
 * Создает конфигурацию резолверов (resolvers) для Webpack на основе переданных опций сборки
 * @param options Опции сборки
 * @returns {Configuration['resolve']} Конфигурация резолверов для Webpack
 */
export function buildResolvers(): Configuration['resolve'] {

    return {
        extensions: ['.tsx', '.ts', '.js'], // Расширения файлов для резолвинга
        extensionAlias: {
            ".js": [".js", ".ts"],
            ".cjs": [".cjs", ".cts"],
            ".mjs": [".mjs", ".mts"]
        }, // Алиасы расширений файлов
    }
}