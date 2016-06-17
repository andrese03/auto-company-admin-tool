var q = require('q');
var utils = require('../utils');
var PersonClass = require('../models/person')
var prefix = '/person';

module.exports = function (app) {
	
	// Add the Crud's web services
	router = require('./crud')(prefix, PersonClass);

	app.use(router);
}