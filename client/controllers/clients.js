var app = angular.module('newlink');

app.controller('ClientsController', function ($scope, Base, wsClient, $window, $state) {

  

  $scope.client = wsClient;

  $scope.fields = [{
    title: 'Nombre Cliente',
    name: 'name',
    required: true,
    type: 'text'
  }, {
    title: 'Nombre de Representante',
    name: '',
    required: true,
    type: 'text',
  }, {
    title: 'Correo',
    name: '',
    required: true,
    type: 'text',
  }, {
    title: 'Vigencia Contrato',
    name: 'validity',
    required: true,
    type: 'text',
  }, {
    title: 'Editar',
    name: '',
    required: true,
    type: 'text',
  }];

  $scope.clients = {
    fetchAllFields: true
  }

  $scope.newClient = function () {
    $state.go('client');
  }

});