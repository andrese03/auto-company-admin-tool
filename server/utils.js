var q = require('q');
var md5 = require('MD5');
var _ = require('lazy');
var lists = require('./lists');

var GoodResponse = exports.GoodResponse = function(data) {
  this.result = 'Ok';
  this.data = data;
}

var BadResponse = exports.BadResponse = function(data) {
  this.result = 'Not Ok';
  this.data = data;
}

var convertPropertiesToDate = exports.convertPropertiesToDate = function(object) {
  var key;
  var dateRegex = /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))/;

  for (key in object) {

    //Si es un arreglo, para cada elemento, recursivamente actualizar sus propiedades
    if (Array.isArray(object[key])) {
      for (var i in object[key]) {
        object[key][i] = convertPropertiesToDate(object[key][i])
      }
    }
    //Si es un objeto recursivamente actualizar sus propiedades
    if (typeof object[key] == "object") {
      object[key] = convertPropertiesToDate(object[key])
    }
    // Si no es ninguno de estos, pues amen
    else if (typeof object[key] == "string") {
      if (/date/.test(key.toLowerCase()) || dateRegex.test(object[key])) {
        object[key] = new Date(object[key]);

        if (isNaN(object[key])) {
          object[key] = undefined;
        }

      }
    }
  }
  return object;
};

exports.success = function(res) {
  return function(data) {
    res.status(200).json(new GoodResponse(data));
  };
}

exports.failed = function(res) {
  return function(data) {
    res.status(510).json(new BadResponse(data));
  };
}

exports.inception = function(obj, path) {
  return path.split('.').reduce(function(prev, actual) {
    return prev[actual];
  }, obj);
};

exports.clone = function(obj) {
  var _this = this;
  var copy;

  // Handle the 3 simple types, and null or undefined
  if (null == obj || "object" != typeof obj) return obj;

  // Handle Date
  if (obj instanceof Date) {
    copy = new Date();
    copy.setTime(obj.getTime());
    return copy;
  }

  // Handle Array
  if (obj instanceof Array) {
    copy = [];
    for (var i = 0, len = obj.length; i < len; i++) {
      copy[i] = _this.clone(obj[i]);
    }
    return copy;
  }

  // Handle Object
  if (obj instanceof Object) {
    copy = {};
    for (var attr in obj) {
      if (obj.hasOwnProperty(attr)) copy[attr] = _this.clone(obj[attr]);
    }
    return copy;
  }

  throw new Error("Unable to copy obj! Its type isn't supported.");
}

exports.joinObjects = function(objTo, objFrom) {
  for (var i in objFrom) {
    objTo[i] = (objTo[i]) ? objTo[i] : objFrom[i];
  };
  return objTo;
}

exports.getLists = function() {
  return function(req, res) {
    var listNames = req.body.listNames || req.body || [];
    var _list = {};
    for (var key in listNames) {
      var prop = listNames[key];
      _list[prop] = lists[prop];
    }
    _list = (listNames.length) ? _list : lists;
    res.status(200).json(_list);
  };
};


exports.unauthorizedRequestHandler = function(err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    res.status(401).json(new BadResponse('invalid token'));
  }
}

exports.getSequence = function(db, collection) {
  var deferred = q.defer();
  var sequenceCollection = db.collection('sequence');
  try {
    sequenceCollection.findAndModify({
      collection: collection
    }, null, {
      $inc: {
        sequence: 1
      }
    }, {
      new: false
    }, function(err, result) {
      if (err != null)
        throw new Error(err);

      if (result.value == null) {
        sequenceCollection.insert({
          collection: collection,
          sequence: 2
        });
        deferred.resolve(1);
      } else {
        deferred.resolve(result.value.sequence);
      }

    });
  } catch (e) {
    deferred.reject({
      step: 'getSequence',
      message: e.message
    });
    return deferred.promise;
  }

  return deferred.promise;
}

exports.initializeDatabase = function(db) {

  var options = [{
    "_id": 1,
    "name": "users",
    "createdDate": new Date("2016-06-07T20:59:06.632Z"),
    "createdBy": {
      "_id": 1,
      "username": "admin",
      "fullName": "Andres Encarnación Ortiz"
    },
    "ownerId": 1,
    "description": "Usuarios",
    "type": {
      "_id": 1,
      "description": "Navigation"
    },
    "icon": "users"
  }, {
    "_id": 2,
    "name": "roles",
    "createdDate": new Date("2016-06-07T20:59:06.632Z"),
    "createdBy": {
      "_id": 1,
      "username": "admin",
      "fullName": "Andres Encarnación Ortiz"
    },
    "ownerId": 1,
    "description": "Roles",
    "type": {
      "_id": 1,
      "description": "Navigation"
    },
    "icon": "lock"
  }, {
    "_id": 3,
    "name": "options",
    "createdDate": new Date("2016-06-07T20:59:06.632Z"),
    "createdBy": {
      "_id": 1,
      "username": "admin",
      "fullName": "Andres Encarnación Ortiz"
    },
    "ownerId": 1,
    "description": "Opciones",
    "type": {
      "_id": 1,
      "description": "Navigation"
    },
    "icon": "gear"
  }];

  var roles = [
    {_id: 1, 'name': 'Administrador', options: options, "createdBy": {"_id": 1, "username": "admin", "fullName": "Andrés Encarnación Ortiz"}},
    {_id: 2, 'name': 'Supervisor', options: [], "createdBy": {"_id": 1, "username": "admin", "fullName": "Andrés Encarnación Ortiz"}},
    {_id: 3, 'name': 'Monitor', options: [], "createdBy": {"_id": 1, "username": "admin", "fullName": "Andrés Encarnación Ortiz"}},
    {_id: 4, 'name': 'Ejecutivo', options: [], "createdBy": {"_id": 1, "username": "admin", "fullName": "Andrés Encarnación Ortiz"}},
    {_id: 5, 'name': 'Cliente', options: [], "createdBy": {"_id": 1, "username": "admin", "fullName": "Andrés Encarnación Ortiz"}}
  ]

  var user = {
    "_id": 1,
    "username": "admin",
    "role": roles[0],
    "password": "21232f297a57a5a743894a0e4a801fc3",
    "createdDate": new Date("2016-06-15T00:52:49.634Z"),
    "ownerId": 1,
    "profile": {
      "firstName": "Andrés",
      "lastName": "Encarnación Ortiz"
    },
    "createdBy": {
      "_id": 1,
      "username": "admin",
      "fullName": "Andrés Encarnación Ortiz"
    },
    "active": true
  };

  var sequences = [
    { collection: 'option', sequence: 4},
    { collection: 'role', sequence: 6},
    { collection: 'user', sequence: 2}
  ];

  // Insertar Opciones
  db.collection('option').count(function(err, count) {
    if (!count)
      db.collection('option').insert(options);
  });

  // Insertar Roles
  db.collection('role').count(function(err, count) {
    if (!count)
      db.collection('role').insert(roles);
  });

  // Insertar un Usuario Administrador
  db.collection('user').count(function(err, count) {
    if (!count)
      db.collection('user').insert(user);
  });

  // Inserta las Secuencias
  db.collection('sequence').count(function(err, count) {
    if (!count)
      db.collection('sequence').insert(sequences);
  });
}

exports.credentials = function(req, ParentClass) {
  if (!req.user) return {};
  if (ParentClass.prototype.getCredentials != undefined) {
    return ParentClass.prototype.getCredentials(req);
  } else {
    return {
      ownerId: req.user._id
    };
  }
}
