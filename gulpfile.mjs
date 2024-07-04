import gulp from 'gulp';
import fileInclude from 'gulp-file-include';
import * as sass from 'sass';
import gulpSass from 'gulp-sass';
import cleanCSS from 'gulp-clean-css';
import autoprefixer from 'gulp-autoprefixer';
import uglify from 'gulp-uglify';
import imagemin from 'gulp-imagemin';
import webp from 'gulp-webp';
import del from 'del';
import browserSync from 'browser-sync';
import sourceMaps from 'gulp-sourcemaps';
import plumber from 'gulp-plumber';
import notify from 'gulp-notify';
import htmlmin from 'gulp-htmlmin';
import fs from 'fs';

const bs = browserSync.create();
const gulpSassInstance = gulpSass(sass);

// Paths
const paths = {
    rootHtml: {
        src: 'src/index.html',
        dest: 'dist/'
    },
    pagesHtml: {
        src: 'src/html/pages/**/*.html',
        dest: 'dist/html/pages/'
    },
    styles: {
        src: 'src/scss/**/*.scss',
        dest: 'dist/css/'
    },
    scripts: {
        src: 'src/js/**/*.js',
        dest: 'dist/js/'
    },
    images: {
        src: 'src/images/**/*',
        dest: 'dist/images/'
    },
    archives: {
        src: 'src/archives/**/*',
        dest: 'dist/archives/'
    },
    allHtml: {
        src: 'src/html/**/*.html',
    }
};

// Clean task
function cleanDev(done) {
    if (fs.existsSync('./dist/')) {
        return del(['./dist/'], { force: true });
    }
    done();
}

const plumberNotify = (title) => {
    return {
        errorHandler: notify.onError({
            title: title,
            message: 'Error <%= error.message %>',
            sound: false,
        }),
    };
};

// Root HTML task
function rootHtmlDev() {
    return gulp
        .src(paths.rootHtml.src)
        .pipe(plumber(plumberNotify('HTML')))
        .pipe(fileInclude({
            prefix: '@@',
            basepath: '@file',
        }))
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeComments: true,
            minifyJS: true,
            minifyCSS: true,
            removeAttributeQuotes: true,
            useShortDoctype: true
        }))
        .pipe(gulp.dest(paths.rootHtml.dest))
        .pipe(bs.stream());
}

// Pages HTML task
function pagesHtmlDev() {
    return gulp
        .src(paths.pagesHtml.src)
        .pipe(plumber(plumberNotify('HTML')))
        .pipe(fileInclude({
            prefix: '@@',
            basepath: '@file',
        }))
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeComments: true,
            minifyJS: true,
            minifyCSS: true,
            removeAttributeQuotes: true,
            useShortDoctype: true
        }))
        .pipe(gulp.dest(paths.pagesHtml.dest))
        .pipe(bs.stream());
}

// Styles task
function sassDev() {
    return gulp
        .src(paths.styles.src)
        .pipe(plumber(plumberNotify('SCSS')))
        .pipe(sourceMaps.init())
        .pipe(gulpSassInstance())
        .pipe(autoprefixer())
        .pipe(cleanCSS())
        .pipe(sourceMaps.write())
        .pipe(gulp.dest(paths.styles.dest))
        .pipe(bs.stream());
}

// Scripts task
function jsDev() {
    return gulp
        .src(paths.scripts.src)
        .pipe(plumber(plumberNotify('JS')))
        .pipe(uglify())
        .pipe(gulp.dest(paths.scripts.dest))
        .pipe(bs.stream());
}

// Images task
function imagesDev() {
    return gulp
        .src(paths.images.src)
        .pipe(imagemin())
        .pipe(webp())
        .pipe(gulp.dest(paths.images.dest))
        .pipe(bs.stream());
}

// Archives task
function archivesDev() {
    return gulp
        .src(paths.archives.src)
        .pipe(gulp.dest(paths.archives.dest));
}

// Watch files
function watchFiles() {
    gulp.watch(paths.rootHtml.src, rootHtmlDev);
    gulp.watch(paths.pagesHtml.src, pagesHtmlDev);
    gulp.watch(paths.styles.src, sassDev);
    gulp.watch(paths.scripts.src, jsDev);
    gulp.watch(paths.images.src, imagesDev);
    gulp.watch(paths.archives.src, archivesDev);
    gulp.watch(paths.allHtml.src, gulp.series(pagesHtmlDev, rootHtmlDev)).on('change', bs.reload);
}

// BrowserSync
function serverDev() {
    bs.init({
        server: {
            baseDir: './dist'
        },
        notify: false,
        open: true,
    });
}

// Default task
const dev = gulp.series(cleanDev, gulp.parallel(rootHtmlDev, pagesHtmlDev, sassDev, jsDev, imagesDev, archivesDev), gulp.parallel(serverDev, watchFiles));

// Build task
const build = gulp.series(cleanDev, gulp.parallel(rootHtmlDev, pagesHtmlDev, sassDev, jsDev, imagesDev, archivesDev));

export { dev, build };
export default dev;
