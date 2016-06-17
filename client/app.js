var app = angular.module('porsche', [
  'ui.router',
  'dialogs.main',
  'ui.bootstrap.tpls',
  'ui.bootstrap',
  'ui.select',
  'toaster',
  'pascalprecht.translate',
]);

app.config(function ($stateProvider, $urlRouterProvider) {

  // // For any unmatched url, redirect to /login
  $urlRouterProvider.otherwise('/options');

  $stateProvider
  .state('options', {
    url: '/options',
    controller: 'OptionsController',
    templateUrl: 'views/options.html',
    resolve: {
      lists: function (wsUtils) {
        return wsUtils.getLists(["optionTypes"]);
      }
    }
  })
  .state('user', {
    url: '/user/:id',
    params: {
      id : '0'
    },
    controller: 'UserController',
    templateUrl: 'views/user.html',
    resolve: {
      user: function (wsUser, $stateParams) {
        if ($stateParams.id != 0)
          return new wsUser().findById($stateParams.id);
        else
          return new wsUser();
      },
      roles: function (wsRole) {
        return new wsRole().find({});
      }
    }
  })
  .state('users', {
    url: '/users',
    controller: 'UsersController',
    templateUrl: 'views/users.html'
  })
  .state('roles', {
    url: '/roles',
    controller: 'roleCtrl',
    templateUrl: 'views/role.html',
    resolve: {
      options: function (wsOption){
        return new wsOption().find({});
      },
      roles: function (wsRole){
        return new wsRole().find({});
      }
    }
  })
  .state('adminDashboard', {
    url: '/adminDashboard',
    controller: 'AdminDashboardCtrl',
    templateUrl: 'views/adminDashboard.html',
  })
  .state('login', {
    url: '/login',
    controller: 'LoginController',
    templateUrl: 'views/login.html'
  });

})

.config(function ($translateProvider) {
  $translateProvider.translations('es', {
    DIALOGS_ERROR: "Error",
    DIALOGS_ERROR_MSG: "Algo inesperado ha ocurrido.",
    DIALOGS_CLOSE: "Cerrar",
    DIALOGS_PLEASE_WAIT: "Por favor espere",
    DIALOGS_PLEASE_WAIT_ELIPS: "Por favor espere...",
    DIALOGS_PLEASE_WAIT_MSG: "Esperando a que la operación termine.",
    DIALOGS_PERCENT_COMPLETE: "% Completo",
    DIALOGS_NOTIFICATION: "Notificación",
    DIALOGS_NOTIFICATION_MSG: "Notificación desconocida.",
    DIALOGS_CONFIRMATION: "Confirmación",
    DIALOGS_CONFIRMATION_MSG: "Confirmación requerida.",
    DIALOGS_OK: "OK",
    DIALOGS_YES: "Si",
    DIALOGS_NO: "No"
  });
  $translateProvider.preferredLanguage('es');
})


app.factory('authInterceptor', function ($q, $window, $location, $rootScope) {
  return {
    request: function (config) {
      if (!(config.url.indexOf('.js') >= 0 || config.url.indexOf('.html') >= 0)) {
        $rootScope.$broadcast('loading:progress');
      }
      config.headers = config.headers || {};
      if (window.localStorage.token && !config.headers.Authorization) {
        config.headers.Authorization = 'Bearer ' + JSON.parse(window.localStorage.token);
        config.headers.ownerId = (window.localStorage.user) ? JSON.parse(window.localStorage.user)._id : '';
      }
      return config;
    },
    response: function (response) {
      if (!(response.config.url.indexOf('.js') >= 0 || response.config.url.indexOf('.html') >= 0)) {
        $rootScope.$broadcast('loading:done');
      }
      return response;
    },
    responseError: function (rejection) {
      if (rejection.status === 401) {
        // if not authorized access
        var regExp = /toBeConfiguredSomeDay/i;
        if (!regExp.test($location.$$path)) {
          $location.path('login');
        }
      }
      return $q.reject(rejection);
    }
  };
});


app.config(function ($httpProvider) {
  $httpProvider.interceptors.push('authInterceptor');
});
