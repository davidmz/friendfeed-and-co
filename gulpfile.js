var
    manifest = require('./manifest.json'),
    gulp = require('gulp'),
    concat = require('gulp-concat'),
    insert = require('gulp-insert'),
    uglify = require('gulp-uglify'),
    watch = require('gulp-watch'),
    batch = require('gulp-batch'),
    template = require('gulp-template');

gulp.task('templates-replace', function () {
    return gulp.src(['templates/*'])
        .pipe(template({version: manifest.version}))
        .pipe(gulp.dest('.'));
});

gulp.task('default', ['templates-replace'], function () {
    var scripts = [];
    manifest.content_scripts.forEach(function (cs) {
        scripts = scripts.concat(cs.js);
    });

    return gulp.src(scripts)
        .pipe(concat('ffco-sac.min.js'))
        .pipe(insert.prepend(
            "(function(){\n" +
            "   doIt = function() {\n" +
            "\n"
        ))
        .pipe(insert.append(
            "\n" +
            "};\n" +
            "if (document.readyState === 'complete' || document.readyState === 'interactive') { doIt(); } else { document.addEventListener(\"DOMContentLoaded\", doIt); }\n" +
            "})();"
        ))
        .pipe(uglify())
        .pipe(insert.prepend(
            "/**\n" +
            " * FriendFeed & Co (Stand Alone Complex)\n" +
            " * @version " + manifest.version + "\n" +
            " * @copyright 2014, 2015 David Mzareulyan\n" +
            " * @link https://github.com/davidmz/friendfeed-and-co\n" +
            " * @license MIT\n" +
            " */\n"
        ))
        .pipe(gulp.dest('.'));
});

gulp.task('watch', function () {
    watch(["./actions/*", "./templates/*", "./lib.js", "./init.js", "./manifest.json"], batch(function () { gulp.start('default'); }));
});

