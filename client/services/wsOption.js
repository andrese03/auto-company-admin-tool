'use strict';

var app = angular.module('newlink');

app.factory('wsOption', function (Base, $q) {

  // Implementation of Object.prototype.hasOwnProperty
  var hasPropertie = Object.prototype.hasOwnProperty;

  // Class Name
  var Option;

  function Option(propValues) {
    Option.super.constructor.apply(this, arguments);
    this.APIEndpoint = "/api/option";
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
  extend(Option, Base);

  // Funcion que retorna las propiedades de una cuenta
  Option.properties = function () {
    var at = {};
    return at;
  };

  return Option;

});
