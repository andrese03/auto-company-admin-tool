/*****VARIABLES PÚBLICAS*****/
var q = require('q');
var Crud = require('./crud');
var _ = require('lazy');
var config = require('../config')();
var jwt = require('jsonwebtoken');
var md5 = require('md5');

//Constructor
function User(db, ownerId, credentials) {

  this.ownerId = ownerId;
  this.schema = {
    "id": "/User",
    "type": "object",
    "properties": {
      "username": {
        "type": "string",
        "required": true
      },
      "password": {
        "type": "string",
        "required": true,
      },
      "email": {
        "type": "string",
        "required": false,
      },
      "role": {
        "type": "object",
        "item" : {
          "_id" : {
            "type": "number",
            "required": true
          },
          "name" : {
            "type": "string",
            "required": true
          },
          "options" : {
            "type": "array",
            "required": false
          },
        }
      },
      "active": {
        "type": "boolean",
        "required": false
      },
      "profile": {
        "type" : "object",
        "item" : {
          "firstName" : {
            "type": "string",
            "required": true
          },
          "lastName" : {
            "type": "string",
            "required": true
          },
        }
      }
    }
  }
  this.crud = new Crud(db, 'user', this.schema, this.ownerId, credentials);
  this.credentials = credentials;
}

  /**
   * [Find|Count|Distinct] by Selector, todos los parametros son opcionales (excepto search, que requiere fields)
   * {
   *  "selector": {
   *    "ownerId": 1
   *  },
   *  "search": "Test",
   *  "distinct": "name"
   *  "fields": ["ownerId", "name", "description"],
   *  "limit": 24,
   *  "skip": 1,
   *  "sort": {"ownerId":1, "createdDate":-1},
   *  "credentials": false,
   *  "date": [
   *    {"field": "createdDate", "from":"2016-06-08T04:00:00.000Z", "to": "2016-06-09T04:00:00.000Z"}
   *    {"field": "birthDate", "from":"2016-06-08T04:00:00.000Z", "to": "2016-06-09T04:00:00.000Z"}
   *  ]
   */

//Log in
User.prototype.login = function(username, password) {
  var deferred = q.defer();
  var query = {
    'selector': {
      'username': username,
      'password': md5(String(password)),
      'active'  : true
    }
  };

  this.crud.find(query)
           .then(function (result) {
              if (result.length > 0)
              {
                var user = result[0];
                delete user.password;
                user.token = jwt.sign(user, config.jwtSecret);
                deferred.resolve(user);
              }
              else
                deferred.reject({message : "Usuario no encontrado."});
           });

  return deferred.promise;
};


//Registrar un usuario
User.prototype.register = function(Obj) {
  var deferred = q.defer();
  var _this = this;
  user = {
    _id: 1,
    account: {
      username: 'andrese03'
    },
    profile: {
      firstName: 'Andrés',
      lastName: 'Encarnación'
    }
  };

  this.validateUser(Obj.username)
      .then(function (result) {

         return _this.validateEmail(Obj.email)
         .then(function (result) {

            Obj.password = md5(String(Obj.username));

            _this.crud.insert(Obj, this.schema, user)
            .then(function (result) {
               delete result.password;
               deferred.resolve(result);
            })
            .catch(function (result) {
               deferred.reject(result);
            });

         })
         .catch(function (result) {
            deferred.reject(result);
         });

      })
      .catch(function (result) {
         deferred.reject(result);
      });

  return deferred.promise;
};

//Reiniciar la contraseña
User.prototype.resetPassword = function(userId) {
  var deferred = q.defer();
  var _this = this;
  var query = {
    'selector': {
      '_id': Number(userId)
    }
  };

  this.crud.find(query)
           .then(function (result) {
              if (result.length > 0)
              {
                query = { _id: Number(userId) }
                var object = { password : String(md5(result[0].username)) };
                _this.crud.update(query, object)
                          .then(function (result) {
                             deferred.resolve(result);
                          })
                          .catch(function (result) {
                             deferred.reject(result);
                          });
              }
              else
                deferred.reject(result);
           });

  return deferred.promise;
};

//Cambiar la contraseña
User.prototype.changePassword = function(user, pass) {
  var deferred = q.defer();
  var _db = this.crud.db;
  var query = {
      username : String(user)
  };

   _db.collection('user').findAndModify( query , [[ '_id', 1 ]], { $set : { password : String(md5(pass)) } }, function (err, result) {
      if (err)
        deferred.reject(err);
      else
      {
        delete result.value.password;
        deferred.resolve(result.value);
      }
   })

  return deferred.promise;
};


//Valida si ya existe el usuario en la base de datos.
User.prototype.validateUser = function (username) {
  var deferred = q.defer();

  var query = {
    'selector': {
      'username': username
    }
  };

  this.crud.find(query)
           .then(function (result) {
              if (!(result.length > 0))
              {
                deferred.resolve(true);
              }
              else
                deferred.reject(false);
           })

  return deferred.promise;
}

//Valida si ya existe el email en la base de datos.
User.prototype.validateEmail = function (email) {
  var deferred = q.defer();

  var query = {
    'selector': {
      'email': email
    }
  };

  this.crud.find(query)
           .then(function (result) {
              if (!(result.length > 0))
                deferred.resolve(true);
              else
                deferred.reject(false);
           })

  return deferred.promise;
}

//Valida que la contraseña sea la misma que la que está en la base de datos.
User.prototype.validateOldPassword = function (pass) {
  var deferred = q.defer();

  var query = {
    'selector': {
      'password': String(md5(pass))
    }
  };

  this.crud.find(query)
           .then(function (result) {
              if (result.length > 0)
                deferred.resolve(true);
              else
                deferred.reject(false);
           })

  return deferred.promise;
}

//Elimina los usuarios que tienen los clientes.
User.prototype.delete = function (userId) {
  var deferred = q.defer();
  var _db = this.crud.db;
  var Object_id = userId;
  var query = {
    _id : Number(userId)
  };


  this.crud.delete(query)
           .then(function (result) {
              if (!(result.length > 0))
                 _db.collection('client').update({ }, { $pull : { users : { _id: Number(Object_id) } } }, { multi : true }, function (err , result) {
                    if (err)
                      deferred.reject(err);
                    else
                      deferred.resolve(result);
                 });
              else
                deferred.reject(false);
           })
           .catch(function (result) {
              deferred.reject(result);
           });

  return deferred.promise;
}

// Busca todos los clientes asociados a ese cliente
User.prototype.getClients = function(userId) {
  var deferred = q.defer();
  var _this = this;
  var _db = _this.crud.db;

  var query = {
    'users._id': Number(userId)
  };

  _db.collection('client').find(query).toArray(function (err, result) {
    if (err)
      deferred.reject({message: 'Ha ocurrido algo inesperado'});
    else if (result && !result.length)
      deferred.reject({message: 'No existen clientes asociados a este usuario'})
    else
      deferred.resolve(result);
  });

  return deferred.promise;
};

// Indica que los usuarios no tienen filtro especial
User.prototype.getCredentials = function(req) {
  return {};
};

var handleMongoResponse = function (deferred) {
  return function(err, data) {
    console.log(data);
    if (err) {
      console.log('[*] Error in Database', err)
      if (err instanceof Error)
        err = err.toString();

      deferred.reject({message: err})
    }
    else {
      deferred.resolve(data);
    }
  };
};

//Export
module.exports = User;