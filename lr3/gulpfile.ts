import gulp from 'gulp';
import sass from 'gulp-sass';
import sassCompiler from 'sass';
import path from 'path';
import { fileURLToPath } from 'url';
import ts from 'gulp-typescript';
import pug from 'gulp-pug';

const __filename: string = fileURLToPath(import.meta.url);
const __dirname: string = path.dirname(__filename);
const sassProcessor = sass(sassCompiler);

// Загрузка tsconfig.json для клиента
const tsProject = ts.createProject('tsconfig.json');

// Компиляция SCSS
export function styles() {
    return gulp.src('src/public/scss/**/*.scss')
        .pipe(sassProcessor({
            loadPaths: [path.resolve(__dirname, 'node_modules')]
        }).on('error', sassProcessor.logError))
        .pipe(gulp.dest('public/gulp-build/css'));
}

// Компиляция клиентского TypeScript
export function scripts() {
    return gulp.src(['src/client/**/*.ts'])
        .pipe(tsProject())
        .pipe(gulp.dest('public/gulp-build/js'));
}

// Копирование статических файлов
export function assets() {
    return gulp.src('src/public/assets/**/*')
        .pipe(gulp.dest('public/gulp-build/assets'));
}

// Копирование шрифтов
export function fonts() {
    return gulp.src('node_modules/bootstrap-icons/font/fonts/*')
        .pipe(gulp.dest('public/gulp-build/fonts'));
}

// Компиляция Pug в HTML
export function views() {
    return gulp.src('src/views/*.pug')
        .pipe(pug({
            // Опции Pug, если нужны
            pretty: true
        }))
        .pipe(gulp.dest('public/gulp-build'));
}

// Наблюдение за изменениями
export function watch() {
    gulp.watch('src/public/scss/**/*.scss', styles);
    gulp.watch('src/client/**/*.ts', scripts);
    gulp.watch('src/public/assets/**/*', assets);
    gulp.watch('src/views/**/*.pug', views);
}

export const build = gulp.parallel(styles, scripts, assets, fonts, views);
export default gulp.series(build, watch);
