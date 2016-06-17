'use strict';

var app = angular.module('porsche');

app.factory('wsUser', function (Base, dialogs, $http, $q, $state) {

  // Implementation of Object.prototype.hasOwnProperty
  var hasPropertie = Object.prototype.hasOwnProperty;

  // Class Name
  var User;

  function User(propValues) {
    User.super.constructor.apply(this, arguments);
    this.APIEndpoint = "/api/user";
  }

  // Extends From Base
  var extend = function (child, parent) {
    var key;
    for (key in parent) {
      if (hasPropertie.call(parent, key)) {
        child[key] = parent[key];
      }
    }
    function Constructor() {
      this.constructor = child;
    }
    Constructor.prototype = parent.prototype;
    child.prototype = new Constructor();
    child.super = parent.prototype;
    return child;
  };

  // Extender de la clase Base
  extend(User, Base);

  // Función que retorna las propiedades de una cuenta
  User.properties = function () {
    var at = {};
    return at;
  };

  User.prototype.getFullName = function(user) {
    user = user || this;
    return user.profile.firstName + ' ' + user.profile.lastName;
  };

  // Función que llama el web service login
  User.prototype.login = function(username, password) {
    var deferred = $q.defer();

    $http({
            method  :   'POST',
            url     :   'user/login',
            headers : { 'Content-Type': 'application/json' },
            data    : {  username, password  }
         }).then(function (result) {
              deferred.resolve(result.data);
           })
           .catch(function (result) {
              deferred.reject(result.data);
           });

    return deferred.promise;
  };

  // Función que llama el web service register
  User.prototype.register = function(Obj) {
    var deferred = $q.defer();

    $http({
            method  :   'POST',
            url     :   'api/user/register',
            headers : { 'Content-Type': 'application/json' },
            data    :    Obj
         }).then(function (result) {
              deferred.resolve(result.data);
           })
           .catch(function (result) {
              deferred.reject(result.data);
           });

    return deferred.promise;
  };

  // Función que llama el web service register
  User.prototype.validateOldPassword = function(pass) {
    var deferred = $q.defer();

    $http({
            method  :   'POST',
            url     :   'user/validateOldPassword',
            headers : { 'Content-Type': 'application/json' },
            data    : {  password : pass  }
         }).then(function (result) {
              deferred.resolve(result.data);
           })
           .catch(function (result) {
              deferred.reject(result.data);
           });

    return deferred.promise;
  };

  // Función que llama el web service resetPassword
  User.prototype.resetPassword = function(userId) {
    var deferred = $q.defer();

    var promise = dialogs.confirm('Reinicar contraseña', 'Seguro que desea reiniciar la contraseña?');

    promise.result
    .then(function (result) {
       $http({
            method  :   'POST',
            url     :   'api/user/' + userId + '/resetPassword',
            headers : { 'Content-Type': 'application/json' }
         }).then(function (result) {
              deferred.resolve(result.data);
           })
           .catch(function (result) {
              deferred.reject(result.data);
           });
    })
    .catch(function (result){
       deferred.reject("Canceled");
    });

    return deferred.promise;
  };

   // Función que llama el web service changePassword
  User.prototype.changePassword = function(Obj) {
    var deferred = $q.defer();

    $http({
            method  :   'POST',
            url     :   'user/changePassword',
            headers : { 'Content-Type': 'application/json' },
            data    :    Obj
         }).then(function (result) {
              deferred.resolve(result.data);
           })
           .catch(function (result) {
              deferred.reject(result.data);
           });

    return deferred.promise;
  };

  // Función que llama los clientes asociados a un Usuario
  User.prototype.getClients = function(userId) {
    var deferred = $q.defer();

    userId = userId || this._id;

    $http({
            method  :   'GET',
            url     :   'api/user/' + userId + '/clients',
            headers : { 'Content-Type': 'application/json' }
         }).then(function (result) {
              deferred.resolve(result.data);
           })
           .catch(function (result) {
              deferred.reject(result.data);
           });

    return deferred.promise;
  };

  // Redirecciona a la pantalla user
  User.prototype.go = function(userId) {
     $state.go('user', { id : userId })
  };

  User.prototype.delete = function(params) {
    var _this = this;
    if (params == null) {
      params = {};
    }
    var deferred = $q.defer();

    var url = "" + this.APIEndpoint + '/' + params._id;

    var promise = dialogs.confirm('Eliminar', 'Seguro que desea eliminar este usuario?');

    promise.result
    .then(function (result) {
      $http.delete(url, { query: params })
      .success(function (data, status, headers, config) {
        return deferred.resolve(_this.successCallback(data, status, headers, config));
      }).error(function (data, status, headers, config) {
        return deferred.reject(_this.failureCallback(data, status, headers, config));
      });
    })
    .catch(function (result){
       deferred.reject("Canceled");
    });

    return deferred.promise;
  };

  return User;

});
