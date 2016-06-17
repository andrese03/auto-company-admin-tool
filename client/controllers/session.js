var app = angular.module('porsche');

app.controller('SessionController', function($scope, $state, wsUser, $location, toaster) {

  // Private Variables
  var NAVIGATION_OPTION = 1;
  var PERMISSION_OPTION = 2;
  var I_CAME_FROM_LOGIN = false;
  var UNAUTHORIZED_ROUTES = [{
    "_id": 0,
    "name": "login",
    "ownerId": 1,
    "description": "Login",
    "type": {
      "_id": 1,
      "description": "Navigation"
    },
    "icon": "sign-in"
  }];

  // Private Functions
  var storeUserCredentials = function(key, value) {
    if (value)
      window.localStorage.setItem(key, JSON.stringify(value));
  }

  var loadUserCredentials = function() {
    var _user = window.localStorage.user;

    // No hay usuario
    if (!_user) {
      $scope.$broadcast('user-logout', null);
      return;
    }

    vm.user = new wsUser(JSON.parse(_user));
    new wsUser().findById(vm.user._id)
      .then(function(result) {
        vm.user = result;
        storeUserCredentials('user', vm.user);
        loadDependenciesByRole();
        setRoutes();
      });
  }

  var loadUserClients = function() {
    var _clients = window.localStorage.clients;
    var _client = window.localStorage.client;

    vm.clients = (_clients) ? JSON.parse(_clients) : [];

    vm.client = (_client) ? JSON.parse(_client) : null;

    vm.user.getClients()
      .then(function(result) {

        // Clientes con ese Usuario
        vm.clients = result.data;

        // Cliente seleccionado
        vm.client = vm.client || vm.clients[0] || null;

        // Se le actualizan sus datos
        vm.client = Lazy(vm.clients).findWhere({
          _id: vm.client._id
        }) || vm.client;

        storeUserCredentials('clients', vm.clients)
        storeUserCredentials('client', vm.client)

      })
  }

  var loadDependenciesByRole = function() {
    var user = vm.user;

    switch (user.role._id) {
      // Administrator
      case 1:
        break;
      // Supervisor
      case 2:
        break;
      // Monitor
      case 3:
        break;
      // Ejecutivo
      case 4:
        loadUserClients();
        break;
      // Cliente
      case 5:
        loadUserClients();
        break;
      default:
        console.log('Esto no debió de llamarse');
    }
  }

  var setRoutes = function() {
    vm.routes = Lazy(vm.user.role.options).filter(function(option) {
      return option.type._id == NAVIGATION_OPTION;
    }).toArray();
    console.log(vm.routes)
  }

  // Public Variables
  var vm = this;

  vm.appName = 'Newlink';

  vm.appVersion = '0.0.1';

  vm.user = null;

  vm.clients = [];

  vm.client = null;

  vm.routes = [];

  vm.isAuthenticated = function() {
    //
    return window.localStorage.token && window.localStorage.user;
  };

  // Public Functions
  vm.isAuthorized = function(actionName) {
    var _this = this;
    if (!this.isAuthenticated())
      return false;
    var options = _this.user.role.options;
    var isAuthorized = Lazy(options).findWhere({
      name: actionName
    });
    return !!isAuthorized;
  };

  // Public Listeners
  $scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams, options) {

    // console.log('toState', toState.name)
    // Cuando no está autenticado y se accede a cualquier ruta menos las no autorizadas
    if (!vm.isAuthenticated()) {

      // En caso de que se esté en una ruta de UNAUTHORIZED_ROUTES
      // no se hace nada (esto segurito cambia más adelante)
      if (Lazy(UNAUTHORIZED_ROUTES).findWhere({name: fromState.name})) {
        event.preventDefault();
      }
      else {
        $location.path('login');
      }
    }
    // Si se está autenticado solo se valida que el rol del usuario pueda acceder
    // a donde quiere ir o la acción que quiera ejecutar
    else if (!vm.isAuthorized(toState.name)) {
      toaster.pop('warning', 'Información', 'No puedes realizar esta acción');
      event.preventDefault();
    };

  });

  // Disparador al cambiar de pagina
  $scope.$on('user-login', function(event, user) {
    I_CAME_FROM_LOGIN = true;
    vm.user = new wsUser(user);
    storeUserCredentials('user', user);
    storeUserCredentials('token', user.token);
    setRoutes();
    loadDependenciesByRole();
    $state.go(vm.routes[0].name);
  });

  // Disparador al cambiar de pagina
  $scope.$on('user-logout', function(event, user) {
    delete window.localStorage.user;
    delete window.localStorage.token;
    delete window.localStorage.clients;
    delete window.localStorage.client;
    $location.path('/login');
  });

  // Main Controller
  loadUserCredentials();

});
