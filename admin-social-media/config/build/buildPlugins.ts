/**
 * @file buildPlugins.ts
 * @fileoverview Функция для создания набора плагинов для Webpack на основе переданных опций сборки
 * @module buildPlugins
 */
import webpack, { Configuration } from "webpack";
import { BuildOptions } from "./types/types";
import PugPlugin from "pug-plugin";

/**
 * Создает набор плагинов для Webpack на основе переданных опций сборки
 * @param options Опции сборки
 * @returns {Configuration['plugins']} Набор плагинов для Webpack
 */
export function buildPlugins(options: BuildOptions): Configuration['plugins'] {
    const { mode, paths } = options;

    const isDev = mode === 'development';

    const plugins: Configuration['plugins'] = [
        new PugPlugin({
            entry: paths.views,
            js: {
                filename: 'js/[name].[contenthash:8].js',
            },
            css: {
                filename: 'css/[name].[contenthash:8].css',
            },
        })
    ];

    if (isDev) {
        plugins.push(new webpack.ProgressPlugin());
    }

    return plugins;
}