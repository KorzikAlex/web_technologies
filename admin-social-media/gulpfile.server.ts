import gulp from 'gulp';
import ts from 'gulp-typescript';
import fs from 'fs';

const tsProject = ts.createProject('tsconfig.json');

// Очистка папки dist
export const clean = async () => {
    fs.rmSync('dist/server', { recursive: true, force: true });
}

// Компиляция TypeScript
export const compileTs = () => {
    return gulp.src('src/server/**/*.ts')
        .pipe(tsProject())
        .pipe(gulp.dest('dist/server'));
};

// Копирование JSON и SSL
export const copyAssets = () => {
    return gulp.src([
        'src/server/data/**/*',
        'src/server/ssl/**/*'
    ], { base: 'src/server' })
        .pipe(gulp.dest('dist/server'));
};

// Основная задача
export const build = gulp.series(clean, gulp.parallel(compileTs, copyAssets));

export default build;