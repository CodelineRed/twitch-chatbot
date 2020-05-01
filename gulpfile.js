const browserSync = require('browser-sync').create();
const del         = require('del');
const gulp        = require('gulp');
const prefixer    = require('gulp-autoprefixer');
const babel       = require('gulp-babel');
const minifyCss   = require('gulp-clean-css');
const concat      = require('gulp-concat');
const eslint      = require('gulp-eslint');
const gulpIf      = require('gulp-if');
const minifyImg   = require('gulp-imagemin');
const minifyJson  = require('gulp-jsonminify');
const rename      = require('gulp-rename');
const sass        = require('gulp-sass');
const sassLint    = require('gulp-sass-lint');
const sourcemaps  = require('gulp-sourcemaps');
const uglify      = require('gulp-uglify-es').default;
const vueSfc      = require('gulp-vue-single-file-component');

const config      = require('./src/app/gulpfile.json');
const isEnv       = require('./src/app/is-env');
const lint        = require('./src/app/lint');

// processing scss to css and minify result
function scss() {
    return gulp.src(config.sourcePath + 'scss/styles.scss')
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(prefixer({
            overrideBrowserslist: ['last 2 versions'],
            cascade: false
        }))
        .pipe(gulpIf(isEnv(['test', 'prod'], config.env), minifyCss({compatibility: 'ie8'})))
        .pipe(sourcemaps.write('./'))
//        .pipe(gulp.dest(config.systemPath + 'css/'))
        .pipe(gulp.dest(config.publicPath + 'css/'));
}

// lint scss files
function scssLint() {
    return lint(gulp, sassLint, [config.sourcePath + 'scss/**/*.scss'], 'scss');
}

// concatenate and uglify js files
function js() {
    return gulp.src([
            'node_modules/jquery/dist/jquery.js',
            'node_modules/bootstrap/dist/js/bootstrap.bundle.js',
//          'node_modules/@fortawesome/fontawesome-free/js/all.js',
            'node_modules/skateboard/skateboard.min.js',
            'node_modules/moment/moment.js',
            config.sourcePath + 'js/lib/**/*.js',
            'node_modules/slick-carousel/slick/slick.js',
            'node_modules/cssuseragent/cssua.js',
            'node_modules/datatables.net/js/jquery.dataTables.js',
            'node_modules/datatables.net-bs4/js/dataTables.bootstrap4.js',
            'node_modules/vanilla-lazyload/dist/lazyload.js',
            'node_modules/string-format-js/format.js',
            config.sourcePath + 'js/plugin/**/*.js',
            config.sourcePath + 'js/module/**/*.js',
            config.sourcePath + 'js/scripts.js'
        ])
        .pipe(sourcemaps.init())
        .pipe(concat('scripts.js'))
        .pipe(gulpIf(isEnv(['test', 'prod'], config.env), uglify()))
        .pipe(sourcemaps.write('./'))
//        .pipe(gulp.dest(config.systemPath + 'js/'))
        .pipe(gulp.dest(config.publicPath + 'js/'));
}

// lint js files
function jsLint() {
    return lint(gulp, eslint, [config.sourcePath + 'js/{lib,module,plugin}/*.js', config.sourcePath + 'js/scripts.js'], 'js');
}

// uglify required js files
function jsRequire() {
    let returnValue;
    const modules = {
        'require': 'node_modules/requirejs/require.js',
        'vue': 'node_modules/vue/dist/vue.min.js',
        'vue-router': 'node_modules/vue-router/dist/vue-router.min.js',
        'vue-i18n': 'node_modules/vue-i18n/dist/vue-i18n.js',
        'fontawesome-svg-core': 'node_modules/@fortawesome/fontawesome-svg-core/index.js',
        'free-brands-svg-icons': 'node_modules/@fortawesome/free-brands-svg-icons/index.js',
        'free-regular-svg-icons': 'node_modules/@fortawesome/free-regular-svg-icons/index.js',
        'free-solid-svg-icons': 'node_modules/@fortawesome/free-solid-svg-icons/index.js',
        'vue-fontawesome': 'node_modules/@fortawesome/vue-fontawesome/index.js'
    };

    if (isEnv('dev', config.env)) {
        modules['vue'] = 'node_modules/vue/dist/vue.js';
        modules['vue-router'] = 'node_modules/vue-router/dist/vue-router.js';
    }
    
    const moduleKeys = Object.keys(modules);
    
    for (const key of moduleKeys) {
        returnValue = gulp.src(modules[key])
            .pipe(rename({ basename: key }))
            .pipe(gulpIf(isEnv(['test', 'prod'], config.env), uglify()))
//            .pipe(gulp.dest(config.systemPath + 'js/require/'))
            .pipe(gulp.dest(config.publicPath + 'js/require/'));
    }
    return returnValue;
}

// copy all json files and minify
function json() {
    return gulp.src([
            config.sourcePath + 'json/**/*.json'
        ])
        .pipe(minifyJson())
//        .pipe(gulp.dest(config.systemPath + 'json/'))
        .pipe(gulp.dest(config.publicPath + 'json/'));
}

// compress images
function img() {
    return gulp.src(config.sourcePath + 'img/**/*.{png,gif,jpg,jpeg,ico,xml,json,svg}')
        .pipe(minifyImg([
            minifyImg.gifsicle({interlaced: true}),
            minifyImg.mozjpeg({progressive: true}),
            minifyImg.optipng({optimizationLevel: 5})
        ]))
//        .pipe(gulp.dest(config.systemPath + 'img/'))
        .pipe(gulp.dest(config.publicPath + 'img/'));
}

