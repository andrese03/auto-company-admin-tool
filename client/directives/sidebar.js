/**
 * Sidebar directive
 * Andrés Encarnación 06/06/2016
 */

var app = angular.module('porsche');

app.directive('sideBar', function ($state) {
  return {
    restrict: 'EA',
    templateUrl: 'views/sidebar.html',
    replace: true,
    controller: function ($scope) {

      $scope.uiSelect = {route: null};

      $scope.logout = function () {
        $scope.$broadcast('user-logout', null);
      }

      $scope.go = function (item) {
        $state.go(item.name);
        $scope.uiSelect.route = null;
      }

    }
  }
})
