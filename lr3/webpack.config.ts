/**
 * Конфигурационный файл webpack для клиентской части приложения.
 * @file webpack.config.ts
 * @module webpack.config
 */
import path from 'path';
import 'webpack-dev-server';
import {fileURLToPath} from "node:url";
import {dirname} from "node:path";
import webpack from "webpack";
import fs from "fs";
import HtmlWebpackPlugin from "html-webpack-plugin";

const __filename: string = fileURLToPath(import.meta.url); // Получаем имя текущего файла
const __dirname: string = dirname(__filename); // Получаем текущую директорию

type Mode = 'development' | 'production'; // Тип режима сборки
const viewsPath: string = path.resolve(__dirname, 'src', 'views'); // Путь к директории с Pug шаблонами
const PAGES: string[] = fs.existsSync(viewsPath) ? fs.readdirSync(viewsPath).filter((name: string): boolean =>
    name.endsWith('.pug')) : []; // Список Pug шаблонов

/**
 * Переменные окружения для конфигурации Webpack.
 * @interface EnvVariables
 * @property {Mode} [mode] - Режим сборки (development или production)
 */
interface EnvVariables {
    mode?: Mode;
}

/**
 * Экспорт конфигурации Webpack.
 * @param env - Переменные окружения
 */
export default (env: EnvVariables = {}): webpack.Configuration => {
    const mode: Mode = env.mode ?? 'development'; // Режим сборки по умолчанию - development

    return {
        name: 'client', // Имя конфигурации
        mode: mode, // Установка режима сборки
        entry: {
            main: path.resolve(__dirname, 'src', 'client', 'users.ts'), // Точка входа для клиентского кода
        },
        devtool: mode === 'development' ? 'inline-source-map' : false, // Настройка source map
        target: 'web', // Целевая платформа - веб
        module: {
            rules: [
                {
                    test: /\.tsx?$/, // Обработка TypeScript файлов
                    use: 'ts-loader', // Использование ts-loader
                    exclude: /node_modules/, // Исключение node_modules
                },
                {
                    test: /\.s?css$/, // Обработка SCSS и CSS файлов
                    use: [
                        'style-loader', // Внедрение стилей в DOM
                        'css-loader', // Обработка CSS
                        {
                            loader: 'sass-loader', // Компиляция SCSS в CSS
                            options: {
                                sassOptions: {
                                    includePaths: [path.resolve(__dirname, 'node_modules')] // Пути для импорта SCSS
                                }
                            }
                        }
                    ],
                },
                // {
                //     test: /\.pug$/,
                //     use: '@webdiscus/pug-loader',
                //     exclude: /node_modules/,
                // },
                {
                    test: /\.(woff2?|eot|ttf|otf)$/i, // Обработка файлов шрифтов
                    type: 'asset/resource', // Использование asset/resource
                    generator: {
                        filename: 'fonts/[name][ext]' // Вывод в папку fonts
                    }
                }
            ],
        },
        resolve: {
            extensions: ['.tsx', '.ts', '.js'], // Расширения файлов для резолва
        },
        output: {
            path: path.resolve(__dirname, 'public', 'webpack-build'), // Путь вывода сборки
            filename: mode === 'development' ? '[name].js' : '[name].[contenthash].js', // Имя выходного файла
            clean: true, // Очистка выходной директории перед сборкой
            publicPath: '/webpack-build/', // Публичный путь для ресурсов
        },
        plugins: [
            new webpack.ProgressPlugin(), // Плагин для отображения прогресса сборки
            ...PAGES.map((file: string) => new HtmlWebpackPlugin({
                template: `./src/views/${file}`,
                filename: `./${file.replace(/\.pug/, '.html')}`
            })) // Генерация HTML файлов из Pug шаблонов
        ],
    };
};
