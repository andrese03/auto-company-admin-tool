'use_strict'
// server.js

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
var database = require('./database').init(app);

app.use(bodyParser.json({ extended: true}));
app.use(bodyParser.urlencoded({ extended: true}));
app.use('/api', jwtAuth({secret: config.jwtSecret}));
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
    console.log('LOL');
    break;
}

// Utility para CRUDS
var runWebServices = function (webService) {
  require('./routes/generic')('/api/' + webService, webService, app, db);
}

var webServices = [];

webServices.forEach(runWebServices);

// Rutinas De Node
// job.restartSecuencias(app);

// Routes
require('./routes/test')(app);

app.use('*', function(req, res, next){
  res.status(404).json(new utils.badResponse(`Wait what? 'The url you're trying to reach doesn't exist.`));
});

// Server Run
app.listen(port, function () {
  console.log(`[*] Server Running on Port: ${port}`);
});