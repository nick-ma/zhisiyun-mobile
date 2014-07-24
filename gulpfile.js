var pkg = require("./package.json");
var gulp = require('gulp');
var jshint = require('gulp-jshint');
var gutil = require('gulp-util');
var mocha = require('gulp-mocha');
var minifycss = require('gulp-minify-css');
var clean = require('gulp-clean');
var concat = require('gulp-concat');
var shell = require('gulp-shell');
var rjs = require('requirejs');

var watching = false;
var onError = function(err) {
    if (watching) {
        this.emit('end');
    } else {
        process.exit(1);
    }
};
gulp.task('lint', function() {
    return gulp.src(['gulpfile.js', 'collections/*.js', 'models/*.js', 'routers/*.js', 'views/**/*.js', 'test/*.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('test', function() {
    return gulp.src('test/*.js')
        .pipe(mocha({
            reporter: 'spec'
        }))
        .on('error', onError);

});

gulp.task('watch', function() {
    watching = true;
    gulp.watch(['cllections/*.js', 'models/*.js', 'routers/*.js', 'views/*.js', 'test/*.js'], function() {
        gulp.run('lint', 'test');
    });
});

gulp.task('js', function(cb) {
    return rjs.optimize({
        baseUrl: './',
        almond: true,
        out: './_static/app.js',
        include: ['./app'],
        mainConfigFile: './app.js',
        enforceDefine: true,
        name: './bower_components/almond/almond',
        generateSourceMaps: false,
        preserveLicenseComments: false,
        optimize: "uglify2",
        wrap: {
            startFile: 'libs/start.js',
            endFile: 'libs/end.js'
        },
        paths: {
            "jquerymobile": "./libs/jquery.mobile-1.4.2",
        },
        shim: {
            "backbone": {
                "deps": ["underscore", "jquery"],
                "exports": "Backbone" //attaches "Backbone" to the window object
            },
            'handlebars': { //amd work strange, so use normal+exports
                "exports": 'Handlebars'
            },
            'formatdate': ['jquery'],
            "jqmcal": ["jquery"],
        },
        wrapShim: true,
        findNestedDependencies: true,

        //Inlines the text for any text! dependencies, to avoid the separate
        //async XMLHttpRequest calls to load those dependencies.
        inlineText: true,
    }, function(buildResponse) {
        console.log('build response', buildResponse);
        cb();
    });
});
gulp.task('css', function() {
    gulp.src(['./css/jquery.mobile-1.4.2.css', './css/bs3.css', './css/jw-jqm-cal.ios7.css'])
        .pipe(concat('main.css'))
        .pipe(minifycss())
        .pipe(gulp.dest('./_static/'));
    // .pipe(notify({ message: 'Styles task complete' }));
});
gulp.task('copy', function() {
    gulp.src('./css/images/**')
        .pipe(gulp.dest('./_static/images/'));
    gulp.src('./libs/require.js')
        .pipe(gulp.dest('./_static/'));
})
gulp.task('clean', function() {
    gulp.src('./_static/**', {
        read: false
    })
        .pipe(clean({
            force: true
        }));

});
gulp.task('deploy', shell.task(['./deploy.sh']));
gulp.task('build', ['js', 'css', 'copy']);
gulp.task('default', ['watch']);