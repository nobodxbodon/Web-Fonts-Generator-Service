var gulp=require('gulp');
var ttf2woff = require('gulp-ttf2woff');

gulp.task('ttf2woff', function(){
  gulp.src(['TTFRender/fonts/new_current.ttf'])
    .pipe(ttf2woff())
    .pipe(gulp.dest('TTFRender/fonts/'));
});
