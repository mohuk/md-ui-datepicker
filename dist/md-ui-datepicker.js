(function(){
	
	angular.module("ui.bootstrap", [
		"ui.bootstrap.datepicker.templates",
		"ui.bootstrap.datepicker",
		"ui.bootstrap.dateparser",
		"ui.bootstrap.position"
	]);

}());
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
(function(){

	angular.module('ui.bootstrap.dateparser', [])

	.service('dateParser', ['$locale', 'orderByFilter', function($locale, orderByFilter) {
	  // Pulled from https://github.com/mbostock/d3/blob/master/src/format/requote.js
	  var SPECIAL_CHARACTERS_REGEXP = /[\\\^\$\*\+\?\|\[\]\(\)\.\{\}]/g;

	  this.parsers = {};

	  var formatCodeToRegex = {
	    'yyyy': {
	      regex: '\\d{4}',
	      apply: function(value) { this.year = +value; }
	    },
	    'yy': {
	      regex: '\\d{2}',
	      apply: function(value) { this.year = +value + 2000; }
	    },
	    'y': {
	      regex: '\\d{1,4}',
	      apply: function(value) { this.year = +value; }
	    },
	    'MMMM': {
	      regex: $locale.DATETIME_FORMATS.MONTH.join('|'),
	      apply: function(value) { this.month = $locale.DATETIME_FORMATS.MONTH.indexOf(value); }
	    },
	    'MMM': {
	      regex: $locale.DATETIME_FORMATS.SHORTMONTH.join('|'),
	      apply: function(value) { this.month = $locale.DATETIME_FORMATS.SHORTMONTH.indexOf(value); }
	    },
	    'MM': {
	      regex: '0[1-9]|1[0-2]',
	      apply: function(value) { this.month = value - 1; }
	    },
	    'M': {
	      regex: '[1-9]|1[0-2]',
	      apply: function(value) { this.month = value - 1; }
	    },
	    'dd': {
	      regex: '[0-2][0-9]{1}|3[0-1]{1}',
	      apply: function(value) { this.date = +value; }
	    },
	    'd': {
	      regex: '[1-2]?[0-9]{1}|3[0-1]{1}',
	      apply: function(value) { this.date = +value; }
	    },
	    'EEEE': {
	      regex: $locale.DATETIME_FORMATS.DAY.join('|')
	    },
	    'EEE': {
	      regex: $locale.DATETIME_FORMATS.SHORTDAY.join('|')
	    },
	    'HH': {
	      regex: '(?:0|1)[0-9]|2[0-3]',
	      apply: function(value) { this.hours = +value; }
	    },
	    'H': {
	      regex: '1?[0-9]|2[0-3]',
	      apply: function(value) { this.hours = +value; }
	    },
	    'mm': {
	      regex: '[0-5][0-9]',
	      apply: function(value) { this.minutes = +value; }
	    },
	    'm': {
	      regex: '[0-9]|[1-5][0-9]',
	      apply: function(value) { this.minutes = +value; }
	    },
	    'sss': {
	      regex: '[0-9][0-9][0-9]',
	      apply: function(value) { this.milliseconds = +value; }
	    },
	    'ss': {
	      regex: '[0-5][0-9]',
	      apply: function(value) { this.seconds = +value; }
	    },
	    's': {
	      regex: '[0-9]|[1-5][0-9]',
	      apply: function(value) { this.seconds = +value; }
	    }
	  };

	  function createParser(format) {
	    var map = [], regex = format.split('');

	    angular.forEach(formatCodeToRegex, function(data, code) {
	      var index = format.indexOf(code);

	      if (index > -1) {
	        format = format.split('');

	        regex[index] = '(' + data.regex + ')';
	        format[index] = '$'; // Custom symbol to define consumed part of format
	        for (var i = index + 1, n = index + code.length; i < n; i++) {
	          regex[i] = '';
	          format[i] = '$';
	        }
	        format = format.join('');

	        map.push({ index: index, apply: data.apply });
	      }
	    });

	    return {
	      regex: new RegExp('^' + regex.join('') + '$'),
	      map: orderByFilter(map, 'index')
	    };
	  }

	  this.parse = function(input, format, baseDate) {
	    if ( !angular.isString(input) || !format ) {
	      return input;
	    }

	    format = $locale.DATETIME_FORMATS[format] || format;
	    format = format.replace(SPECIAL_CHARACTERS_REGEXP, '\\$&');

	    if ( !this.parsers[format] ) {
	      this.parsers[format] = createParser(format);
	    }

	    var parser = this.parsers[format],
	        regex = parser.regex,
	        map = parser.map,
	        results = input.match(regex);

	    if ( results && results.length ) {
	      var fields, dt;
	      if (baseDate) {
	        fields = {
	          year: baseDate.getFullYear(),
	          month: baseDate.getMonth(),
	          date: baseDate.getDate(),
	          hours: baseDate.getHours(),
	          minutes: baseDate.getMinutes(),
	          seconds: baseDate.getSeconds(),
	          milliseconds: baseDate.getMilliseconds()
	        };
	      } else {
	        fields = { year: 1900, month: 0, date: 1, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 };
	      }

	      for( var i = 1, n = results.length; i < n; i++ ) {
	        var mapper = map[i-1];
	        if ( mapper.apply ) {
	          mapper.apply.call(fields, results[i]);
	        }
	      }

	      if ( isValid(fields.year, fields.month, fields.date) ) {
	        dt = new Date(fields.year, fields.month, fields.date, fields.hours, fields.minutes, fields.seconds,
	          fields.milliseconds || 0);
	      }

	      return dt;
	    }
	  };

	  // Check if date is valid for specific month (and year for February).
	  // Month: 0 = Jan, 1 = Feb, etc
	  function isValid(year, month, date) {
	    if (date < 1) {
	      return false;
	    }

	    if ( month === 1 && date > 28) {
	        return date === 29 && ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0);
	    }

	    if ( month === 3 || month === 5 || month === 8 || month === 10) {
	        return date < 31;
	    }

	    return true;
	  }
	}]);


}());
(function(){

  angular.module('ui.bootstrap.position', [])

/**
 * A set of utility methods that can be use to retrieve position of DOM elements.
 * It is meant to be used where we need to absolute-position DOM elements in
 * relation to other, existing elements (this is the case for tooltips, popovers,
 * typeahead suggestions etc.).
 */
  .factory('$position', ['$document', '$window', function ($document, $window) {

    function getStyle(el, cssprop) {
      if (el.currentStyle) { //IE
        return el.currentStyle[cssprop];
      } else if ($window.getComputedStyle) {
        return $window.getComputedStyle(el)[cssprop];
      }
      // finally try and get inline style
      return el.style[cssprop];
    }

    /**
     * Checks if a given element is statically positioned
     * @param element - raw DOM element
     */
    function isStaticPositioned(element) {
      return (getStyle(element, 'position') || 'static' ) === 'static';
    }

    /**
     * returns the closest, non-statically positioned parentOffset of a given element
     * @param element
     */
    var parentOffsetEl = function (element) {
      var docDomEl = $document[0];
      var offsetParent = element.offsetParent || docDomEl;
      while (offsetParent && offsetParent !== docDomEl && isStaticPositioned(offsetParent) ) {
        offsetParent = offsetParent.offsetParent;
      }
      return offsetParent || docDomEl;
    };

    return {
      /**
       * Provides read-only equivalent of jQuery's position function:
       * http://api.jquery.com/position/
       */
      position: function (element) {
        var elBCR = this.offset(element);
        var offsetParentBCR = { top: 0, left: 0 };
        var offsetParentEl = parentOffsetEl(element[0]);
        if (offsetParentEl != $document[0]) {
          offsetParentBCR = this.offset(angular.element(offsetParentEl));
          offsetParentBCR.top += offsetParentEl.clientTop - offsetParentEl.scrollTop;
          offsetParentBCR.left += offsetParentEl.clientLeft - offsetParentEl.scrollLeft;
        }

        var boundingClientRect = element[0].getBoundingClientRect();
        return {
          width: boundingClientRect.width || element.prop('offsetWidth'),
          height: boundingClientRect.height || element.prop('offsetHeight'),
          top: elBCR.top - offsetParentBCR.top,
          left: elBCR.left - offsetParentBCR.left
        };
      },

      /**
       * Provides read-only equivalent of jQuery's offset function:
       * http://api.jquery.com/offset/
       */
      offset: function (element) {
        var boundingClientRect = element[0].getBoundingClientRect();
        return {
          width: boundingClientRect.width || element.prop('offsetWidth'),
          height: boundingClientRect.height || element.prop('offsetHeight'),
          top: boundingClientRect.top + ($window.pageYOffset || $document[0].documentElement.scrollTop),
          left: boundingClientRect.left + ($window.pageXOffset || $document[0].documentElement.scrollLeft)
        };
      },

      /**
       * Provides coordinates for the targetEl in relation to hostEl
       */
      positionElements: function (hostEl, targetEl, positionStr, appendToBody) {

        var positionStrParts = positionStr.split('-');
        var pos0 = positionStrParts[0], pos1 = positionStrParts[1] || 'center';

        var hostElPos,
          targetElWidth,
          targetElHeight,
          targetElPos;

        hostElPos = appendToBody ? this.offset(hostEl) : this.position(hostEl);

        targetElWidth = targetEl.prop('offsetWidth');
        targetElHeight = targetEl.prop('offsetHeight');

        var shiftWidth = {
          center: function () {
            return hostElPos.left + hostElPos.width / 2 - targetElWidth / 2;
          },
          left: function () {
            return hostElPos.left;
          },
          right: function () {
            return hostElPos.left + hostElPos.width;
          }
        };

        var shiftHeight = {
          center: function () {
            return hostElPos.top + hostElPos.height / 2 - targetElHeight / 2;
          },
          top: function () {
            return hostElPos.top;
          },
          bottom: function () {
            return hostElPos.top + hostElPos.height;
          }
        };

        switch (pos0) {
          case 'right':
            targetElPos = {
              top: shiftHeight[pos1](),
              left: shiftWidth[pos0]()
            };
            break;
          case 'left':
            targetElPos = {
              top: shiftHeight[pos1](),
              left: hostElPos.left - targetElWidth
            };
            break;
          case 'bottom':
            targetElPos = {
              top: shiftHeight[pos0](),
              left: shiftWidth[pos1]()
            };
            break;
          default:
            targetElPos = {
              top: hostElPos.top - targetElHeight,
              left: shiftWidth[pos1]()
            };
            break;
        }

        return targetElPos;
      }
    };
  }]);

}());

