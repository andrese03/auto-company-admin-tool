var q = require('q');
var utils = require('../utils');
var ClientClass = require('../models/client')

module.exports = function (prefix, app) {

  var success = utils.success;
  var failed = utils.failed;
  var credentials = utils.credentials;

  // Add the Crud's web services
  require('./crud')(prefix, app, ClientClass);
}
