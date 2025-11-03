import gulp from 'gulp';
import sass from 'gulp-sass';
import sassCompiler from 'sass';

const sassProcessor = sass(sassCompiler);

export function styles() {
    return gulp.src('src/public/scss/**/*.scss')
        .pipe(sassProcessor().on('error', sassProcessor.logError))
        .pipe(gulp.dest('public/gulp-build/css'));
}

export function watch() {
    gulp.watch('src/public/scss/**/*.scss', styles);
}

export default gulp.series(styles, watch);
