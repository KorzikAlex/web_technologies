/**
 * @file gulpfile.ts
 * @fileoverview Файл конфигурации Gulp для сборки серверной части проекта на TypeScript.
 * Содержит задачи для очистки, компиляции TypeScript и копирования статических файлов.
 * @module gulpfile
 */
import gulp from 'gulp';
import ts from 'gulp-typescript';
import fs from 'fs';

const tsProject = ts.createProject('tsconfig.json'); // Создание проекта TypeScript на основе tsconfig.json

/**
 * @function clean
 * Удаляет папку dist/server перед сборкой
 */
export async function clean() {
    fs.rmSync('dist/server', {
        recursive: true, force: true
    });
}

/**
 * @function compileTs
 * Компилирует TypeScript файлы в JavaScript
 */
export async function compileTs() {
    return gulp.src('src/server/**/*.ts')
        .pipe(tsProject())
        .pipe(gulp.dest('dist/server'));
};

/**
 * @function copyAssets
 * Копирует статические файлы (данные и SSL сертификаты) в папку dist/server
 */
export async function copyAssets() {
    return gulp.src([
        'src/server/data/**/*',
        'src/server/ssl/**/*'
    ], { base: 'src/server' })
        .pipe(gulp.dest('dist/server'));
};


export const build = gulp.series(clean, gulp.parallel(compileTs, copyAssets)); // Основная задача сборки

export default build;