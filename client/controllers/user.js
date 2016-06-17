var app = angular.module('porsche');

app.controller('UserController', function ($scope, wsUser, $state, user, roles, toaster) {

  var userService = new wsUser();

  $scope.user = user;
  $scope.user.role = roles.data;
  $scope.selected = $scope.user.role[0];
  //
  $scope.resetPassword = function (user) {
    userService.resetPassword(user._id)
    .then(function (result) {
       toaster.pop("success", "Información", "Se ha cambiado la contraseña");
    })
    .catch(function (result) {
       console.log(result);
    });
  }

  //
  $scope.delete = function (user) {
      userService.delete(user)
      .then(function (result) {
         toaster.pop("success", "Información", "Usuario eliminado con éxito");
      })
      .catch(function (result) {
         toaster.pop("error", "Información", "Ha ocurrido un error.");
      });
  }

  //
  $scope.register = function (user) {
    $scope.user.role = $scope.selected;
    userService.register(user)
    .then(function (result) {
       toaster.pop("success", "Información", "Usuario registrado con éxito");
       $scope.user.role = roles.data;
    })
    .catch(function (result) {
       toaster.pop("error", "Información", "Ha ocurrido un error.");
       $scope.user.role = roles.data;
    });
  }

  //
  $scope.back = function () {
    $state.go('users');
  }

});
