(function(){

	'use strict';

	angular.module('app', ['ui.bootstrap'])
		.controller('appCtrl', function(){
			var vm = this;
      var currentYear = new Date().getFullYear();
      vm.minDate = '1-1-' + currentYear;
      vm.maxDate = '12-31-' + currentYear;

      vm.inRange = inRange;
      vm.datepickerOptions = {
        maxMode: 'date'
      };

      ///////////////

      function inRange(date){
        return date > new Date('06-15-2015') ? 'range-selected' : '';
        //check if incoming date is in date range ?
      }
	});

}());
