var q = require('q');
var Crud = require('./crud');
var utils = require('../utils');

//Constructor
function Option(db, ownerId, credentials) {

  this.ownerId = ownerId;
  this.schema = {
    "id": "/Option",
    "type": "object",
    "properties": {
      "name": {
        "type": "string",
        "required": true
      },
      "description": {
        "type": "string",
        "required": true
      },
      "type": {
        "type": "object",
        "required": true
      },
      "icon": {
        "type": "string",
        "required": false
      }
    }
  }
  this.crud = new Crud(db, 'option', this.schema, this.ownerId, credentials);
  this.credentials = credentials;
}

Option.prototype.update = function(query, option) {
  var deferred = q.defer();
  var _this = this;
  var _db = _this.crud.db;
  var _roleCollection = _db.collection('role');
  var _userCollection = _db.collection('user');

  _this.crud.update(query, option)
  .then(function (result) {
    var query = {'options._id': option._id};
    _roleCollection.find(query).toArray(function (err, roles) {
      if (err)
        deferred.reject(err);
      else {
        roles.forEach(function (role) {
          for (var i in role.options) {
            if (role.options[i]._id == option._id) {
              role.options[i] = option;
              break;
            }
          };
          _roleCollection.update({_id: utils.clone(role)._id}, utils.clone(role));
          _userCollection.update({'role._id': role._id}, {$set: {'role': role}});
        });
        deferred.resolve(result)
      }
    });
  })
  .fail(function (error) {
    deferred.reject(error);
  })

  return deferred.promise;
};


Option.prototype.getCredentials = function() {
  return {};
};

//Export
module.exports = Option;
