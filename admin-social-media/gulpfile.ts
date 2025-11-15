import gulp from "gulp"
import pug from 'gulp-pug';
import ts from "gulp-typescript"
import sass from 'gulp-sass';
import sassCompiler from 'sass';
import cleanCSS from 'gulp-clean-css';
import {fileURLToPath} from "node:url";
import path from "node:path";
import del from "del";

const __filename: string = fileURLToPath(import.meta.url);
const __dirname: string = path.dirname(__filename);

const buildPath: string = path.join('dist', 'client', 'gulp');
const srcPath: string = path.join('src', 'client');

const sassProcessor = sass(sassCompiler);
const tsProject = ts.createProject("tsconfig.client.gulp.json");

function buildStyles() {
    const srcStylesPath: string = path.join(srcPath, 'public', 'scss', '**', '*.scss');
    const buildStylesPath: string = path.join(buildPath, 'styles');
    return gulp.src(srcStylesPath)
        .pipe(sassProcessor({
            loadPaths: [path.resolve(__dirname, 'node_modules')]
        })).on('error', sassProcessor.logError).pipe(cleanCSS()).pipe(gulp.dest(buildStylesPath));
}

function buildScripts() {
    const srcScriptsPath: string = path.join(srcPath, '**', '*.ts');
    const buildScriptsPath: string = path.join(buildPath);

    return gulp.src([srcScriptsPath])
        .pipe(tsProject())
        .pipe(gulp.dest(buildScriptsPath));
}

function buildAssets() {
    const srcAssetsPath: string = path.join(srcPath, 'public', 'assets', '**', '*');
    const buildAssetsPath: string = path.join(buildPath, 'assets');

    return gulp.src(srcAssetsPath)
        .pipe(gulp.dest(buildAssetsPath));
}

function buildUi() {
    const srcViewsPath: string = path.join(srcPath, 'ui', '**', '*.pug');
    const buildViewsPath: string = path.join(buildPath, 'ui');

    return gulp.src(srcViewsPath)
        .pipe(pug())
        .pipe(gulp.dest(buildViewsPath));
}

function copySsl() {
    const srcSslPath = path.join('src', 'server', 'ssl', '**', '*');
    const distSslPath = path.join('dist', 'server', 'ssl');
    return gulp.src(srcSslPath).pipe(gulp.dest(distSslPath));
}

function watch() {
    gulp.watch("src/client/styles/**/*.scss", buildStyles);
    gulp.watch("src/client/**/*.ts", buildScripts);
    gulp.watch("src/client/public/assets/**/*", buildAssets);
    gulp.watch("src/client/ui/**/*", buildUi);
    gulp.watch("src/server/ssl/**/*", copySsl);
}

function clean() {
    return del([buildPath, 'dist/server'])
}

export const build = gulp.parallel(buildStyles, buildScripts, buildAssets, buildUi, copySsl);
export default gulp.series(build, watch);