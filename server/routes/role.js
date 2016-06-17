var q = require('q');
var utils = require('../utils');
var RoleClass = require('../models/role')

module.exports = function (prefix, app) {

  var success = utils.success;
  var failed = utils.failed;
  var credentials = utils.credentials;
  var db = app.get('db');

  app.put(prefix + '/:id', function (req, res) {
  	var role = new RoleClass(db, req.user._id, credentials(req, RoleClass));
    var query = req.params.id ? {_id: Number(req.params.id)} : req.body.query;
    var object = req.params.id ? req.body : req.body.object;
  	role.update(query, object)
    .then(utils.success(res))
    .fail(utils.failed(res));
  });

  require('./crud')(prefix, app, RoleClass);
}
