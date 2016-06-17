var app = angular.module('porsche');

app.controller('ChangePasswordController', function ($uibModalInstance, $scope, wsUser, toaster, data) {

  var validateUpperCase = function (text) {
    return /[A-Z]/.test(text);
  }

  var validateLowerCase = function (text) {
    return /[a-z]/.test(text);
  }

  //
  $scope.changePassword = function() {
    var userService = new wsUser();
    userService.validateOldPassword($scope.passworda)
    .then(function (result) {
      console.log(result);
      if ($scope.password == $scope.password2) {
        var params = {
          username: data.user,
          password: $scope.password
        }

        userService.changePassword(params)
        .then(function(obj) {
          toaster.pop('success', 'Información', "La contraseña ha sido actualizada.");
          $uibModalInstance.close('ok');
        })
        .catch(function(err) {
          $uibModalInstance.close({});
        })
      }
      else
        toaster.pop('error', 'Información', 'Las contraseñas no coinciden.');
    })
    .catch(function (result) {
      toaster.pop('error', 'Información', 'Contraseña incorrecta');
    })
  }

  //
  $scope.cancel = function () {
    $uibModalInstance.dismiss({});
  };

  //
  $scope.save = function () {
    $scope.changePassword();
  };
});
