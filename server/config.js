'use strict'
// Set your current enviroment [development|production]
var enviroment = process.env.NODE_ENV || 'development';

module.exports = function (app) {
  if (app)
    app.set('config', config[enviroment]);
  return config[enviroment];
}

var config = {
  development: {
    publicPath: 'client',
    databaseConnectionString: 'mongodb://192.168.1.205:27017/newlink',
    appPort: process.env.PORT || 8089,
    jwtSecret: 'newlink-321'
  },
  testing: {
    publicPath: 'client',
    databaseConnectionString: 'mongodb://localhost:27001/newlink',
    appPort: process.env.PORT || 1009,
    jwtSecret: 'newlink-321'
  },
  production: {
    publicPath: 'dist',
    databaseConnectionString: 'mongodb://localhost:27017/newlink',
    appPort: process.env.PORT || 3009,
    jwtSecret: 'newlink-321'
  }
}
