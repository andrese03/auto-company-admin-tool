'use strict'
// Set your current enviroment [development|production]
var enviroment = process.env.NODE_ENV || 'development';

module.exports = function (app) {
  app.set('config', config[enviroment]);
  return config[enviroment];
}

var config = {
  development: {
    publicPath: 'client',
    databaseConnectionString: 'mongodb://localhost:27017/newlink',
    appPort: process.env.PORT || 8080,
    jwtSecret: 'your-password'
  },
  production: {
    publicPath: 'dist',
    databaseConnectionString: 'mongodb://localhost:27017/test',
    appPort: process.env.PORT || 8080,
    jwtSecret: 'your-password'
  }
}