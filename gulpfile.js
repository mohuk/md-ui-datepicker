var gulp = require('gulp');
var concat = require('gulp-concat');
var ngAnnotate = require('gulp-ng-annotate');
var uglify = require('gulp-uglify');
var bump = require('gulp-bump');
var git = require('gulp-git');
var tagVersion = require('gulp-tag-version');
var filter = require('gulp-filter');
var ngTemplates = require('gulp-ng-templates');
var replace = require('gulp-replace');

var componentSrc = [
  'src/uibootstrap.js',
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
  'src/yearpicker.js'
];

var templatesSrc = [
  'template/*.html'
]

var pkgFiles = [
  './bower.json',
  './package.json'
];

var templates = {
  from: 'angular.module("ui.bootstrap", [',
  to: 'angular.module("ui.bootstrap", [\n\t\t"ui.bootstrap.datepicker.templates",'
}

gulp.task('default', function(){
  return gulp.src(templatesSrc)
    .pipe(ngTemplates('ui.bootstrap.datepicker.templates'))
    .pipe(gulp.src(componentSrc))
    .pipe(concat('md-ui-datepicker.js'))
    .pipe(replace(templates.from, templates.to))
    .pipe(replace('../template/',''))
    .pipe(gulp.dest('dist/'));
});

function inc(importance) {
  // get all the files to bump version in
  return gulp.src(pkgFiles)
    // bump the version number in those files
    .pipe(bump({type: importance}))
    // save it back to filesystem
    .pipe(gulp.dest('./'))
    // commit the changed version number
    .pipe(git.commit('bumping ' + importance))

    // read only one file to get the version number
    .pipe(filter('package.json'))
    // **tag it in the repository**
    .pipe(tagVersion());
}

gulp.task('patch', function() { return inc('patch'); })
gulp.task('feature', function() { return inc('minor'); })
gulp.task('release', function() { return inc('major'); })
