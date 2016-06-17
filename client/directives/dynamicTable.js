/**
 * Crud Table
 * Directiva que crea un mantenimiento en una tabla conectado a un WebService
 */


app.directive('dynamicTable', function() {
  return {
    templateUrl: 'views/dynamicTable.html',
    restrict: 'E',
    scope: {
      service: '=',
      fields: '=',
      options: '=?'
    },
    controller: function($scope, $http, dialogs, toaster) {

      if (!$scope.service)
        throw new Error("A service is required");

      var Class = $scope.service;

      // Opciones
      $scope.options = $scope.options || {};

      // Lista de los elementos de la tabla
      $scope.elements = [];

      // Elemento que esta siendo editado o que sera insertado
      $scope.element = {};

      // Objeto de la service que se utiliza para hacer las funciones basicas, como search, count, paginatedSearch, etc.
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

      // Agregar un elemento al arreglo para luego guardarlo
      $scope.setElement = function() {
        if (!$scope.currentElement.editing) {
          $scope.object = $scope.classService;
          $scope.currentElement = $scope.object;
          $scope.currentElement.editing = true;
        }
      };

      // Funcion para crear un nuevo elemento.
      $scope.createElement = function() {
        delete $scope.classService.editing;

        $scope.classService.save()
          .then(function(object) {
            toaster.pop('success', 'Informacion', 'Agregado satisfactoriamente');
            $scope.currentElement = {};
            $scope.elements.push(angular.copy($scope.classService));
            elements = angular.copy($scope.elements);
            $scope.classService = new Class();
            $scope.dynamicTableForm.$setPristine();
          })
          .catch(function(error) {
            toaster.pop('error', 'Informacion', error.message);
            $scope.classService.editing = true;
          });
      };

      // Funcion para actualizar un elemento
      $scope.updateElement = function() {
        if ($scope.currentElement.editing) {
          delete $scope.currentElement.editing;
          $scope.currentElement.save()
          .then(function(data) {
            toaster.pop('success', 'Informacion', 'Modificado satisfactoriamente!');
            elements = angular.copy($scope.elements);
            $scope.currentElement = {};
            $scope.dynamicTableForm.$setPristine();
          })
          .catch(function(error) {
            toaster.pop('error', 'Informacion', error.message);
            $scope.elements = angular.copy(elements);
            $scope.currentElement = {};
            throw new Error(error)
          });
        }
      };

      // Funcion para eliminar un elemento
      $scope.deleteElement = function(elem) {
        if (!$scope.currentElement.editing) {
          var confirm = dialogs.confirm('Eliminar Tipo de Cuenta', '¿Seguro que desea eliminar este elemento?');
          confirm.result
          .then(function(btn) {
            return elem.delete();
          })
          .then(function(data) {
            toaster.pop('success', 'Informacion', 'Eliminado satisfactoriamente!');
            $scope.$broadcast('refresh-table', $scope.params);
            elements = angular.copy($scope.elements)
          })
          .catch(function(error) {
            toaster.pop('error', 'Informacion', error);
          });
        }
      };

      // Funcion que habilita los campos para editar el elemento que se quiere actualizar.
      $scope.setChanges = function(element) {
        if ($scope.currentElement.editing && ($scope.currentElement._id != element._id) && !angular.equals($scope.currentElement, $scope.currentElementBk)) {

          var confirm = dialogs.confirm('Guardar', '¿Desea guardar sus cambios?');
          confirm.result
          .then(function(btn) {
            $scope.updateElement();
          })
          .catch(function(a) {
            $scope.discardChanges($scope.currentElement)
          });

        }
        else if ($scope.currentElement._id != element._id) {
          delete $scope.currentElement.editing;
          $scope.currentElementBk = angular.copy(element);
          $scope.currentElement = element;
          $scope.currentElement.editing = true;
        }
      };

      // Funcion que habilita los campos para editar el elemento que se quiere actualizar.
      $scope.discardChanges = function(element) {
        delete element.editing;
        delete $scope.currentElement;
        $scope.currentElement = {};
        $scope.elements = angular.copy(elements);
        $scope.classService = new Class();
        $scope.dynamicTableForm.$setPristine();
      };

      // Funcion que crea o actualiza un tipo de cuenta
      $scope.save = function() {

        if ($scope.dynamicTableForm.$invalid) {
          $scope.dynamicTableForm.$setDirty();
        }
        else if ($scope.currentElement._id) {
          $scope.updateElement();
        }
        else {
          $scope.createElement();
        }
      };

      // Funcion para buscar un elemento especifico
      $scope.search = function() {
        $scope.classService.count($scope.params)
          .then(function(res) {
            res = res.count;
            $scope.currentPage = 1;
            $scope.lastPage = res < $scope.params.limit ? 1 : Math.ceil(res / $scope.params.limit);
          })
        $scope.params.skip = 0;
        $scope.$broadcast('refresh-table', $scope.params);
      };

      // Funcion para filtrar de forma ascendente o descendente por los campos mostrados en pantalla.
      $scope.filter = function(field) {
        $scope.sortBy.sort = {};
        if ($scope.sortBy.field === field) {
          $scope.sortBy.reverse = !$scope.sortBy.reverse;
          $scope.sortBy.sort[field] = $scope.sortBy.reverse ? -1 : 1;
        } else {
          $scope.sortBy.field = field;
          $scope.sortBy.sort[field] = 1;
          $scope.sortBy.reverse = false;
        }
        $scope.params.sort = $scope.sortBy.sort;
        $scope.$broadcast('refresh-table', $scope.params);
      };

      // Toma un classService y una ruta. Devuelve el valor encontrado en esa ruta.
      $scope.inception = function(obj, path) {
        obj = obj || {};
        return path.split('.').reduce(function(prev, actual) {
          return prev[actual] || {};
        }, obj);
      };

      //
      $scope.getFieldLabel = function(value, options) {
        var option = _.findWhere(options, {
          value: value
        });
        return (option) ? option.label : 'No disponible';
      };

      // Funcion que carga un modal con el view y el controller pasados por un field dado
      $scope.openModal = function(config, elem) {
        $scope.currentElement = {};
        delete elem.editing;
        config.data.object = elem;
        var index = _.findIndex($scope.elements, {
          _id: elem._id
        });
        var dialog = dialogs.create(config.view, config.controller, config.data);

        dialog.result.then(
          function(result) {
            elem = result.object;
            $scope.elements[index] = result.object;
            elements = angular.copy($scope.elements);
          },
          function(result) {
            // No seleccionaste nada
          });
      };

      // Ir a la pagina anterior
      $scope.prevPage = function() {
        if ($scope.currentPage > 1) {
          $scope.currentPage--;
          $scope.params.skip = (($scope.currentPage - 1) * $scope.params.limit);
          $scope.$broadcast('refresh-table', $scope.params);
        }
      };

      // Ir a la pagina siguiente
      $scope.nextPage = function() {
        if ($scope.currentPage < $scope.lastPage) {
          $scope.currentPage++;
          $scope.params.skip += $scope.elements.length;
          $scope.$broadcast('refresh-table', $scope.params);
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
      $scope.$on('refresh-table', function(event, params) {
        // Fetch the Elements
        $scope.classService.find(params)
        .then(function(result) {
          $scope.elements = angular.copy(result.data);
          elements = angular.copy(result.data);
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
      $scope.$broadcast('refresh-table', $scope.params);
    }
  };
});
