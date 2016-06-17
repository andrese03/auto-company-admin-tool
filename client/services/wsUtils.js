'use strict';

var app = angular.module('porsche');

app.factory('wsUtils', function($http, $rootScope, $q, dialogs) {

  var ws = {};
  var storedLists;

  //Collection
  ws.getCollection = function(collection) {
    var deferred = $q.defer();


    var promise = $http({
      method: 'GET',
      url: '/api/util/Collection/' + collection
    })
    promise
      .success(function(data, status, headers, config) {

        deferred.resolve(data.data);
      })
      .error(function(data, status, headers, config) {
        deferred.reject(data);
      });


    return deferred.promise;
  };

  //Get Servicios
  ws.getServices = function() {
    return ws.getCollection('SERVICIO');
  }


  var getLists = function(lists) {
    var deferred = $q.defer();
    if (lists) {
      var _lists = {};
      for (var x in lists) {
        _lists[lists[x]] = storedLists[lists[x]];
      }
      deferred.resolve(_lists);
    } else {
      deferred.resolve(storedLists);
    }
    return deferred.promise;
  }

  // Listas
  ws.getLists = function(listNames) {
    var deferred = $q.defer();

    if (storedLists) {
      deferred.resolve(getLists(listNames));
      return deferred.promise;
    }

    var promise = $http({
      method: 'GET',
      url: '/lists',
      data: []
    });

    promise
    .success(function(data, status, headers, config) {
      storedLists = data || {};
      deferred.resolve(getLists(listNames));
    })
    .error(function(data, status, headers, config) {
      deferred.reject(data);
    });
    return deferred.promise;
  };

  ws.isIn = function(elem, array) {
    return (_.find(array, function(element) {
      return element == elem;
    })) ? true : false;
  };

  ws.convertDateToStringMessage = function(date) {
    date = date || new Date();
    var intervals = ['years', 'months', 'days', 'hours', 'minutes', 'seconds'];
    var output = ['año(s)', 'mes(es)', 'día(s)', 'hora(s)', 'minuto(s)', 'segundo(s)'];
    var interval = 0;
    var time = 0;

    for (var i in intervals) {
      if (time < 1) {
        time = moment().diff(date, intervals[i]);
        interval = i;
      }
    }
    return (!time || time < 0) ? ((time == 0) ? 'Ahora mismo' : '') : time + ' ' + output[interval];
  };

  // Funcion Abusiva de Andres
  ws.cascade = function(promises) {
    var results = [];
    var errors = [];
    var deferred = $q.defer();

    function success(r) {
      results.push(r);
    }
    promises.reduce(function(preCall, curCall) {
      var deferred = $q.defer();

      preCall.then(function(res) {
        success(res);
        deferred.resolve(curCall.function.apply(curCall.this, curCall.parameters));
      });

      return deferred.promise;

    }, $q.when())
      .then(function(data) {
        deferred.resolve(results);
      })
      .catch(deferred.reject);

    return deferred.promise;
  }

  ws.modalInput = function(title, description) {
    var dialog = dialogs.create(
      'partials/modals/modalInput.html',
      'ModalInputCtrl', {
        title: title,
        description: description
      }, {
        size: 'lg',
        animation: true
      });

    return dialog.result;
  }

  return ws;
});

/* Global Functions */
var extend = function(child, parent) {
  var hasProp = Object.prototype.hasOwnProperty;

  var key;
  for (key in parent) {
    if (hasProp.call(parent, key)) {
      child[key] = parent[key];
    }
  }

  function Ctor() {
    this.constructor = child;
  }
  Ctor.prototype = parent.prototype;
  child.prototype = new Ctor();
  child.super = parent.prototype;
  return child;
};
