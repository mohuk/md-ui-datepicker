(function(){

	angular
	.module('ui.bootstrap.datepicker', [
		'ui.bootstrap.dateparser', 
		'ui.bootstrap.position'
	])
	.directive( 'datepicker', function () {
	  return {
	    restrict: 'EA',
	    replace: true,
	    templateUrl: '../template/datepicker.html',
	    scope: {
	      datepickerMode: '=?',
	      dateDisabled: '&',
	      customClass: '&',
	      shortcutPropagation: '&?'
	    },
	    require: ['datepicker', '?^ngModel'],
	    controller: 'DatepickerController',
	    link: function(scope, element, attrs, ctrls) {
	      var datepickerCtrl = ctrls[0], ngModelCtrl = ctrls[1];

	      if ( ngModelCtrl ) {
	        datepickerCtrl.init( ngModelCtrl );
	      }
	    }
	  };
	});

}());