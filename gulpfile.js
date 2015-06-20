var gulp = require('gulp');
var concat = require('gulp-concat');
var ngAnnotate = require('gulp-ng-annotate');
var uglify = require('gulp-uglify');

var files = [
  'src/datepicker.js',
  'src/dateparser/dateParser.js',
  'src/position/position.js',
  'src/datePickerConfig.js',
  'src/DatepickerController.js',
  'src/datepickerPopup.js',
  'src/datepickerPopupConfig.js',
  'src/datepickerPopupWrap.js',
  'src/daypicker.js',
  'src/monthpicker.js',
  'src/yearpicker.js',
  'src/ui.bootstrap.js'
]

gulp.task('default', function(){
  return gulp.src(files)
    .pipe(concat('md-ui-datepicker.js'))
    .pipe(ngAnnotate())
    //.pipe(uglify())
    .pipe(gulp.dest('dist/'));
});
