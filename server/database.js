'use strict'
var q = require('q');
var MongoClient = require('mongodb').MongoClient

exports.init = function (app) {
  var deferred = q.defer();  
  var config = app.get('config');
  var db = null;

  // On Run Handler
  MongoClient.connect(config.databaseConnectionString, function(err, db) { 
    
    if (err) {
      deferred.reject(err);
      return deferred.promise;
    }

    app.set('db', db);
    deferred.resolve(db);

  });

  return deferred.promise;
}