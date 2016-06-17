module.exports = function (prefix, app) {
  
  var parentClass = require('../models/' + prefix);

  // Add the Crud's web services
  require('./crud')( '/api/' + prefix, app, parentClass);

}