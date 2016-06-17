var app = angular.module('newlink');

app.controller('agregarUserController', function ($scope, $uibModalInstance, wsUser, toaster, data) {

  var userService = new wsUser();

  $scope.user = {
    username: "",
    email: "",
    role: {},
    profile: {
      firstName: "",
      lastName: ""
    },
    active: true
  };
  $scope.user.role = data;
  $scope.selected = $scope.user.role[2];


  //
  $scope.delete = function (user) {
      userService.delete(user)
      .then(function (result) {
         toaster.pop("success", "Información", "Usuario eliminado con éxito");
         $uibModalInstance.close({});
      })
      .catch(function (result) {
        toaster.pop("error", "Información", "Ha ocurrido un error.");
        $uibModalInstance.dismiss({});
      });
  }

  //
  $scope.register = function (user) {
    $scope.user.role = $scope.selected;
    userService.register(user)
    .then(function (result) {
       toaster.pop("success", "Información", "Usuario registrado con éxito");
       $uibModalInstance.close(result);
    })
    .catch(function (result) {
       toaster.pop("error", "Información", "Ha ocurrido un error.");
       $uibModalInstance.dismiss({});
    });
  }
  
});