var app = angular.module('porsche');

app.controller('UsersController', function ($scope, wsUser, $state) {

  $scope.user = wsUser;

  $scope.fields = [{
    title: 'Nombre',
    name: 'profile.firstName',
    required: true,
    type: 'text'
  }, {
    title: 'Apellidos',
    name: 'profile.lastName',
    required: true,
    type: 'text',
  }, {
    title: 'Usuario',
    name: 'username',
    required: true,
    type: 'text',
  }, {
    title: 'Correo',
    name: 'email',
    required: true,
    type: 'text',
  }, {
    title: 'Rol',
    name: 'role.name',
    required: true,
    type: 'text',
  }, {
    title: 'Activo',
    name: 'active',
    required: true,
    type: 'checkbox',
  }];

  $scope.users = {
    fetchAllFields: true
  }

  $scope.back = function () {
    $state.go('user');
  }

});
