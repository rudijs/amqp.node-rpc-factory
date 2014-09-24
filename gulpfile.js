  'use strict';

  var gulp = require('gulp'),
    taskListing = require('gulp-task-listing'),
// linting
    jshint = require('gulp-jshint'),
// Test Unit
    exec = require('child_process').exec;

  var jsLintFiles = [
    'gulpfile.js',
    'lib/*.js',
    'test/*.js',
    'examples/**/*.js'
  ];

  gulp.task('default', taskListing);
  gulp.task('help', taskListing);

  gulp.task('watch-lint', function () {
    gulp.watch(jsLintFiles, ['lint']);
  });

  gulp.task('watch-test', function () {
    gulp.watch([
      'lib/*.js',
      'test/*.spec.js'
    ], ['test']);
  });

  gulp.task('lint', function () {
    gulp.src(jsLintFiles)
      .pipe(jshint('.jshintrc', {fail: true}))
      .pipe(jshint.reporter()); // Console output
  });

  gulp.task('test', function (cb) {

    exec('NODE_ENV=test ./node_modules/istanbul/lib/cli.js cover node_modules/mocha/bin/_mocha ' +
    '-x \'*.spec.js\' --root lib/ --dir test/coverage  -- \'test/*.spec.js\'', function (err, stdout, stderr) {
      console.log(stdout);
      console.log(stderr);
      cb(err);
    });
  });
