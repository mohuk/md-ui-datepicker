(function(){

	angular.module('ui.bootstrap.datepicker')
		.constant('datepickerPopupConfig', {
		  datepickerPopup: 'yyyy-MM-dd',
		  html5Types: {
		    date: 'yyyy-MM-dd',
		    'datetime-local': 'yyyy-MM-ddTHH:mm:ss.sss',
		    'month': 'yyyy-MM'
		  },
		  currentText: 'Today',
		  clearText: 'Clear',
		  closeText: 'Done',
		  closeOnDateSelection: true,
		  appendToBody: false,
		  showButtonBar: true
		});

}());