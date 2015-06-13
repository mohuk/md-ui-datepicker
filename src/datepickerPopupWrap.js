(function(){

	angular.module('ui.bootstrap.datepicker')
		.directive('datepickerPopupWrap', function() {
		  return {
		    restrict:'EA',
		    replace: true,
		    transclude: true,
		    templateUrl: '../template/popup.html',
		    link:function (scope, element, attrs) {
		      element.bind('click', function(event) {
		        event.preventDefault();
		        event.stopPropagation();
		      });
		    }
		  };
		});

}());