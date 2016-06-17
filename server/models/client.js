var q = require('q');
var Crud = require('./crud');
var _ = require('lazy');

//Constructor
function Client(db, ownerId, credentials) {

  

  this.ownerId = ownerId;
  this.schema = {
    "id": "/Client",
    "type": "object",
    "properties": {
      "name": {
        "type": "string",
        "required": true
      },
      "address":{
        "type":"string",
        "required":false
      },
      "postalCode":{
        "type":"string",
        "required":true
      },
      "country": {
        "type": "string",
        "required": true
      },
      "phone":{
        "type":"string",
        "required":false
      },
      "validity":{
        "type":"object",
        "required":false
      },
      "freePressMultiplier":{
        "type":"number",
        "required":false
      },
      "user": {
        "type":"array",
        "require":false
      },
      "themes":{
        "type":"array",
        "require":true
      },
      "interestEntities":{
        "type":"array",
        "require":true
      }
    }
  }
  this.crud = new Crud(db, 'client', this.schema, this.ownerId, credentials);
  this.credentials = credentials;
}


Client.prototype.getCredentials = function() {
  return {};
};

//Export
module.exports = Client;
