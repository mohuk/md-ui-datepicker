(function(){

	angular.module('ui.bootstrap.datepicker')
		.directive('yearpicker', ['dateFilter', function (dateFilter) {
		  return {
		    restrict: 'EA',
		    replace: true,
		    templateUrl: '../template/year.html',
		    require: '^datepicker',
		    link: function(scope, element, attrs, ctrl) {
		      var range = ctrl.yearRange;

		      ctrl.step = { years: range };
		      ctrl.element = element;

		      function getStartingYear( year ) {
		        return parseInt((year - 1) / range, 10) * range + 1;
		      }

		      ctrl._refreshView = function() {
		        var years = new Array(range);

		        for ( var i = 0, start = getStartingYear(ctrl.activeDate.getFullYear()); i < range; i++ ) {
		          years[i] = angular.extend(ctrl.createDateObject(new Date(start + i, 0, 1), ctrl.formatYear), {
		            uid: scope.uniqueId + '-' + i
		          });
		        }

		        scope.title = [years[0].label, years[range - 1].label].join(' - ');
		        scope.rows = ctrl.split(years, 5);
		      };

		      ctrl.compare = function(date1, date2) {
		        return date1.getFullYear() - date2.getFullYear();
		      };

		      ctrl.handleKeyDown = function( key, evt ) {
		        var date = ctrl.activeDate.getFullYear();

		        if (key === 'left') {
		          date = date - 1;   // up
		        } else if (key === 'up') {
		          date = date - 5;   // down
		        } else if (key === 'right') {
		          date = date + 1;   // down
		        } else if (key === 'down') {
		          date = date + 5;
		        } else if (key === 'pageup' || key === 'pagedown') {
		          date += (key === 'pageup' ? - 1 : 1) * ctrl.step.years;
		        } else if (key === 'home') {
		          date = getStartingYear( ctrl.activeDate.getFullYear() );
		        } else if (key === 'end') {
		          date = getStartingYear( ctrl.activeDate.getFullYear() ) + range - 1;
		        }
		        ctrl.activeDate.setFullYear(date);
		      };

		      ctrl.refreshView();
		    }
		  };
		}]);

}());