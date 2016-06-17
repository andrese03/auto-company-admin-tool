var app = angular.module('porsche');

app.controller('OptionsController', function(wsOption, $timeout, $scope, lists) {


  $scope.option = wsOption;

  $scope.fields = [{
    title: 'Id',
    name: '_id',
    type: 'text',
    disabled: true
  },{
    title: 'Nombre',
    name: 'name',
    required: true,
    type: 'text',
  }, {
    title: 'Descripción',
    name: 'description',
    required: true,
    type: 'text'
  }, {
    title: 'Tipo',
    name: 'type',
    required: true,
    type: 'select',
    options: lists.optionTypes,
    config: {
      label: 'description',
      value: 'Object'
    }
  }, {
    title: 'Ícono',
    name: 'icon',
    required: false,
    type: 'text'
  }];

  $scope.options = {
    fetchAllFields: true,
    onDoubleClick: function(element) {
      element.go();
    }
  }

});
