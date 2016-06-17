var app = angular.module('porsche');

app.controller('LoginController', function(wsUser, $timeout, $scope, $rootScope, toaster, dialogs) {

  var userService = new wsUser();

  $scope.field = {
    user : "",
    pass : ""
  };

  $scope.login = function (field) {
    userService.login(field.user, field.pass)
    .then(function (result) {
      if(field.user === field.pass)
      {
        var promise = dialogs.create('../views/changePassword.html','ChangePasswordController', $scope.field);
        promise.result.then(function () {
          $rootScope.$broadcast('user-login', result.data);
        }).catch(function () {
          console.log("Canceled");
        });
      }
      else
        $rootScope.$broadcast('user-login', result.data);
    })
    .catch(function (result) {
       toaster.pop("warning", "Información", "Usuario o contraseña incorrectos.");
    });
  }

});
