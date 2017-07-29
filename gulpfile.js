var gulp = require('gulp');
var jshint = require('gulp-jshint');
var jscs = require('gulp-jscs');
var nodemon = require('gulp-nodemon');

var jsFiles = ['*.js', 'src/**/*.js'];

gulp.task('style', function() {
    return gulp.src(jsFiles)
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish', {
            verbose: true
        }))
        .pipe(jscs());
});

gulp.task('inject', function() {
    var wiredep = require('wiredep').stream;
    var inject = require('gulp-inject');

    var target = gulp.src('./www/index.html');

    var injectSrc = gulp.src(['./www/assets/css/*.css' , './www/components/**/*.js' , './www/shared/**/*.js', './www/assets/**/*.js' ], {
        read: false
    });

    var injectOptions = {
        ignorePath: '/www'
    };


    return target.pipe(inject(injectSrc, injectOptions))
        .pipe(gulp.dest('./www/'));
});

gulp.task('serve', ['inject'], function() {
    var options = {
        script: 'server/app.js',
        delayTime: 1,
        env: {
            'PORT': 5007
        },
        watch: jsFiles
    };

    return nodemon(options)
        .on('restart', function(ev) {
            console.log('Restarting...');
        });
});