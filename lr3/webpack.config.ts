/**
 * Конфигурационный файл webpack для клиентской части приложения.
 * @file webpack.config.ts
 * @module webpack.config
 */
import path from 'path';
import 'webpack-dev-server';
import {fileURLToPath} from "node:url";
import {dirname} from "node:path";
import HtmlWebpackPlugin from 'html-webpack-plugin';
import webpack from "webpack";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";

const __filename: string = fileURLToPath(import.meta.url); // Получаем имя текущего файла
const __dirname: string = dirname(__filename); // Получаем текущую директорию

type Mode = 'development' | 'production'; // Тип режима сборки

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
    const isProd = mode === 'production';

    return {
        name: 'client', // Имя конфигурации
        mode: mode, // Установка режима сборки
        entry: {
            users: path.resolve(__dirname, 'src', 'client', 'users-page.ts'),
            friends: path.resolve(__dirname, 'src', 'client', 'friends-page.ts'),
            feed: path.resolve(__dirname, 'src', 'client', 'feed-page.ts'),
        },
        devtool: mode === 'development' ? 'inline-source-map' : false, // Настройка source map
        target: 'web', // Целевая платформа - веб
        module: {
            rules: [
                {
                    test: /\.tsx?$/, // Обработка TypeScript файлов
                    use: {
                        loader: 'ts-loader', // Использование ts-loader
                        options: {
                            configFile: 'tsconfig.client.json'
                        }
                    },
                    exclude: /node_modules/, // Исключение node_modules
                },
                {
                    test: /\.s?css$/, // Обработка SCSS и CSS файлов
                    use: [
                        isProd ? MiniCssExtractPlugin.loader : 'style-loader', // Внедрение стилей в DOM или в отдельный файл
                        {
                            loader: 'css-loader', // Обработка CSS
                            options: {
                                sourceMap: true, // Включаем source maps для css-loader
                            }
                        },
                        {
                            loader: 'resolve-url-loader', // Обработка относительных путей в SCSS
                            options: {
                                sourceMap: true, // Обязательно для работы resolve-url-loader
                            }
                        },
                        {
                            loader: 'sass-loader', // Компиляция SCSS в CSS
                            options: {
                                sourceMap: true, // Включаем source maps для sass-loader
                            }
                        }
                    ],
                },
                {
                    test: /\.(woff|woff2|eot|ttf|otf)$/i, // Обработка файлов шрифтов
                    type: 'asset/resource', // Использование asset/resource
                    generator: {
                        filename: 'fonts/[name][ext]' // Вывод в папку fonts
                    }
                },
                {
                    test: /\.pug$/,
                    loader: '@webdiscus/pug-loader',
                },
            ],
        },
        resolve: {
            extensions: ['.tsx', '.ts', '.js'], // Расширения файлов для резолва
        },
        output: {
            path: path.resolve(__dirname, 'public', 'webpack-build'), // Путь вывода сборки
            filename: isProd ? '[name].[contenthash].js' : '[name].bundle.js', // Имя выходного файла
            clean: true, // Очистка выходной директории перед сборкой
            publicPath: '/webpack-build/', // Публичный путь для ресурсов
        },
        plugins: [
            new webpack.ProgressPlugin(), // Плагин для отображения прогресса сборки
            isProd && new MiniCssExtractPlugin({
                filename: '[name].[contenthash].css',
                chunkFilename: '[id].[contenthash].css',
            }),
            new HtmlWebpackPlugin({
                template: './src/views/users.pug',
                filename: 'users.html',
                chunks: ['users'],
            }),
            new HtmlWebpackPlugin({
                template: './src/views/friends.pug',
                filename: 'friends.html',
                chunks: ['friends'],
            }),
            new HtmlWebpackPlugin({
                template: './src/views/feed.pug',
                filename: 'feed.html',
                chunks: ['feed'],
            }),
        ].filter(Boolean),
        optimization: {
            minimize: isProd,
            minimizer: [
                `...`, // Использует TerserPlugin по умолчанию для JS
                new CssMinimizerPlugin(),
            ],
            splitChunks: {
                cacheGroups: {
                    // Создаем отдельный чанк для всех библиотек из node_modules
                    vendors: {
                        test: /[\\/]node_modules[\\/]/,
                        name: 'vendors',
                        chunks: 'all',
                    },
                },
            },
        },
    };
};
