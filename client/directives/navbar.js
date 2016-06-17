/**
 * Navbar directive
 * Andrés Encarnación 06/06/2016
 */

var app = angular.module('newlink');

app.directive('navBar', function () {
  return {
    restrict: 'EA',
    templateUrl: 'views/navBar.html',
    replace: true
  }
})
