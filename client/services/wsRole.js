'use strict';

var app = angular.module('porsche');

app.factory('wsRole', function (Base, $q) {

  // Implementation of Object.prototype.hasOwnProperty
  var hasPropertie = Object.prototype.hasOwnProperty;

  // Class Name
  var Role;

  function Role(propValues) {
    Role.super.constructor.apply(this, arguments);
    this.APIEndpoint = "/api/role";
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
  extend(Role, Base);

  // Funcion que retorna las propiedades de una cuenta
  Role.properties = function () {
    var at = {};
    return at;
  };

  return Role;

});
