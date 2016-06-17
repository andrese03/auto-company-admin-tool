var q = require('q');
var md5 = require('MD5');
var _ = require('lazy');
var _lists = require('./lists');

var success = function(res) {
  return function(data) {
    res.status(200).json(new goodResponse(data));
  };
}

var failed = function(res) {
  return function(data) {
    res.status(510).json(new badResponse(data));
  };
}

var mongooseCallback = function(req, res) {
  return function (err, obj) {
    if (err) {
      res.status(510).json(new badResponse(err));
      // throw err;
    } else {
      res.status(200).json(new goodResponse(obj));
    }
  };
}

// Toma un objeto y una ruta. Devuelve el valor encontrado en esa ruta.
var inception = function(obj, path) {
  return path.split('.').reduce(function(prev, actual) {
    return prev[actual];
  }, obj);
};

var cloneObject = function (object) {
  var newObject = {};
  for (var key in object) {
    newObject[key] = (newObject[key]) ? newObject[key] : object[key];
  };
  return newObject;
}

var joinObjects = function(objTo, objFrom) {
  for (var i in objFrom) {
    objTo[i] = (objTo[i]) ? objTo[i] : objFrom[i];
  };
  return objTo;
}

var getLists = function(lists) {
    var deferred = q.defer();
    var result = {};
    
    lists = lists || [];

    lists.forEach(function (list) {
      result['list'] = _lists['list']
    });

    deferred.resolve(result);
};

var goodResponse = function (data) {
  this.result = 'Ok';
  this.data = data;
}

var badResponse = function (data) {
  this.result = 'Not Ok';
  this.data = data;
}

// Exports Modules
exports.success = success;
exports.failed = failed;
exports.mongooseCallback = mongooseCallback;
exports.inception = inception;
exports.cloneObject = cloneObject;
exports.joinObjects = joinObjects;
exports.getLists = getLists;
exports.goodResponse = goodResponse;
exports.badResponse = badResponse;