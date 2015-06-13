(function(){

	angular.module('ui.bootstrap.datepicker')
		.directive('datepickerPopup', ['$compile', '$parse', '$document', '$position', 'dateFilter', 'dateParser', 'datepickerPopupConfig',
		function ($compile, $parse, $document, $position, dateFilter, dateParser, datepickerPopupConfig) {
		  return {
		    restrict: 'EA',
		    require: 'ngModel',
		    scope: {
		      isOpen: '=?',
		      currentText: '@',
		      clearText: '@',
		      closeText: '@',
		      dateDisabled: '&',
		      customClass: '&'
		    },
		    link: function(scope, element, attrs, ngModel) {
		      var dateFormat,
		          closeOnDateSelection = angular.isDefined(attrs.closeOnDateSelection) ? scope.$parent.$eval(attrs.closeOnDateSelection) : datepickerPopupConfig.closeOnDateSelection,
		          appendToBody = angular.isDefined(attrs.datepickerAppendToBody) ? scope.$parent.$eval(attrs.datepickerAppendToBody) : datepickerPopupConfig.appendToBody;

		      scope.showButtonBar = angular.isDefined(attrs.showButtonBar) ? scope.$parent.$eval(attrs.showButtonBar) : datepickerPopupConfig.showButtonBar;

		      scope.getText = function( key ) {
		        return scope[key + 'Text'] || datepickerPopupConfig[key + 'Text'];
		      };

		      var isHtml5DateInput = false;
		      if (datepickerPopupConfig.html5Types[attrs.type]) {
		        dateFormat = datepickerPopupConfig.html5Types[attrs.type];
		        isHtml5DateInput = true;
		      } else {
		        dateFormat = attrs.datepickerPopup || datepickerPopupConfig.datepickerPopup;
		        attrs.$observe('datepickerPopup', function(value, oldValue) {
		            var newDateFormat = value || datepickerPopupConfig.datepickerPopup;
		            // Invalidate the $modelValue to ensure that formatters re-run
		            // FIXME: Refactor when PR is merged: https://github.com/angular/angular.js/pull/10764
		            if (newDateFormat !== dateFormat) {
		              dateFormat = newDateFormat;
		              ngModel.$modelValue = null;

		              if (!dateFormat) {
		                throw new Error('datepickerPopup must have a date format specified.');
		              }
		            }
		        });
		      }

		      if (!dateFormat) {
		        throw new Error('datepickerPopup must have a date format specified.');
		      }

		      if (isHtml5DateInput && attrs.datepickerPopup) {
		        throw new Error('HTML5 date input types do not support custom formats.');
		      }

		      // popup element used to display calendar
		      var popupEl = angular.element('<div datepicker-popup-wrap><div datepicker></div></div>');
		      popupEl.attr({
		        'ng-model': 'date',
		        'ng-change': 'dateSelection()'
		      });

		      function cameltoDash( string ){
		        return string.replace(/([A-Z])/g, function($1) { return '-' + $1.toLowerCase(); });
		      }

		      // datepicker element
		      var datepickerEl = angular.element(popupEl.children()[0]);
		      if (isHtml5DateInput) {
		        if (attrs.type == 'month') {
		          datepickerEl.attr('datepicker-mode', '"month"');
		          datepickerEl.attr('min-mode', 'month');
		        }
		      }

		      if ( attrs.datepickerOptions ) {
		        var options = scope.$parent.$eval(attrs.datepickerOptions);
		        if(options.initDate) {
		          scope.initDate = options.initDate;
		          datepickerEl.attr( 'init-date', 'initDate' );
		          delete options.initDate;
		        }
		        angular.forEach(options, function( value, option ) {
		          datepickerEl.attr( cameltoDash(option), value );
		        });
		      }

		      scope.watchData = {};
		      angular.forEach(['minDate', 'maxDate', 'datepickerMode', 'initDate', 'shortcutPropagation'], function( key ) {
		        if ( attrs[key] ) {
		          var getAttribute = $parse(attrs[key]);
		          scope.$parent.$watch(getAttribute, function(value){
		            scope.watchData[key] = value;
		          });
		          datepickerEl.attr(cameltoDash(key), 'watchData.' + key);

		          // Propagate changes from datepicker to outside
		          if ( key === 'datepickerMode' ) {
		            var setAttribute = getAttribute.assign;
		            scope.$watch('watchData.' + key, function(value, oldvalue) {
		              if ( value !== oldvalue ) {
		                setAttribute(scope.$parent, value);
		              }
		            });
		          }
		        }
		      });
		      if (attrs.dateDisabled) {
		        datepickerEl.attr('date-disabled', 'dateDisabled({ date: date, mode: mode })');
		      }

		      if (attrs.showWeeks) {
		        datepickerEl.attr('show-weeks', attrs.showWeeks);
		      }

		      if (attrs.customClass){
		        datepickerEl.attr('custom-class', 'customClass({ date: date, mode: mode })');
		      }

		      function parseDate(viewValue) {
		        if (angular.isNumber(viewValue)) {
		          // presumably timestamp to date object
		          viewValue = new Date(viewValue);
		        }

		        if (!viewValue) {
		          return null;
		        } else if (angular.isDate(viewValue) && !isNaN(viewValue)) {
		          return viewValue;
		        } else if (angular.isString(viewValue)) {
		          var date = dateParser.parse(viewValue, dateFormat, scope.date) || new Date(viewValue);
		          if (isNaN(date)) {
		            return undefined;
		          } else {
		            return date;
		          }
		        } else {
		          return undefined;
		        }
		      }

		      function validator(modelValue, viewValue) {
		        var value = modelValue || viewValue;
		        if (angular.isNumber(value)) {
		          value = new Date(value);
		        }
		        if (!value) {
		          return true;
		        } else if (angular.isDate(value) && !isNaN(value)) {
		          return true;
		        } else if (angular.isString(value)) {
		          var date = dateParser.parse(value, dateFormat) || new Date(value);
		          return !isNaN(date);
		        } else {
		          return false;
		        }
		      }

		      if (!isHtml5DateInput) {
		        // Internal API to maintain the correct ng-invalid-[key] class
		        ngModel.$$parserName = 'date';
		        ngModel.$validators.date = validator;
		        ngModel.$parsers.unshift(parseDate);
		        ngModel.$formatters.push(function (value) {
		          scope.date = value;
		          return ngModel.$isEmpty(value) ? value : dateFilter(value, dateFormat);
		        });
		      }
		      else {
		        ngModel.$formatters.push(function (value) {
		          scope.date = value;
		          return value;
		        });
		      }

		      // Inner change
		      scope.dateSelection = function(dt) {
		        if (angular.isDefined(dt)) {
		          scope.date = dt;
		        }
		        var date = scope.date ? dateFilter(scope.date, dateFormat) : '';
		        element.val(date);
		        ngModel.$setViewValue(date);

		        if ( closeOnDateSelection ) {
		          scope.isOpen = false;
		          element[0].focus();
		        }
		      };

		      // Detect changes in the view from the text box
		      ngModel.$viewChangeListeners.push(function () {
		        scope.date = dateParser.parse(ngModel.$viewValue, dateFormat, scope.date) || new Date(ngModel.$viewValue);
		      });

		      var documentClickBind = function(event) {
		        if (scope.isOpen && event.target !== element[0]) {
		          scope.$apply(function() {
		            scope.isOpen = false;
		          });
		        }
		      };

		      var keydown = function(evt, noApply) {
		        scope.keydown(evt);
		      };
		      element.bind('keydown', keydown);

		      scope.keydown = function(evt) {
		        if (evt.which === 27) {
		          evt.preventDefault();
		          if (scope.isOpen) {
		            evt.stopPropagation();
		          }
		          scope.close();
		        } else if (evt.which === 40 && !scope.isOpen) {
		          scope.isOpen = true;
		        }
		      };

		      scope.$watch('isOpen', function(value) {
		        if (value) {
		          scope.$broadcast('datepicker.focus');
		          scope.position = appendToBody ? $position.offset(element) : $position.position(element);
		          scope.position.top = scope.position.top + element.prop('offsetHeight');

		          $document.bind('click', documentClickBind);
		        } else {
		          $document.unbind('click', documentClickBind);
		        }
		      });

		      scope.select = function( date ) {
		        if (date === 'today') {
		          var today = new Date();
		          if (angular.isDate(scope.date)) {
		            date = new Date(scope.date);
		            date.setFullYear(today.getFullYear(), today.getMonth(), today.getDate());
		          } else {
		            date = new Date(today.setHours(0, 0, 0, 0));
		          }
		        }
		        scope.dateSelection( date );
		      };

		      scope.close = function() {
		        scope.isOpen = false;
		        element[0].focus();
		      };

		      var $popup = $compile(popupEl)(scope);
		      // Prevent jQuery cache memory leak (template is now redundant after linking)
		      popupEl.remove();

		      if ( appendToBody ) {
		        $document.find('body').append($popup);
		      } else {
		        element.after($popup);
		      }

		      scope.$on('$destroy', function() {
		        $popup.remove();
		        element.unbind('keydown', keydown);
		        $document.unbind('click', documentClickBind);
		      });
		    }
		  };
		}]);

}());