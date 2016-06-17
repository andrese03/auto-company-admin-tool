'use strict';

var app = angular.module('porsche');

app.factory('Base', function ($http, $q) {

  // Constructor
  var Base = function (propValues) {
    // Not allow instance of the base class
    if (this.constructor.name === "Base") {
      throw "The base class cannot be instantiated and is only meant to be extended by other classes.";
    }
    // Assign properties or instantiate them
    this.assignProperties(propValues);
  };

  // Paginated Search: Find documents filtered, sorted, limited and skiped by params.
  Base.prototype.find = function (params) {
    var deferred = $q.defer(),
      _Base = this.constructor;

    params = params || {};

    $http.post(this.APIEndpoint + '/find', params)
    .success(function (data, status, headers, config) {
      var response = {};
      var data = data.data;

      // Create a new object of the current class (or an array of them) and return it (or them)
      if (Array.isArray(data)) {
        response.data = data.map(function (obj) {
          return new _Base(obj);
        });
        // Add "delete" method to results object to quickly delete objects and remove them from the results array
        response.delete = function (object) {
          object.delete().then(function () {
            response.data.splice(response.data.indexOf(object), 1);
          });
        };
      }
      else {
        response = new _Base(data);
      }
      return deferred.resolve(response);
    })
    .error(function (data, status, headers, config) {
      return deferred.reject(data);
    });

    return deferred.promise;
  };

  //findById: Search just one document
  Base.prototype.findById = function (id) {
    var deferred = $q.defer(),
      _Base = this.constructor;

    if (id == undefined) {
      deferred.reject({
        result: 'Not ok',
        data: {
          message: 'Debe introducir un id'
        }
      });
      return deferred.promise;
    }
    $http.get(this.APIEndpoint + '/' + id).success(function (result, status, headers, config) {
      var response = {},
        data = result.data;

      // console.log('\n\n WsBase -> findById -> Data: ', result.data);

      //Create a new object of the current class (or an array of them) and return it (or them)
      if (Array.isArray(data)) {
        response.data = data.map(function (obj) {
          return new _Base(obj);
        });
        //Add "delete" method to results object to quickly delete objects and remove them from the results array
        response.delete = function (object) {
          object.delete().then(function () {
            response.data.splice(response.data.indexOf(object), 1);
          });
        };
      } else {
        hiddenProperties.data = data;
        response = new _Base(data);
      }
      return deferred.resolve(response);
    }).error(function (data, status, headers, config) {
      return deferred.reject(data);
    });
    return deferred.promise;
  };

  // Paginated Search: Find documents filtered, sorted, limited and skiped by params.
  Base.prototype.count = function (params) {
    var deferred = $q.defer();
    var _Base = this.constructor;

    params = params || {};

    $http.post(this.APIEndpoint + '/count', params)
    .success(function (data, status, headers, config) {
      var response = {};
      var data = data.data;
      //Create a new object of the current class (or an array of them) and return it (or them)
      if (Array.isArray(data)) {
        response.data = data.map(function (obj) {
          return new _Base(obj);
        });
        //Add "delete" method to results object to quickly delete objects and remove them from the results array
        response.delete = function (object) {
          object.delete().then(function () {
            response.data.splice(response.data.indexOf(object), 1);
          });
        };
      }
      else {
        data = {count: data };
        response = new _Base(data);
      }
      return deferred.resolve(response);
    })
    .error(function (data, status, headers, config) {
      return deferred.reject(data);
    });
    return deferred.promise;
  };

  // Distinct
  Base.prototype.distinct = function (distinct) {
    var deferred = $q.defer();
    var  _Base = this.constructor;
    if (distinct == null || distinct == undefined) {
      throw new Error('Necesito un campo para poder buscar');
    };

    params = params || '';

    params = (typeof params == 'string')
    ? {distinct: distinct}
    : params

    $http.post(this.APIEndpoint + '/distinct', params)
    .success(function (data, status, headers, config) {
      var response = data.data;
      return deferred.resolve(response);
    })
    .error(function (data, status, headers, config) {
      return deferred.reject(data);
    });
    return deferred.promise;
  };

  /*
  Persist the current object's data by passing it to a REST API
  Dynamically switch between POST and PUT verbs if the current object has a populated _id property
  */
  Base.prototype.save = function (data) {
    var promise;
    var _this = this;
    var deferred = $q.defer();

    if (data == null || data == undefined) {
      delete this.errors;
      data = this.getDataForAPI();
    }

    delete data.APIEndpoint;

    if (_this.validate ? !_this.validate() : !validate()) {
      deferred.reject(new Error('Invalid Object'));
      return deferred.promise;
    }

    var _endPoint = (_this._id != null && _this._id != undefined)
    ? _endPoint = _this.APIEndpoint + "/" + _this._id
    : _this.APIEndpoint;

    promise = (_this.createdBy != undefined)
    ? $http.put(_endPoint, data )
    : $http.post(_endPoint, data );

    promise
    .success(function (data, status, headers, config) {
      return deferred.resolve(_this.successCallback(data, status, headers, config));
    })
    .error(function (data, status, headers, config) {
      return deferred.reject(_this.failureCallback(data, status, headers, config));
    });
    return deferred.promise;
  };

  Base.prototype.delete = function (params) {
    var _this = this;
    if (params == null) {
      params = {};
    }
    var deferred = $q.defer();

    var url = "" + this.APIEndpoint;
    if (_this._id)
       url = _this.APIEndpoint + "/" + this._id;

    $http.delete(url, {query: params })
    .success(function (data, status, headers, config) {
      return deferred.resolve(_this.successCallback(data, status, headers, config));
    }).error(function (data, status, headers, config) {
      return deferred.reject(_this.failureCallback(data, status, headers, config));
    });

    return deferred.promise;
  };

  Base.prototype.assignProperties = function (data) {

    // Variables
    var _this = this;

    //
    data = convertPropertiesToDate(data);
    // Functions

    // Look for the property value
    var getPropertyValue = function (_defaultValue, _value) {

      // Check if this property should be an instance of another class
      if (_defaultValue != null && typeof _defaultValue === "function") {

        // Check if it is just an insance or an array of instances
        if (Array.isArray(_value)) {
          return _value.map(function (obj) {
            return new _defaultValue(obj);
          });
        }
        else {
          return new defaultValue(_value);
        }

      // If it is not an instance just assign everything
      }
      else if (typeof _value == "object") {
        return convertPropertiesToDate(_value);
      }
      else {
        return _value;
      }
    };

    // Business Logic
    if (data == null) {
      data = {};
    }

    var properties = this.constructor.properties();

    // Look for each property in the class
    for (var key in data) {

      // Get default value / constructor
      var defaultValue = properties[key];

      _this[key] = getPropertyValue(defaultValue, data[key]);
    };

    _this.setHiddenProperties({
      validate: validate
    });

    // return the incoming data in case some other function wants to play with it next
    return data;
  };

  Base.prototype.getDataForAPI = function (object) {

    if (object == null) {
      object = this;
    }

    delete object.errors;

    return JSON.parse(JSON.stringify(object));
  };

  Base.prototype.refresh = function () {
    var deferred = $q.defer();
    var _this = this;

    if (_this._id == undefined)
      throw new Error('Refresh needs the id of the object');

    _this.findById(_this._id)
    .then(function(data){
      deferred.resolve(_this.assignProperties(hiddenProperties.data));
      delete hiddenProperties.data;
    })
    .catch(deferred.reject);

    return deferred.promise;
  };

  /*
    Callbacks for $http response promise
  */
  Base.prototype.successCallback = function (data, status, headers, config) {
    // console.log(data, 'successCallback');
    return this.assignProperties((data.data != undefined) ? data.data: data);
  };

  Base.prototype.failureCallback = function (data, status, headers, config) {
    return this.assignErrors(data.error || data);
  };

  Base.prototype.assignErrors = function (errorData) {
    return this.errors = errorData;
  };

  Base.prototype.setHiddenProperties = function (object) {
    for (var property in object) {
      hiddenProperties[property] = object[property];
    }
  };

  Base.prototype.getHiddenProperties = function (property) {
    var resolve = {};
    if (property) {
      var keys = Object.keys(hiddenProperties);
      for (var x in property) {
        if (_.contains(keys, property[x])) {
          resolve[property[x]] = hiddenProperties[property[x]];
        }
      }
      return resolve;
    }
    else {
      return hiddenProperties
    }
    return (property) ? hiddenProperties[property] : hiddenProperties;
  };

  var validate = Base.prototype.validate = function () {
    // I do nothing... lol
    return true;
  };

  var hiddenProperties = {};

  function convertPropertiesToDate(object) {
    var key;
    var dateRegex = /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))/;

    for (key in object) {

      //Si es un arreglo, para cada elemento, recursivamente actualizar sus propiedades
      if (Array.isArray(object[key])) {
        for (var i in object[key]){
          object[key][i] = convertPropertiesToDate(object[key][i])
        }
      //Si es un objeto recursivamente actualizar sus propiedades
      } if (typeof object[key] == "object") {
        object[key] = convertPropertiesToDate(object[key])
      } else if (typeof object[key] == "string") {
        if (/date|fecha/.test(key.toLowerCase()) || dateRegex.test(object[key]) ) {
          object[key] = new Date(object[key]);

          if (isNaN(object[key])) {
            object[key] = undefined;
          }

        }
      }

    }
    return object;
  };

  return Base;

});
