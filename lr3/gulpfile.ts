import gulp from 'gulp';
import sass from 'gulp-sass';
import sassCompiler from 'sass';
import path from 'path';
import {fileURLToPath} from 'url';

const __filename: string = fileURLToPath(import.meta.url);
const __dirname: string = path.dirname(__filename);
const sassProcessor = sass(sassCompiler);

// Компиляция SCSS
export function styles() {
    return gulp.src('src/public/scss/**/*.scss')
        .pipe(sassProcessor({
            loadPaths: [path.resolve(__dirname, 'node_modules')]
        }).on('error', sassProcessor.logError))
        .pipe(gulp.dest('public/gulp-build/css'));
}

// Сборка через Webpack (альтернативный подход)
export function scripts() {
    return gulp.src('src/client/admin.ts')
        .pipe(gulp.dest('public/gulp-build/js'));
}

// Копирование статических файлов
export function assets() {
    return gulp.src('src/public/assets/**/*')
        .pipe(gulp.dest('public/gulp-build/assets'));
}

// Наблюдение за изменениями
export function watch() {
    gulp.watch('src/public/scss/**/*.scss', styles);
    gulp.watch('src/client/**/*.ts', scripts);
    gulp.watch('src/public/assets/**/*', assets);
}

export const build = gulp.parallel(styles, scripts, assets);
export default gulp.series(build, watch);
