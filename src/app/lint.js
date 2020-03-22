/**
 * Lint given files
 *
 * @param gulp mixed
 * @param module mixed
 * @param paths array
 * @param file string
 * @return gulp signal
 */
function lint(gulp, module, paths, file) {
    return gulp.src(paths)
        .pipe(module(require('./' + file + '-lint.json')))
        .pipe(module.format())
        .pipe(module.failOnError());
}

module.exports = lint;
