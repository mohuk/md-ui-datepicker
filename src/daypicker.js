(function(){

	angular.module('ui.bootstrap.datepicker')
		.directive('daypicker', ['dateFilter', function (dateFilter) {
		  return {
		    restrict: 'EA',
		    replace: true,
		    templateUrl: '../template/day.html',
		    require: '^datepicker',
		    link: function(scope, element, attrs, ctrl) {
		      scope.showWeeks = ctrl.showWeeks;

		      ctrl.step = { months: 1 };
		      ctrl.element = element;

		      var DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
		      function getDaysInMonth( year, month ) {
		        return ((month === 1) && (year % 4 === 0) && ((year % 100 !== 0) || (year % 400 === 0))) ? 29 : DAYS_IN_MONTH[month];
		      }

		      function getDates(startDate, n) {
		        var dates = new Array(n), current = new Date(startDate), i = 0;
		        current.setHours(12); // Prevent repeated dates because of timezone bug
		        while ( i < n ) {
		          dates[i++] = new Date(current);
		          current.setDate( current.getDate() + 1 );
		        }
		        return dates;
		      }

		      ctrl._refreshView = function() {
		        var year = ctrl.activeDate.getFullYear(),
		          month = ctrl.activeDate.getMonth(),
		          firstDayOfMonth = new Date(year, month, 1),
		          difference = ctrl.startingDay - firstDayOfMonth.getDay(),
		          numDisplayedFromPreviousMonth = (difference > 0) ? 7 - difference : - difference,
		          firstDate = new Date(firstDayOfMonth);

		        if ( numDisplayedFromPreviousMonth > 0 ) {
		          firstDate.setDate( - numDisplayedFromPreviousMonth + 1 );
		        }

		        // 42 is the number of days on a six-month calendar
		        var days = getDates(firstDate, 42);
		        for (var i = 0; i < 42; i ++) {
		          days[i] = angular.extend(ctrl.createDateObject(days[i], ctrl.formatDay), {
		            secondary: days[i].getMonth() !== month,
		            uid: scope.uniqueId + '-' + i
		          });
		        }

		        scope.labels = new Array(7);
		        for (var j = 0; j < 7; j++) {
		          scope.labels[j] = {
		            abbr: dateFilter(days[j].date, ctrl.formatDayHeader),
		            full: dateFilter(days[j].date, 'EEEE')
		          };
		        }

		        scope.title = dateFilter(ctrl.activeDate, ctrl.formatDayTitle);
		        scope.rows = ctrl.split(days, 7);

		        if ( scope.showWeeks ) {
		          scope.weekNumbers = [];
		          var thursdayIndex = (4 + 7 - ctrl.startingDay) % 7,
		              numWeeks = scope.rows.length;
		          for (var curWeek = 0; curWeek < numWeeks; curWeek++) {
		            scope.weekNumbers.push(
		              getISO8601WeekNumber( scope.rows[curWeek][thursdayIndex].date ));
		          }
		        }
		      };

		      ctrl.compare = function(date1, date2) {
		        return (new Date( date1.getFullYear(), date1.getMonth(), date1.getDate() ) - new Date( date2.getFullYear(), date2.getMonth(), date2.getDate() ) );
		      };

		      function getISO8601WeekNumber(date) {
		        var checkDate = new Date(date);
		        checkDate.setDate(checkDate.getDate() + 4 - (checkDate.getDay() || 7)); // Thursday
		        var time = checkDate.getTime();
		        checkDate.setMonth(0); // Compare with Jan 1
		        checkDate.setDate(1);
		        return Math.floor(Math.round((time - checkDate) / 86400000) / 7) + 1;
		      }

		      ctrl.handleKeyDown = function( key, evt ) {
		        var date = ctrl.activeDate.getDate();

		        if (key === 'left') {
		          date = date - 1;   // up
		        } else if (key === 'up') {
		          date = date - 7;   // down
		        } else if (key === 'right') {
		          date = date + 1;   // down
		        } else if (key === 'down') {
		          date = date + 7;
		        } else if (key === 'pageup' || key === 'pagedown') {
		          var month = ctrl.activeDate.getMonth() + (key === 'pageup' ? - 1 : 1);
		          ctrl.activeDate.setMonth(month, 1);
		          date = Math.min(getDaysInMonth(ctrl.activeDate.getFullYear(), ctrl.activeDate.getMonth()), date);
		        } else if (key === 'home') {
		          date = 1;
		        } else if (key === 'end') {
		          date = getDaysInMonth(ctrl.activeDate.getFullYear(), ctrl.activeDate.getMonth());
		        }
		        ctrl.activeDate.setDate(date);
		      };

		      ctrl.refreshView();
		    }
		  };
		}]);

}());