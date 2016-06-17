// server.js
'use_strict'

// Base Setup
var express = require('express');
var bodyParser = require('body-parser');
var errorHandler = require('errorhandler')
var path = require('path');
var app = express();
var jwtAuth = require('express-jwt');

// Own Modules
var config = require('./config')(app);
var utils = require('./utils');
var port = app.get('config').appPort;
var db = require('mongoskin').db(config.databaseConnectionString);

app.set('db', db);
app.use(bodyParser.json({ extended: true}));
app.use(bodyParser.urlencoded({ extended: true}));

utils.initializeDatabase(db);

app.use('/api', jwtAuth({secret: config.jwtSecret}), utils.unauthorizedRequestHandler);
app.use('/', express.static(config.publicPath, {maxAge: '1d'}));
app.use('/files', express.static('files', {maxAge: '1d'}));
app.use('/bower_components', express.static('bower_components', {maxAge: '1d'}));

switch (process.env.NODE_ENV) {
  case 'development':
    app.use(errorHandler({dumpExceptions: true, showStack: true }));
    break;
  case 'production':
    app.use(errorHandler());
    break;
  default:
    break;
}

/**
 * Toma Servicios que no tienen ningun tipo de modificación para correr automáticamente
 * Estos servicios no requieren de un ./routes/mi-servicio.js
 */
var runWebServices = function (webService) {
  require('./routes/generic')(webService, app);
};

var webServices = [];

webServices.forEach(runWebServices);

// Routes
require('./routes/option')('/api/option', app);
require('./routes/user')('/api/user', app);
require('./routes/role')('/api/role', app);
require('./routes/client')('/api/client',app);
require('./routes/common')(app);

// Server Run
app.listen(port, function () {
  console.log(`[*] Server Running on Port: ${port}`);
});

// Rutinas De Node
// job.restartSecuencias(app);
