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

    // Алиасы для путей
    const alias: Record<string, string> = {
        '@': path.join(__dirname, 'src', 'client'),
        '@scss': path.join(__dirname, 'src', 'client', 'public', 'scss'),
        '@images': path.join(__dirname, 'src', 'client', 'public', 'assets', 'images'),
        '@ts': path.join(__dirname, 'src', 'client', 'ts'),
        '@ui': path.join(__dirname, 'src', 'client', 'ui'),
        '@components': path.join(__dirname, 'src', 'client', 'ui', 'components'),
        '@assets': path.join(__dirname, 'src', 'client', 'public', 'assets'),
    }
    // Создание конфигурации Webpack с использованием buildWebpack
    const config: webpack.Configuration = buildWebpack({
        port: env.port ?? 5000,
        mode: env.mode ?? 'development',
        paths: paths,
        alias: alias,
    });

    return config; // Возврат конфигурации Webpack
}

