/**
 * ESLint конфигурация для проекта с поддержкой JavaScript, TypeScript, JSON и CSS файлов.
 */
import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import json from "@eslint/json";
import css from "@eslint/css";
import {defineConfig} from "eslint/config";

/**
 * Экспорт массива конфигураций ESLint.
 */
export default defineConfig([
    {
        files: ["**/*.{js,mjs,cjs,ts,mts,cts}"], // Применять ко всем JS и TS файлам
        plugins: {js}, // Подключаем плагин для JavaScript
        extends: ["js/recommended"], // Расширяем рекомендуемые правила
        languageOptions: {
            globals: {
                ...globals.browser, // Глобальные переменные браузера
                ...globals.node // Глобальные переменные Node.js
            }
        }
    },
    tseslint.configs.recommended, // Рекомендуемые правила для TypeScript с проверкой типов
    {
        files: ["**/*.json"], // Применять ко всем JSON файлам
        language: "json/json",  // Указываем язык JSON
        ...json.configs.recommended
    },
    {
        files: ["**/*.css"],  // Применять ко всем CSS файлам
        language: "css/css",  // Указываем язык CSS
        ...css.configs.recommended
    },
]);
