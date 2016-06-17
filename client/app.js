var app = angular.module('newlink', [
  'ui.router'
]);

app.config(function ($stateProvider, $urlRouterProvider) {
  
  // // For any unmatched url, redirect to /login
  $urlRouterProvider.otherwise('/users');

  $stateProvider
  .state('users', {
    url: "/users",
    templateUrl: "views/users.html"
  })
});


app.controller('SessionController', function () {
  
  var vm = this;

  vm.appName = 'Newlink';

  vm.appVersion = '0.0.1';

})