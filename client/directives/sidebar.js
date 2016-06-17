/**
 * Sidebar directive
 * Andrés Encarnación 06/06/2016
 */

var app = angular.module('newlink');

app.directive('sideBar', function () {
  return {
    restrict: 'EA',
    templateUrl: 'views/sidebar.html',
    replace: true
  }
})
