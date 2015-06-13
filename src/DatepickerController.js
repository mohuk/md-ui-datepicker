(function(){

	angular.module('ui.bootstrap.datepicker')
		.controller('DatepickerController', ['$scope', '$attrs', '$parse', '$interpolate', '$timeout', '$log', 'dateFilter', 'datepickerConfig', function($scope, $attrs, $parse, $interpolate, $timeout, $log, dateFilter, datepickerConfig) {
		  var self = this,
		      ngModelCtrl = { $setViewValue: angular.noop }; // nullModelCtrl;

		  // Modes chain
		  this.modes = ['day', 'month', 'year'];

		  // Configuration attributes
		  angular.forEach(['formatDay', 'formatMonth', 'formatYear', 'formatDayHeader', 'formatDayTitle', 'formatMonthTitle',
		                   'minMode', 'maxMode', 'showWeeks', 'startingDay', 'yearRange', 'shortcutPropagation'], function( key, index ) {
		    self[key] = angular.isDefined($attrs[key]) ? (index < 8 ? $interpolate($attrs[key])($scope.$parent) : $scope.$parent.$eval($attrs[key])) : datepickerConfig[key];
		  });

		  // Watchable date attributes
		  angular.forEach(['minDate', 'maxDate'], function( key ) {
		    if ( $attrs[key] ) {
		      $scope.$parent.$watch($parse($attrs[key]), function(value) {
		        self[key] = value ? new Date(value) : null;
		        self.refreshView();
		      });
		    } else {
		      self[key] = datepickerConfig[key] ? new Date(datepickerConfig[key]) : null;
		    }
		  });

		  $scope.datepickerMode = $scope.datepickerMode || datepickerConfig.datepickerMode;
		  $scope.maxMode = self.maxMode;
		  $scope.uniqueId = 'datepicker-' + $scope.$id + '-' + Math.floor(Math.random() * 10000);

		  if(angular.isDefined($attrs.initDate)) {
		    this.activeDate = $scope.$parent.$eval($attrs.initDate) || new Date();
		    $scope.$parent.$watch($attrs.initDate, function(initDate){
		      if(initDate && (ngModelCtrl.$isEmpty(ngModelCtrl.$modelValue) || ngModelCtrl.$invalid)){
		        self.activeDate = initDate;
		        self.refreshView();
		      }
		    });
		  } else {
		    this.activeDate =  new Date();
		  }

		  $scope.isActive = function(dateObject) {
		    if (self.compare(dateObject.date, self.activeDate) === 0) {
		      $scope.activeDateId = dateObject.uid;
		      return true;
		    }
		    return false;
		  };

		  this.init = function( ngModelCtrl_ ) {
		    ngModelCtrl = ngModelCtrl_;

		    ngModelCtrl.$render = function() {
		      self.render();
		    };
		  };

		  this.render = function() {
		    if ( ngModelCtrl.$viewValue ) {
		      var date = new Date( ngModelCtrl.$viewValue ),
		          isValid = !isNaN(date);

		      if ( isValid ) {
		        this.activeDate = date;
		      } else {
		        $log.error('Datepicker directive: "ng-model" value must be a Date object, a number of milliseconds since 01.01.1970 or a string representing an RFC2822 or ISO 8601 date.');
		      }
		      ngModelCtrl.$setValidity('date', isValid);
		    }
		    this.refreshView();
		  };

		  this.refreshView = function() {
		    if ( this.element ) {
		      this._refreshView();

		      var date = ngModelCtrl.$viewValue ? new Date(ngModelCtrl.$viewValue) : null;
		      ngModelCtrl.$setValidity('date-disabled', !date || (this.element && !this.isDisabled(date)));
		    }
		  };

		  this.createDateObject = function(date, format) {
		    var model = ngModelCtrl.$viewValue ? new Date(ngModelCtrl.$viewValue) : null;
		    return {
		      date: date,
		      label: dateFilter(date, format),
		      selected: model && this.compare(date, model) === 0,
		      disabled: this.isDisabled(date),
		      current: this.compare(date, new Date()) === 0,
		      customClass: this.customClass(date)
		    };
		  };

		  this.isDisabled = function( date ) {
		    return ((this.minDate && this.compare(date, this.minDate) < 0) || (this.maxDate && this.compare(date, this.maxDate) > 0) || ($attrs.dateDisabled && $scope.dateDisabled({date: date, mode: $scope.datepickerMode})));
		  };

		    this.customClass = function( date ) {
		      return $scope.customClass({date: date, mode: $scope.datepickerMode});
		    };

		  // Split array into smaller arrays
		  this.split = function(arr, size) {
		    var arrays = [];
		    while (arr.length > 0) {
		      arrays.push(arr.splice(0, size));
		    }
		    return arrays;
		  };

		  $scope.select = function( date ) {
		    if ( $scope.datepickerMode === self.minMode ) {
		      var dt = ngModelCtrl.$viewValue ? new Date( ngModelCtrl.$viewValue ) : new Date(0, 0, 0, 0, 0, 0, 0);
		      dt.setFullYear( date.getFullYear(), date.getMonth(), date.getDate() );
		      ngModelCtrl.$setViewValue( dt );
		      ngModelCtrl.$render();
		    } else {
		      self.activeDate = date;
		      $scope.datepickerMode = self.modes[ self.modes.indexOf( $scope.datepickerMode ) - 1 ];
		    }
		  };

		  $scope.move = function( direction ) {
		    var year = self.activeDate.getFullYear() + direction * (self.step.years || 0),
		        month = self.activeDate.getMonth() + direction * (self.step.months || 0);
		    self.activeDate.setFullYear(year, month, 1);
		    self.refreshView();
		  };

		  $scope.toggleMode = function( direction ) {
		    direction = direction || 1;

		    if (($scope.datepickerMode === self.maxMode && direction === 1) || ($scope.datepickerMode === self.minMode && direction === -1)) {
		      return;
		    }

		    $scope.datepickerMode = self.modes[ self.modes.indexOf( $scope.datepickerMode ) + direction ];
		  };

		  // Key event mapper
		  $scope.keys = { 13:'enter', 32:'space', 33:'pageup', 34:'pagedown', 35:'end', 36:'home', 37:'left', 38:'up', 39:'right', 40:'down' };

		  var focusElement = function() {
		    $timeout(function() {
		      self.element[0].focus();
		    }, 0 , false);
		  };

		  // Listen for focus requests from popup directive
		  $scope.$on('datepicker.focus', focusElement);

		  $scope.keydown = function( evt ) {
		    var key = $scope.keys[evt.which];

		    if ( !key || evt.shiftKey || evt.altKey ) {
		      return;
		    }

		    evt.preventDefault();
		    if(!self.shortcutPropagation){
		        evt.stopPropagation();
		    }

		    if (key === 'enter' || key === 'space') {
		      if ( self.isDisabled(self.activeDate)) {
		        return; // do nothing
		      }
		      $scope.select(self.activeDate);
		      focusElement();
		    } else if (evt.ctrlKey && (key === 'up' || key === 'down')) {
		      $scope.toggleMode(key === 'up' ? 1 : -1);
		      focusElement();
		    } else {
		      self.handleKeyDown(key, evt);
		      self.refreshView();
		    }
		  };
		}])

}());