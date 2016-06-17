var q = require('q');
var utils = require('../utils');
var UserClass = require('../models/user')

module.exports = function (prefix, app) {

  var success = utils.success;
  var failed = utils.failed;
  var credentials = utils.credentials;
  var db = app.get('db');

  //Login
  app.post('/user/login', function (req, res) {
  	var user = new UserClass(db, null, credentials(req, UserClass));
  	user.login(req.body.username, req.body.password)
        .then(success(res))
        .catch(function (result) {
           res.status(401).json(result);
        });
  });

  //Registrarse
  app.post(prefix + '/register', function (req, res) {
  	var user = new UserClass(db, req.user._id, credentials(req, UserClass));
  	user.register(req.body)
        .then(success(res))
        .catch(failed(res));
  });

  //Registrarse
  app.post('/user/validateOldPassword', function (req, res) {
    var user = new UserClass(db, null, credentials(req, UserClass));
    user.validateOldPassword(req.body.password)
        .then(success(res))
        .catch(failed(res));
  });

  //Resetear contraseña
  app.post(prefix + '/:id/resetPassword', function (req, res) {
    var user = new UserClass(db, req.user._id, credentials(req, UserClass));
    user.resetPassword(req.params.id)
        .then(success(res))
        .catch(failed(res));
  });

  //Cambiar contraseña
  app.post('/user/changePassword', function (req, res) {
    var user = new UserClass(db, null, credentials(req, UserClass));
    user.changePassword(req.body.username, req.body.password)
        .then(success(res))
        .catch(failed(res));
  });

  // Delete
  app.delete(prefix + '/:id', function (req, res) {
    var user = new UserClass(db, req.user._id, credentials(req, UserClass));
    user.delete(req.params.id)
    .then(success(res))
    .fail(failed(res));
  });

  app.get(prefix + '/:id/clients', function (req, res) {
    var user = new UserClass(db, req.user._id, credentials(req, UserClass));
    user.getClients(req.params.id)
    .then(success(res))
    .fail(failed(res));
  })

  // Add the Crud's web services
  require('./crud')(prefix, app, UserClass);
}
