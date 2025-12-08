/**
 * @file eslint.config.ts
 * @fileoverview Конфигурационный файл ESLint для проекта, включающий поддержку JavaScript, TypeScript, JSON, Markdown и CSS.
 * @module eslint-config
 */
import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import json from "@eslint/json";
import markdown from "@eslint/markdown";
import css from "@eslint/css";
import { defineConfig, globalIgnores } from "eslint/config";

/**
 * Экспорт конфигурации ESLint
 */
export default defineConfig([
    {
        files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
        plugins: { js },
        extends: ["js/recommended"],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node
            }
        }
    }, // Базовые правила для JavaScript файлов
    tseslint.configs.recommended, // Добавление рекомендуемых правил для TypeScript
    {
        files: ["**/*.json"],
        plugins: { json },
        language: "json/json",
        extends: ["json/recommended"],
    }, // Правила для JSON файлов
    {
        files: ["**/*.jsonc"],
        plugins: { json },
        language: "json/jsonc",
        extends: ["json/recommended"]
    }, // Правила для JSONC файлов
    {
        files: ["**/*.json5"],
        plugins: { json },
        language: "json/json5",
        extends: ["json/recommended"]
    }, // Правила для JSON5 файлов
    {
        files: ["**/*.md"],
        plugins: { markdown },
        language: "markdown/gfm",
        extends: ["markdown/recommended"]
    }, // Правила для Markdown файлов
    {
        files: ["**/*.css"],
        plugins: { css },
        language: "css/css",
        extends: ["css/recommended"]
    }, // Правила для CSS файлов
    globalIgnores([
        "dist/**",
        "node_modules/**",
        "tsconfig.json",
        "tsconfig.*.json"
    ]) // Игнорируемые файлы и папки
]);
