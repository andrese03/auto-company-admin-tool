'use strict'
var utils = require('../utils');

module.exports = function(prefix, app, ParentClass) {
  var success = utils.success;
  var failed = utils.failed;
  var credentials = utils.credentials;
  var db = app.get('db');

  // Find by Id
  app.get(prefix + '/:id', function (req, res) {
    var parentService = new ParentClass(db, req.user._id, credentials(req, ParentClass));
    parentService.crud.findById(req.params.id)
    .then(success(res))
    .fail(failed(res));
  });

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

  // Find
  app.post(prefix + '/find', function (req, res) {
    var parentService = new ParentClass(db, req.user._id, credentials(req, ParentClass));
    parentService.crud.find(req.body)
    .then(success(res))
    .fail(failed(res));
  });

  // Count
  app.post(prefix + '/count', function (req, res) {
    var parentService = new ParentClass(db, req.user._id, credentials(req, ParentClass));
    parentService.crud.count(req.body)
    .then(success(res))
    .fail(failed(res));
  });

  // Distinct
  app.post(prefix + '/distinct', function (req, res) {
    var parentService = new ParentClass(db, req.user._id, credentials(req, ParentClass));
    parentService.crud.distinct(req.body)
    .then(success(res))
    .fail(failed(res));
  });

  // Insert
  app.post(prefix, function (req, res) {
    var parentService = new ParentClass(db, req.user._id, credentials(req, ParentClass));
    parentService.crud.insert(req.body, parentService.schema, req.user)
    .then(success(res))
    .fail(failed(res))
  });

  // Update
  app.put([prefix, (prefix + '/:id')], function (req, res) {
    var parentService = new ParentClass(db, req.user._id, credentials(req, ParentClass));
    var query = req.params.id ? {_id: Number(req.params.id)} : req.body.query;
    var object = req.params.id ? req.body : req.body.object;
    parentService.crud.update(query, object)
    .then(success(res))
    .fail(failed(res));
  });

  // Delete
  app.delete(prefix + '/:id', function (req, res) {
    var parentService = new ParentClass(db, req.user._id, credentials(req, ParentClass));
    console.log(req.params)
    parentService.crud.delete(req.params.id)
    .then(success(res))
    .fail(failed(res));
  });

};
