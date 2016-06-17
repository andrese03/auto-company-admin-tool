var q = require('q');
var Crud = require('./crud');
var _ = require('lazy');

//Constructor
function Role(db) {

  this.schema = {
    "id": "/Role",
    "type": "object",
    "properties": {
      "name": {
        "type": "string",
        "required": true
      },
      "options": {
        "type": "array",
        "required": true
      }
    }
  }

  this.crud = new Crud(db, 'role', this.schema);

}

Role.prototype.update = function (query, object){
  var deferred = q.defer();
  var _this = this;
  var _db = _this.crud.db;
  var _userCollection = _db.collection('user');

  _this.crud.update(query, object)
  .then(function (result) {

    _userCollection.update({'role._id': query._id}, {$set: {role: object}}, {multi:true}, function (err, result){
      if (err)
        deferred.reject(err);
      else
        deferred.resolve(result);
    });

  })
  .fail(function (error) {
    deferred.reject(error);
  })

  return deferred.promise;
}

//Export
module.exports = Role;
