angular.module('app', [])
	.controller('ctrl', function($scope, dataz) {
		$scope.stuff = dataz;
	})
	.provider('dataz', function() {
		return {
			$get: function() {return ['foo', 'bar', 'baz']}
		}
	})
	.directive('blink', function($interval) {
		return {
			restrict: 'E',
			link: function(scope, element, attrs) {
				$interval(function() {
					element[0].style.display = element[0].style.display == 'none' ? 'inline' : 'none';
				}, 750);
			}
		}
	})
	.filter('up', function() {
		return function(input) {
			return input.toUpperCase();
		};
	})