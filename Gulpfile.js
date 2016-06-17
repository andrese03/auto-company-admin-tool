// Include Gulp
var gulp = require('gulp');

// Include Our Plugins
var nodemon = require('gulp-nodemon');

gulp.task('serve', function () {
  nodemon({'script': './server/server.js', 'ext': 'js html', 'env': { 'NODE_ENV': 'development' }})
  .on('restart', function () {
    console.log('[*] Restarting Server...')
  })
});


// Gulp default Task
gulp.task('default', ['serve'], function() {});