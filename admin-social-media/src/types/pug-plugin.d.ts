/**
 * @file pug-plugin.d.ts
 * @fileoverview Типы для pug-plugin, используемого в Webpack для обработки Pug шаблонов
 * @module pug-plugin
 */
declare module "pug-plugin" {
    import { Compiler, WebpackPluginInstance } from "webpack"; // Импорт необходимых типов из webpack
    interface PugPluginOptions {
        entry: string | Record<string, string>; // Путь или объект путей к Pug шаблонам
        js?: {
            filename?: string; // Шаблон имени файла для скомпилированных JS файлов
        };
        css?: {
            filename?: string; // Шаблон имени файла для скомпилированных CSS файлов
        };
        pretty?: boolean; // Опция для форматирования скомпилированного HTML
    }
    class PugPlugin implements WebpackPluginInstance {
        constructor(options: PugPluginOptions); // Конструктор принимает опции плагина
        apply(compiler: Compiler): void; // Метод apply для интеграции с Webpack
    }
    export default PugPlugin; // Экспорт класса PugPlugin по умолчанию
}