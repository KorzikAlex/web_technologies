import { src, dest, series } from 'gulp';
import sass from 'gulp-sass';
import sassCompiler from 'sass';
import pug from 'gulp-pug';
import ts from 'gulp-typescript';
import path from 'node:path';
import replace from 'gulp-replace';
import { deleteAsync } from 'del';

const sassProcessor = sass(sassCompiler);

const srcClientPath: string = path.join('src', 'client');
const distClientPath: string = path.join('dist', 'client', 'gulp');

const srcPaths = {
    base: srcClientPath,
    scss: path.join(srcClientPath, 'public', 'scss', '**', '*.scss'),
    pug: path.join(srcClientPath, 'ui', 'views', '**', '*.pug'),
    ts: path.join(srcClientPath, 'ts', '**/*.ts'),
    assets: path.join(srcClientPath, 'public', 'assets', '**'),
    fonts: path.join('node_modules', 'bootstrap-icons', 'font', 'fonts', '**')
};

const distPaths = {
    base: distClientPath,
    css: path.join(distClientPath, 'css'),
    js: path.join(distClientPath, 'js'),
    assets: path.join(distClientPath, 'assets'),
    fonts: path.join(distClientPath, 'css', 'fonts')
};

function deleteFolderRecursive() {
    return deleteAsync([distClientPath], { force: true });
}

function styles() {
    return src(srcPaths.scss).pipe(sassProcessor(
        {
            loadPaths: ['node_modules']
        }
    )).on('error', sassProcessor.logError).pipe(dest(distPaths.css));
}

function views() {
    return src(srcPaths.pug)
        .pipe(pug())
        .pipe(replace('../../ts/index.ts', './js/client/ts/index.js'))
        .pipe(replace('../../ts/friends.ts', './js/client/ts/friends.js'))
        .pipe(replace('../../ts/posts.ts', './js/client/ts/post.js'))
        .pipe(replace('../../public/scss/style.scss', './css/style.css'))
        .pipe(replace('../../public/assets/', './assets/'))
        .pipe(dest(distPaths.base));
}

function scripts() {
    const tsProject = ts.createProject('tsconfig.client.gulp.json');
    return tsProject.src().pipe(tsProject()).js.pipe(dest(distPaths.js));
}

function copyAssets() {
    return src(srcPaths.assets).pipe(dest(distPaths.assets));
}

function copyFonts() {
    return src(srcPaths.fonts).pipe(dest(distPaths.fonts));
}

exports.build = series(deleteFolderRecursive, styles, views, scripts, copyAssets, copyFonts);

