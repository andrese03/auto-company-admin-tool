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
    databaseConnectionString: 'mongodb://localhost:27017/porsche',
    appPort: process.env.PORT || 8089,
    jwtSecret: 'porsche-321'
  },
  testing: {
    publicPath: 'client',
    databaseConnectionString: 'mongodb://localhost:27001/porsche',
    appPort: process.env.PORT || 1009,
    jwtSecret: 'porsche-321'
  },
  production: {
    publicPath: 'dist',
    databaseConnectionString: 'mongodb://localhost:27017/porsche',
    appPort: process.env.PORT || 3009,
    jwtSecret: 'porsche-321'
  }
}
