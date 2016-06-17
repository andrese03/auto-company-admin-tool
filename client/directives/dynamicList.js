/**
 * Dynamic List
 * Andrés Encarnación - 13/06/2016
 */

var app = angular.module('newlink');

app.directive('dynamicList', function() {
  return {
    templateUrl: 'views/dynamicList.html',
    restrict: 'E',
    scope: {
      service: '=',
      fields: '=',
      options: '=?'
      // options: {
      //   onDoubleClick: '=onDoubleClick',
      //   searchOn: '=searchOn',
      //   filterBy: '=',
      //   sortBy: '='
      //   credentials: '=',
      //   advanced: '=',
      // }
    },
    controller: function($scope, $timeout, dialogs, toaster) {

      if (!$scope.service)
        throw new Error("A service is required");

      var Class = $scope.service;

      // Opciones
      $scope.options = $scope.options || {};

      // Lista de los elementos de la tabla
      $scope.elements = [];

      // Elemento que esta siendo editado o que sera insertado
      $scope.element = {};

      // Objeto de la service que se utiliza para hacer las funciones básicas, como search, count, paginatedSearch, etc.
      $scope.classService = new Class();

      // Elemento en Edicion o Cambios
      $scope.currentElement = {};

      // Cantidad de registros de la tabla
      $scope.quantity = 0;

      // Pagina actual
      $scope.currentPage = 1;

      // Cantidad de paginas disponibles
      $scope.lastPage = 0;

      // Metodo para Ordenar
      $scope.sortBy = $scope.options.sortBy || {
        _id: 1
      };

      // Arreglo que se utiliza para restaurar el arreglo original cuando se cancela una edicion.
      var elements = [];

      // Parametros que se le pasaran al paginatedSearch
      $scope.params = {
        selector: null,
        fields: ['_id', 'createdBy'],
        search: '',
        limit: 10,
        skip: 0,
        sort: $scope.sortBy,
        credentials: true,
      };

      // Variable para saber si se hizo la primera busqueda
      $scope.ready = false;

      var parseValue = function(value) {
        var result = value;
        if (typeof value == 'object' && !(value instanceof Date)) {
          result = [];
          for (var i in value) {
            result.push(value[i]);
          }
          result = result.join(',');
        }
        return result;
      };

      var setCeilsLimit = function() {
        // Acortar el nombre que se muestra
        var table = document.getElementById('dynamic-list');
        if (!table)
          return;
        var cells = table.rows[0].cells;
        for (var i in cells) {
          if (cells[i].clientWidth) {
            $scope.fields[i].limit = Math.ceil((cells[i].clientWidth) / 4);
          }
        };
      };

      // Toma un classService y una ruta. Devuelve el valor encontrado en esa ruta.
      $scope.inception = function(obj, path) {
        obj = obj || {};
        var result = path.split('.').reduce(function(prev, actual) {
          return prev[actual] || {};
        }, obj);
        return (typeof result == 'object')
        ? ''
        : result
      };

      // Busca el valor correspondiende a partir de un conjunto de opciones
      $scope.getCeilValueInOptions = function(value, options) {
        for (var i in options) {
          if (options[i].value == value)
            return options[i].label;
        }
        return 'No disponible';
      };

      // Ir a la pagina anterior
      $scope.prevPage = function() {
        if ($scope.currentPage > 1) {
          $scope.currentPage--;
          $scope.params.skip = (($scope.currentPage - 1) * $scope.params.limit);
          $scope.$broadcast('refresh-list', $scope.params);
        }
      };
      // Ir a la pagina siguiente
      $scope.nextPage = function() {
        if ($scope.currentPage < $scope.lastPage) {
          $scope.currentPage++;
          $scope.params.skip += $scope.elements.length;
          $scope.$broadcast('refresh-list', $scope.params);
        }
      };
      // Activar o desactivar el boton de ir atras
      $scope.prevPageDisabled = function() {
        return $scope.currentPage === 1 ? "disabled" : "";
      };
      // Activar o desactivar el boton de ir adelante
      $scope.nextPageDisabled = function() {
        return $scope.currentPage === $scope.lastPage ? "disabled" : "";
      };
      // Funcion para buscar un elemento especifico
      $scope.search = function() {
        $scope.$broadcast('refresh-list', $scope.params);
      };

      // TODO: Check
      // Funcion para filtrar de forma ascendente o descendente por los campos mostrados en pantalla.
      $scope.filter = function(field) {
        $scope.orderBy.sort = {};
        if ($scope.orderBy.field === field) {
          $scope.orderBy.reverse ==! $scope.orderBy.reverse;
          $scope.orderBy.sort[field] = $scope.orderBy.reverse ? -1 : 1;
        }
        else {
          $scope.orderBy.field = field;
          $scope.orderBy.sort[field] = 1;
          $scope.orderBy.reverse = false;
        }
        $scope.params.sort = $scope.orderBy.sort;
        $scope.$broadcast('refresh-list', $scope.params);
      };

      // TODO: Check
      $scope.matching = function(value) {
        return (value === parseInt(value));
      };

      // On Double Click Handler
      // Ejecuta una funcion asociada al elemento clickeado (que se le pasa por parametros)
      $scope.onDoubleClick = function(element, event) {
        if ((event.pointerType == 'touch' && event.type == 'tap') || event.type == 'dblclick') {
          if ($scope.options.onDoubleClick) {
            $scope.options.onDoubleClick(element);
          }
          else {
            element.go(element._id);
          }
        }
      };

      // TODO: Check
      $scope.setOrderClass = function(field) {

        if ($scope.orderBy.field === field.name) {
          if ($scope.orderBy.reverse) {
            return {
              'fa fa-caret-down': true
            };
          } else {
            return {
              'fa fa-caret-up': true
            };
          }
        } else {
          return {
            '': true
          };
        }
      };

      // Trae todos los fields
      if ($scope.options.fetchAllFields)
        $scope.params.fields.push('*');

      // Include or not Credentials
      if ($scope.options.credentials != undefined)
        $scope.params.credentials = $scope.options.credentials;

      // Main
      angular.forEach($scope.fields, function(field, key) {
        $scope.params.fields.push(field.name);
      });

      // Disparador al cambiar de pagina
      $scope.$on('refresh-list', function(event, params) {
        // Fetch the Elements
        $scope.classService.find(params)
        .then(function(result) {
          $scope.elements = angular.copy(result.data);
          elements = angular.copy(result.data);
          $scope.ready = true;
          $timeout(function() {
            setCeilsLimit();
          });
        })
        .catch(function(error) {
          toaster.pop('error', 'Informacion', 'No se pudo cargar los registros!');
        });

        // Count the Elements
        $scope.classService.count(params)
          .then(function(result) {
            $scope.lastPage = (result.count < $scope.params.limit) ? 1 : Math.ceil(result.count / $scope.params.limit);
          })
          .catch(function(error) {
            // Nothing to do for now..
          });
      });

      // Buscar los tipos de cuentas
      $scope.$broadcast('refresh-list', $scope.params);
    }
  };
});
