/**
 * @file buildDevServer.ts
 * @fileoverview Функция для создания конфигурации dev server Webpack на основе переданных опций сборки
 * @module buildDevServer
 */
import { type Configuration as DevServerConfiguration } from "webpack-dev-server";
import { BuildOptions } from "./types/types";

/**
 * Создает конфигурацию dev server Webpack на основе переданных опций сборки
 * @function buildDevServer
 * @param options Опции сборки
 * @returns {DevServerConfiguration} Конфигурация dev server Webpack
 */
export function buildDevServer(options: BuildOptions): DevServerConfiguration {
    const { port, paths } = options;

    return {
        port: port ?? 5000,
        open: true, // Автоматически открывать браузер
        historyApiFallback: true, // Поддержка HTML5 History API
        hot: true, // Включение горячей перезагрузки модулей
        compress: true, // Включение сжатия
        static: {
            directory: paths.output, // Путь к статическим файлам
        },
        client: {
            progress: true, // Показ прогресса сборки в клиенте
            reconnect: true, // Автоматическое переподключение при потере соединения
        }
    }
}