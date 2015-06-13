(function(){

	angular.module('ui.bootstrap.datepicker')
		.directive('monthpicker', ['dateFilter', function (dateFilter) {
		  return {
		    restrict: 'EA',
		    replace: true,
		    templateUrl: '../template/month.html',
		    require: '^datepicker',
		    link: function(scope, element, attrs, ctrl) {
		      ctrl.step = { years: 1 };
		      ctrl.element = element;

		      ctrl._refreshView = function() {
		        var months = new Array(12),
		            year = ctrl.activeDate.getFullYear();

		        for ( var i = 0; i < 12; i++ ) {
		          months[i] = angular.extend(ctrl.createDateObject(new Date(year, i, 1), ctrl.formatMonth), {
		            uid: scope.uniqueId + '-' + i
		          });
		        }

		        scope.title = dateFilter(ctrl.activeDate, ctrl.formatMonthTitle);
		        scope.rows = ctrl.split(months, 3);
		      };

		      ctrl.compare = function(date1, date2) {
		        return new Date( date1.getFullYear(), date1.getMonth() ) - new Date( date2.getFullYear(), date2.getMonth() );
		      };

		      ctrl.handleKeyDown = function( key, evt ) {
		        var date = ctrl.activeDate.getMonth();

		        if (key === 'left') {
		          date = date - 1;   // up
		        } else if (key === 'up') {
		          date = date - 3;   // down
		        } else if (key === 'right') {
		          date = date + 1;   // down
		        } else if (key === 'down') {
		          date = date + 3;
		        } else if (key === 'pageup' || key === 'pagedown') {
		          var year = ctrl.activeDate.getFullYear() + (key === 'pageup' ? - 1 : 1);
		          ctrl.activeDate.setFullYear(year);
		        } else if (key === 'home') {
		          date = 0;
		        } else if (key === 'end') {
		          date = 11;
		        }
		        ctrl.activeDate.setMonth(date);
		      };

		      ctrl.refreshView();
		    }
		  };
		}]);

}());