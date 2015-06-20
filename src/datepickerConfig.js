(function(){

	angular.module('ui.bootstrap.datepicker')
		.constant('datepickerConfig', {
		  formatDay: 'dd',
		  formatMonth: 'MMMM',
		  formatYear: 'yyyy',
		  formatDayHeader: 'EEE',
		  formatDayTitle: 'MMMM yyyy',
		  formatMonthTitle: 'yyyy',
		  datepickerMode: 'day',
		  minMode: 'day',
		  maxMode: 'year',
		  showWeeks: true,
		  startingDay: 0,
		  yearRange: 20,
		  minDate: null,
		  maxDate: null,
		  shortcutPropagation: false
		});
		
}());