// copy font files
function font() {
    return gulp.src([
//            'node_modules/@fortawesome/fontawesome-free/webfonts/**',
            'node_modules/slick-carousel/slick/fonts/**',
            config.sourcePath + 'font/**'
        ])
//        .pipe(gulp.dest(config.systemPath + 'font/'))
        .pipe(gulp.dest(config.publicPath + 'font/'));
}

// compress and copy svg files
function svg() {
    return gulp.src([
//            'node_modules/@fortawesome/fontawesome-free/svgs/**',
//            'node_modules/@fortawesome/fontawesome-free/sprites/**',
            config.sourcePath + 'svg/**/*.svg'
        ])
        .pipe(minifyImg([
            minifyImg.svgo({
                plugins: [
                    {removeViewBox: true},
                    {cleanupIDs: false}
                ]
            })
        ]))
//        .pipe(gulp.dest(config.systemPath + 'svg/'))
        .pipe(gulp.dest(config.publicPath + 'svg/'));
}

// transpile vue files
function vue() {
    return gulp.src(config.sourcePath + 'js/vue/**/*.vue')
        .pipe(vueSfc({ debug: false, loadCssMethod: 'loadCss' }))
        .pipe(babel({ plugins: ['@babel/plugin-transform-modules-amd'] }))
        .pipe(rename({ extname: '.js' }))
        .pipe(gulpIf(isEnv(['test', 'prod'], config.env), uglify()))
//        .pipe(gulp.dest(config.systemPath + 'js/vue/'))
        .pipe(gulp.dest(config.publicPath + 'js/vue/'));
}

// transpile vue js files
function vueJs() {
    return gulp.src(config.sourcePath + 'js/vue/**/*.js')
        .pipe(babel({ plugins: ['@babel/plugin-transform-modules-amd'] }))
        .pipe(gulpIf(isEnv(['test', 'prod'], config.env), uglify()))
//        .pipe(gulp.dest(config.systemPath + 'js/vue/'))
        .pipe(gulp.dest(config.publicPath + 'js/vue/'));
}

// lint vue js files
function vueJsLint() {
    return lint(gulp, eslint, [config.sourcePath + 'js/vue/**/*.js'], 'import');
}

// lint vue files
function vueLint() {
    return lint(gulp, eslint, [config.sourcePath + 'js/vue/**/*.vue'], 'vue');
}

// lint chatbot js files
function chatbotLint() {
    return lint(gulp, eslint, [config.sourcePath + 'js/chatbot/**/*.js', 'chatbot.js'], 'import');
}

// clean up folders
function cleanUp() {
//    del([
//            config.systemPath + 'css/**/*',
//            config.systemPath + 'js/**/*',
//            config.systemPath + 'img/**/*',
//            config.systemPath + 'json/**/*',
//            config.systemPath + 'font/**/*',
//            config.systemPath + 'svg/**/*'
//        ], {force: true});
        
    return del([
            config.publicPath + 'css/**/*',
            config.publicPath + 'js/**/*',
            config.publicPath + 'img/**/*',
            config.publicPath + 'json/**/*',
            config.publicPath + 'font/**/*',
            config.publicPath + 'svg/**/*'
        ]);
}

// initialize BrowserSync
function browserSyncInit(done) {
    browserSync.init({
        port: 3000,
        server: {
            baseDir: "public",
            index: "index.html"
        },
        ui: {
            port: 3001
        }
//        ui: false, // enable in production
//        server: false, // enable if you use Docker
//        proxy: config.localServer // enable if you use Docker
    });
    done();
}

// reload browser
function browserSyncReload(done) {
    browserSync.reload();
    done();
}

// watch files
function watch() {
    // watch scss files
    gulp.watch(config.sourcePath + 'scss/**', gulp.series(scss, scssLint));
    // watch js files
    gulp.watch([
        config.sourcePath + 'js/{lib,module,plugin}/*.js',
        config.sourcePath + 'js/scripts.js'
    ], gulp.series(js, jsLint));
    // watch vue files
    gulp.watch(config.sourcePath + 'js/vue/**', gulp.series(vue, vueJs, vueJsLint, vueLint));
    // watch chatbot files
    gulp.watch([
        config.sourcePath + 'js/chatbot/**/*.js', 
        'chatbot.js'
    ], gulp.series(chatbotLint));
    // watch images
    gulp.watch(config.sourcePath + 'img/**', img);
    // watch json files
    gulp.watch(config.sourcePath + 'json/**', json);
    // watch fonts
    gulp.watch(config.sourcePath + 'font/**', font);
    // watch svg
    gulp.watch(config.sourcePath + 'svg/**', svg);
}

// watch files and reload browser on file change
function watchAndReload() {
    watch();

    gulp.watch(config.publicPath + '**/*.{css,eot,ico,js,json,jpg,otf,png,svg,ttf,woff,woff2}', browserSyncReload);
}

exports.scss = scss;
exports.scssLint = scssLint;
exports.js = js;
exports.jsLint = jsLint;
exports.jsRequire = jsRequire;
exports.json = json;
exports.img = img;
exports.font = font;
exports.svg = svg;
exports.vue = vue;
exports.vueJs = vueJs;
exports.vueJsLint = vueJsLint;
exports.vueLint = vueLint;
exports.chatbotLint = chatbotLint;
exports.cleanUp = cleanUp;
exports.watch = watch;
exports.watchAndReload = watchAndReload;
exports.browserSyncInit = browserSyncInit;
exports.browserSyncReload = browserSyncReload;

// lintAll task
gulp.task('lintAll', gulp.series(scssLint, jsLint, vueJsLint, vueLint, chatbotLint));

// build task
gulp.task('build', gulp.series(cleanUp, scss, scssLint, js, jsLint, jsRequire, json, img, font, svg, vue, vueJs, vueJsLint, vueLint, chatbotLint));

// default task if you just call "gulp"
gulp.task('default', gulp.parallel(watchAndReload, browserSyncInit));