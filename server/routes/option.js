var q = require('q');
var utils = require('../utils');
var OptionClass = require('../models/option');

module.exports = function (prefix, app) {

  var success = utils.success;
  var failed = utils.failed;
  var credentials = utils.credentials;
  var db = app.get('db');

  // Update
  app.put([prefix, (prefix + '/:id')], function (req, res) {
    var optionService = new OptionClass(db, req.user._id, credentials(req, OptionClass));
    var query = req.params.id ? {_id: Number(req.params.id)} : req.body.query;
    var object = req.params.id ? req.body : req.body.object;
    optionService.update(query, object)
    .then(success(res))
    .fail(failed(res));
  });

  // Add the Crud's web services
  require('./crud')(prefix, app, OptionClass);
}
