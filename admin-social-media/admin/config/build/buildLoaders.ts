/**
 * @file buildLoaders.ts
 * @fileoverview Функция для создания набора загрузчиков (loaders) для Webpack на основе переданных опций сборки
 * @module buildLoaders
 */
import { ModuleOptions } from "webpack";
import { BuildOptions } from "./types/types";

/**
 * Создает набор загрузчиков (loaders) для Webpack на основе переданных опций сборки
 * @function buildLoaders
 * @param options Опции сборки
 * @returns {ModuleOptions['rules']} Набор загрузчиков для Webpack
 */
export function buildLoaders(options: BuildOptions): ModuleOptions['rules'] {
    const { paths, mode } = options;
    const isDev = mode === 'development';

    const scssLoader = {
        test: /\.(s?css|sass)$/,
        use: [
            'css-loader',
            {
                loader: 'sass-loader',
                options: {
                    sassOptions: {
                        quietDeps: true, // Подавление предупреждений от зависимостей Sass
                    },
                },
            },
        ],
    };

    const assetsLoader = {
        test: /\.(ico|png|jp?g|webp|svg|gif)$/,
        type: 'asset/resource',
        generator: {
            filename: isDev ? 'img/[name].[ext][query]': 'img/[name].[hash:8][ext][query]', // Шаблон имени файла для изображений
        },
    };

    const tsLoader = {
        test: /\.([cm]?ts|tsx)$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
            configFile: paths.tsConfig, // Использование указанного файла конфигурации TypeScript
        }
    };

    const fontsLoader = {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator: {
            filename: isDev ? 'fonts/[name].[ext][query]': 'fonts/[name].[hash:8][ext][query]', // Шаблон имени файла для шрифтов
        },
    };

    return [
        scssLoader,
        assetsLoader,
        tsLoader,
        fontsLoader,
    ]; // Возврат массива загрузчиков
}
