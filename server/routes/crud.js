'use strict'
var util = require('../utils');
var router = require('express').Router();

module.exports = function(prefix, MongooseSchema) {
  var success = util.success;
  var failed = util.failed;
  var mongoCallback = util.mongoCallback;

  // Create
  router.post(`${prefix}`, function (req, res) {
    console.log(req.body)
    MongooseSchema.create(req.body).then(success(res), failed(res));
  });

  // Read
  router.get(`${prefix}`, function (req, res) {
    MongooseSchema.find({}).exec().then(success(res), failed(res));
  });

  // Read by Id
  router.get(`${prefix}/:id`, function (req, res) {
    MongooseSchema.findById(req.params.id).exec(mongoCallback(req, res));
  });

  // Update
  router.put(`${prefix}/:id`, function (req, res) {
    MongooseSchema.findByIdAndUpdate(req.params.id, req.body, {'new': true }, mongoCallback(req, res))
  });

  // Delete by Id
  router.delete(`${prefix}/:id`, function (req, res) {
    MongooseSchema.findByIdAndRemove(req.params.id, mongoCallback(req, res)); 
  });

  // Count
  router.post(`${prefix}/count`, function (req, res) {
    MongooseSchema.count({}, mongoCallback(req, res));
  });
  
  return router;
};