var gulp = require('gulp');
var jshint = require('gulp-jshint');
var karma = require('karma').server;
var extract = require('gulp-html-extract');
var cached = require('gulp-cached');

var paths = {
  client: ['client/slements/*/*.js', 'client/scripts/*.js'],
  server: 'server/routes/*.js',
  html: ['client/index.html', 'client/elements/*.html']
};

/**
 * Run test once and exit
 */
gulp.task('test',['htmllint','jslint'], function (done) {
  karma.start({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, done);
});

/**
 * Watch for file changes and re-run tests on each change
 */
gulp.task('tdd',['htmllint','jslint'],function (done) {
  karma.start({
    configFile: __dirname + '/karma.conf.js'
  }, done);
});


gulp.task('htmllint',function() {
  return gulp.src(paths.html)
    .pipe(cached('htmllint'))
    .pipe(extract({sel: 'script,code.javascript'}))
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'));
});
 gulp.task('jslint',function(){
   return gulp.src([].concat.apply([],[paths.client,paths.server]))
     .pipe(cached('jslint'))
     .pipe(jshint('.jshintrc'))
     .pipe(jshint.reporter('jshint-stylish'))
     .pipe(jshint.reporter('fail'));

 });
gulp.task('watch',function(){
  gulp.watch(paths.html,['htmllint']);
  gulp.watch([paths.client,paths.server],['jslint']);
});

gulp.task('default', ['tdd','watch']);

