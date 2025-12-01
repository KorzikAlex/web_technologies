/**
 * @file webpack.config.ts
 * @fileoverview Конфигурация Webpack для клиентской части приложения
 * @module webpack.config
 */
import path from "path";
import webpack from "webpack";

import { buildWebpack } from "./config/build/buildWebpack";
import { BuildMode, BuildPaths } from "./config/build/types/types";

/**
 * Интерфейс для переменных окружения
 * @interface EnvVariables
 */
interface EnvVariables {
    mode?: BuildMode,
    port?: number,
}

/**
 * Экспорт конфигурации Webpack
 * @param {EnvVariables} env - Переменные окружения
 * @returns {webpack.Configuration} - Конфигурация Webpack
 */
export default (env: EnvVariables): webpack.Configuration => {
    // Пути для сборки
    const paths: BuildPaths = {
        output: path.join(__dirname, 'dist', 'client', 'webpack'),
        views: path.join(__dirname, 'src', 'client', 'ui', 'views'),
        tsConfig: path.join('tsconfig.client.webpack.json'),
    }

    // Создание конфигурации Webpack с использованием buildWebpack
    const config: webpack.Configuration = buildWebpack({
        mode: env.mode ?? 'development',
        paths: paths,
    });

    return config; // Возврат конфигурации Webpack
}

