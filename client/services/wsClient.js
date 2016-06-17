'use strict';

var app = angular.module('newlink');

app.factory('wsClient', function (Base, $q,$state) {

  // Implementation of Object.prototype.hasOwnProperty
  var hasPropertie = Object.prototype.hasOwnProperty;

  // Class Name
  var Client;

  function Client(propValues) {
    Client.super.constructor.apply(this, arguments);
    this.APIEndpoint = "/api/client";
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
  extend(Client, Base);

  //Redireccion a pantalla client
  Client.prototype.go = function(clientId) {
     $state.go('client', { id : clientId })
  };

  // Funcion que retorna las propiedades de una cuenta
  Client.properties = function () {
    var at = {};
    return at;
  };

  return Client;

});