angular.module("ui.bootstrap.datepicker.templates", []).run(["$templateCache", function($templateCache) {$templateCache.put("datepicker.html","<div class=\"datepicker\" ng-switch=\"datepickerMode\" role=\"application\" ng-keydown=\"keydown($event)\">\n  <daypicker ng-switch-when=\"day\" tabindex=\"0\"></daypicker>\n  <monthpicker ng-switch-when=\"month\" tabindex=\"0\"></monthpicker>\n  <yearpicker ng-switch-when=\"year\" tabindex=\"0\"></yearpicker>\n\n</div>");
$templateCache.put("day.html","<div role=\"grid\" class=\"time-date\" aria-labelledby=\"{{::uniqueId}}-title\" aria-activedescendant=\"{{activeDateId}}\">\n	<div>\n		<div class=\"titles\">\n            <button type=\"button\" class=\"btn btn-default btn-sm pull-left arrows\" ng-click=\"move(-1)\" tabindex=\"-1\"><i class=\"fa fa-chevron-left\"></i></button>\n            <span class=\"month-year\"><button id=\"{{::uniqueId}}-title\" role=\"heading\" aria-live=\"assertive\" aria-atomic=\"true\" type=\"button\" class=\"btn btn-default btn-sm\" ng-click=\"toggleMode()\" ng-disabled=\"datepickerMode === maxMode\" tabindex=\"-1\" style=\"width:100%;\"><strong>{{title}}</strong></button></span>\n            <button type=\"button\" class=\"btn btn-default btn-sm pull-right arrows\" ng-click=\"move(1)\" tabindex=\"-1\"><i class=\"fa fa-chevron-right\"></i></button>\n		</div>\n		<div class=\"headers\">\n			<div ng-if=\"showWeeks\" class=\"text-center\"></div>\n			<div ng-repeat=\"label in ::labels track by $index\" class=\"text-center\"><small aria-label=\"{{::label.full}}\">{{::label.abbr.slice(0,-2)}}</small></div>\n		</div>\n	</div>\n	<div class=\"days\">\n		<div ng-repeat=\"row in rows track by $index\" class=\"weeks\">\n			<div ng-if=\"showWeeks\" class=\"text-center h6\"><em>{{ weekNumbers[$index] }}</em></div>\n			<div ng-repeat=\"dt in row track by dt.date\" class=\"text-center\" role=\"gridcell\" id=\"{{::dt.uid}}\">\n                <button type=\"button\" style=\"width:100%;\" class=\"btn btn-default btn-sm\" ng-class=\"{\'btn-info\': dt.selected, active: isActive(dt), disabled: isDisabled(dt), \'range-selected\': dt.customClass}\" ng-click=\"select(dt.date)\" ng-disabled=\"dt.disabled\" tabindex=\"-1\"><span ng-class=\"::{\'text-muted\': dt.secondary, \'text-info\': dt.current}\">{{::dt.label}}</span></button>\n			</div>\n		</div>\n	</div>\n</div>");
$templateCache.put("month.html","<table role=\"grid\" cellpadding=\"0\" cellspacing=\"0\" aria-labelledby=\"{{::uniqueId}}-title\" aria-activedescendant=\"{{activeDateId}}\">\n	<thead>\n		<tr class=\"titles\">\n			<th><button type=\"button\" class=\"btn btn-default btn-sm pull-left arrows\" ng-click=\"move(-1)\" tabindex=\"-1\"><i class=\"fa fa-chevron-left\"></i></button></th>\n			<th><button id=\"{{::uniqueId}}-title\" role=\"heading\" aria-live=\"assertive\" aria-atomic=\"true\" type=\"button\" class=\"btn btn-default btn-sm\" ng-click=\"toggleMode()\" ng-disabled=\"datepickerMode === maxMode\" tabindex=\"-1\" style=\"width:100%;\"><strong>{{title}}</strong></button></th>\n			<th><button type=\"button\" class=\"btn btn-default btn-sm pull-right arrows\" ng-click=\"move(1)\" tabindex=\"-1\"><i class=\"fa fa-chevron-right\"></i></button></th>\n		</tr>\n	</thead>\n	<tbody>\n		<tr ng-repeat=\"row in rows track by $index\" class=\"days\">\n			<td ng-repeat=\"dt in row track by dt.date\" class=\"text-center\" role=\"gridcell\" id=\"{{::dt.uid}}\">\n				<button type=\"button\" style=\"width:100%;\" class=\"btn btn-default\" ng-class=\"{\'btn-info\': dt.selected, active: isActive(dt)}\" ng-click=\"select(dt.date)\" ng-disabled=\"dt.disabled\" tabindex=\"-1\"><span ng-class=\"::{\'text-info\': dt.current}\">{{::dt.label.slice(0,3)}}</span></button>\n			</td>\n		</tr>\n	</tbody>\n</table>");
$templateCache.put("popup.html","<ul class=\"dropdown-menu\" ng-style=\"{display: (isOpen && \'block\') || \'none\', top: position.top+\'px\', left: position.left+\'px\'}\" ng-keydown=\"keydown($event)\">\n	<li ng-transclude></li>\n	<li ng-if=\"showButtonBar\" style=\"padding:10px 9px 2px\">\n		<span class=\"btn-group pull-left\">\n			<button type=\"button\" class=\"btn btn-sm btn-info\" ng-click=\"select(\'today\')\">{{ getText(\'current\') }}</button>\n			<button type=\"button\" class=\"btn btn-sm btn-danger\" ng-click=\"select(null)\">{{ getText(\'clear\') }}</button>\n		</span>\n		<button type=\"button\" class=\"btn btn-sm btn-success pull-right\" ng-click=\"close()\">{{ getText(\'close\') }}</button>\n	</li>\n</ul>");
$templateCache.put("year.html","<table role=\"grid\" cellpadding=\"0\" cellspacing=\"0\" aria-labelledby=\"{{::uniqueId}}-title\" aria-activedescendant=\"{{activeDateId}}\">\n	<thead>\n		<tr class=\"titles\">\n			<th><button type=\"button\" class=\"btn btn-default btn-sm pull-left arrows\" ng-click=\"move(-1)\" tabindex=\"-1\"><i class=\"fa fa-chevron-left\"></i></button></th>\n			<th colspan=\"3\"><button id=\"{{::uniqueId}}-title\" role=\"heading\" aria-live=\"assertive\" aria-atomic=\"true\" type=\"button\" class=\"btn btn-default btn-sm\" ng-click=\"toggleMode()\" ng-disabled=\"datepickerMode === maxMode\" tabindex=\"-1\" style=\"width:100%;\"><strong>{{title}}</strong></button></th>\n			<th><button type=\"button\" class=\"btn btn-default btn-sm pull-right arrows\" ng-click=\"move(1)\" tabindex=\"-1\"><i class=\"fa fa-chevron-right\"></i></button></th>\n		</tr>\n	</thead>\n	<tbody class=\"days\">\n		<tr ng-repeat=\"row in rows track by $index\">\n			<td ng-repeat=\"dt in row track by dt.date\" class=\"text-center\" role=\"gridcell\" id=\"{{::dt.uid}}\">\n				<button type=\"button\" style=\"width:100%;\" class=\"btn btn-default\" ng-class=\"{\'btn-info\': dt.selected, active: isActive(dt)}\" ng-click=\"select(dt.date)\" ng-disabled=\"dt.disabled\" tabindex=\"-1\"><span ng-class=\"::{\'text-info\': dt.current}\">{{::dt.label}}</span></button>\n			</td>\n		</tr>\n	</tbody>\n</table>");}]);