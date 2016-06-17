var q = require('q');
var utils = require('../utils');
var moment = require('moment');
var Validator = require('jsonschema').Validator;

/**
 * Constructor de Crud
 */
function Crud(db, table, schema, ownerId, credentials) {
  this.db = db;
  this.table = table;
  this.schema = schema
  this.ownerId = ownerId
  this.credentials = credentials
  this.validator = new Validator();
  this.uniqueProperties = [];
};

/**
 * Verifica si el objeto a ser insertado ya lo esta
 * Recibe un arreglo de keys, si al menos encuentra un objeto con una propiedad
 * que tenga el mismo valor retorna un error. Ej. ['_id','nombre']
 * Si desea validar varios keys juntos como un primary key de varias variables,
 * envie en lugar de un key, un arreglo de keys Ej. ['_id','nombre',['_id','doctorId']]
 */
Crud.prototype.validateUniqueProperties = function(object, crud, composedKey) {
  var deferred = q.defer();
  var query = {'$or': [] };
  var uniqueProperties = crud.uniqueProperties || [];

  if (uniqueProperties.length === 0) {
    deferred.resolve({exists: false });
    return deferred.promise;
  }

  for (var x in uniqueProperties) {
    var propertie = {};

    if (Array.isArray(uniqueProperties[x])) {
      propertie.$and = uniqueProperties[x].map(function(field) {
        var obj = {};
        obj[field] = object[field];
        return obj;
      })
    } else {
      propertie[uniqueProperties[x]] = object[uniqueProperties[x]];
    }
    query.$or.push(propertie);
  }

  query._id = {
    $ne: object._id
  };

  crud.db.collection(crud.table).findOne(query, function(err, doc) {

    if (!doc) {
      deferred.reject(err);
      return deferred.promise;
    }

    if (doc && doc.length > 0) {
      deferred.resolve({
        exists: true,
        message: 'Este valor ya existe.',
        keys: uniqueProperties,
        code: 300
      });
    }
    else {
      deferred.resolve({
        exists: false
      });
    }

    return deferred.promise;

  });

  return deferred.promise;
};

/**
 * Valida que el el objeto a insertar cumpla con el esquema de datos
 * por defecto toma el schema pasado en el constructor en caso de no tener
 */
Crud.prototype.validateSchema = function(object, schema, deferred) {
  var _this = this;
  var deferred = q.defer();

  // El Schema no está definido
  if (!schema == null) {
    deferred.reject({
      step: 'validateSchema',
      message: 'Schema is not defined'
    });
    return deferred.promise;
  }

  // Si no hay un Schema, se le coloca el del ParentClass por defecto
  schema = schema = _this.schema;
  var validation = _this.validator.validate(object, schema);

  // Hay errores en el Schema
  if (validation.errors.length > 0)
    deferred.reject(validation.errors);

  // No hay errores
  else
    deferred.resolve([]);

  return deferred.promise;
};

/**
 * Es quien se encarga de construir los parametros para busquedas
 * Actualmente trabaja para find y count. 08/06/2016
 */
Crud.prototype.buildSelector = function(options) {
  try {

    var _this = this;
    var date = options.date;
    var search = options.search;
    var fields = options.fields || [];
    var selector = {};
    var pagination = {};
    var distinct = options.distinct || null;

    // Filtro Avanzado
    if (options.selector) {

      selector = options.selector || {};
      // Si el filtro viene como string se intenta parsear
      if (typeof options.selector == 'string') {
        try {
          selector = JSON.parse(options.selector);
        }
        catch (e) {
          console.log('[*] Error parsing options.selector', e.message);
        }
      }

      // TODO: Test
      selector = utils.convertPropertiesToDate(selector);
    }

    // Pagination Options
    pagination = {
      limit: options.limit || 0,
      skip: options.skip || 0,
      sort: options.sort || [['_id', 1]]
    }

    if (Array.isArray(fields) && fields.length > 0 && !(fields.indexOf('*') === -1)) {
      pagination.fields = fields.reduce(function(wrapper, field) {
          wrapper[field] = 1;
        return wrapper;
      }, {});
    }

    // User Credentials
    selector = (options.credentials === false)
    ? selector
    : utils.joinObjects(selector, _this.credentials);
    // console.log('[*] User Credentials', selector);

    // El texto de busqueda se convierte en una expresión regular
    search = (search)
    ? convertStringToRegularExpression(search)
    : null;

    // Se inicia la busqueda sabiendo que hay campos y un texto que buscar
    if (Array.isArray(fields) && fields.length > 0 && search) {

      selector.$or = selector.$or || [];

      for (var i in fields) {
        var field = fields[i];

        if (field == '*')
          continue;

        var condition = {};

        if (isNaN(search)) {
          condition[field] = {$regex: search, $options: 'i'}
        }
        else {
          condition[field] = Number(search)
          var _condition = {}
          _condition[field] = {
            $regex: search.join(),
            $options: 'i'
          };
          selector.$or.push(_condition);
        }
        selector.$or.push(condition);
      };

      // Si la busqueda se quedó vacia, se elimina el or
      if (selector.$or.length == 0) {
        delete selector.$or;
      }
    }

    // Filtro por multiples campos para fecha
    if (date != undefined && date != "") {
      // console.log('[*] Date Range');
      selector.$and = (selector.$and) ? selector.$and : [];

      date.forEach(function(params) {
        var dateFrom = (params.from) ? moment(params.from).toDate() : null;
        var dateTo = (params.to) ? moment(params.to).toDate() : null;
        var condition = {};
        condition[params.field] = {};
        if (dateFrom)
          condition[params.field].$gte = dateFrom;
        if (dateTo)
          condition[params.field].$lte = dateTo;
        selector.$and.push(condition);
      });
    }

    // Field Distinct en caso de que se haga este query

    // console.log("[*] Where");
    // console.log(JSON.stringify(selector));

    // console.log("[*] Pagination");
    // console.log(JSON.stringify(pagination));

    return {selector: selector, pagination: pagination, distinct: distinct}
  }
  catch (e) {
    // Error construyendo parametros
    console.log('[*] Error en construyendo parametros', e.message)
    return null;
  }
};

/**
 * Encuentra un objeto por su _id
 */
Crud.prototype.findById = function(query, options) {
  var deferred = q.defer();
  var _this = this;

  query = query || {};
  options = options || {};

  if (!isNaN(query)) {
    query = {
      _id: Number(query)
    };
  }

  _this.db.collection(_this.table).findOne(query, function(err, data) {
    if (err || !data) {
      deferred.reject(err || data);
    }
    else {
      deferred.resolve(data);
    }
  });

  return deferred.promise;
};

/**
 * Search (With Advanced Search)
 *
 * search: a string that is going to be look in a set of fields
 * fields: array of strings with the fields names that the 'search' attribute is going to be looked in
 * limit: number of records
 * skip: number of records to be skipped
 * sort: object with the fields in which the query is going to be sorted
 * selector: selector that is gonna be used, must be passed as a String
 * credentials: boolean that indicates whether the search needs credentials or not, by default is true
 */
Crud.prototype.find = function(options) {

  try {

    var _this = this;
    var deferred = q.defer();

    options = _this.buildSelector(options);

    _this.db.collection(_this.table).find(options.selector, options.pagination).toArray(handleMongoResponse(deferred));

    return deferred.promise;
  }
  catch (e) {
    // Error en busqueda paginada
    deferred.reject(e);
    // console.log('[*] Error en busqueda paginada', e)
  }
};

/**
 * Count (With Advanced Search)
 *
 * search: a string that is going to be look in a set of fields
 * fields: array of strings with the fields names that the 'search' attribute is going to be looked in
 * limit: number of records
 * skip: number of records to be skipped
 * sort: object with the fields in which the query is going to be sorted
 * selector: selector that is gonna be used, must be passed as a String
 * credentials: boolean that indicates whether the search needs credentials or not, by default is true
 */
Crud.prototype.count = function(options) {

  try {

    var _this = this;
    var deferred = q.defer();

    options = _this.buildSelector(options);

    _this.db.collection(_this.table).count(options.selector, handleMongoResponse(deferred));

    return deferred.promise;
  }
  catch (e) {
    // Error en busqueda paginada
    deferred.reject(e);
    console.log('[*] Error en busqueda paginada', e.message);
    // throw e;
  }
};

/**
 * No se bien lo que hace, preguntar a Caleb antes de que se vaya
 */
Crud.prototype.distinct = function(options) {
  try {
    var _this = this;
    var deferred = q.defer();

    options = _this.buildSelector(options);

    if (!options.distinct)
      throw {
        step: 'validatingSelector',
        message: 'options.distinct is required'
      }

    _this.db.collection(_this.table).distinct(options.distinct, options.selector, handleMongoResponse(deferred));

    return deferred.promise;
  }
  catch (e) {
    // Error en busqueda paginada
    deferred.reject(e);
    console.log('[*] Error en busqueda paginada', e.message);
    // throw e;
  }

  return deferred.promise;
};

/**
 * Inserta un Objeto en la Base de Datos
 * Se puede enviar un Schema en caso de no querer usar el que está por defecto
 */
Crud.prototype.insert = function(object, schema, user) {
  var deferred = q.defer();
  var _this = this;

  // Objeto Inválido
  if (!object)
    throw new Error('Error, request.body is required');

  object = utils.convertPropertiesToDate(object);
  object.createdDate = object.createdDate || new Date();

  // Usuario Responsable
  if (user) {
    object.createdBy = {
      _id : user._id,
      username : user.username,
      fullName : ( (user.profile.firstName || '') + ' ' + (user.profile.lastName || '') ).trim()
    }
  }

  // El creador del objeto es por defecto el usuario que está insertando
  object.ownerId = object.ownerId || object.createdBy._id;

  // Validando Schema
  _this.validateSchema(object, schema)
  .then(function (result) {
    return _this.validateUniqueProperties(object, _this, _this.composedKey);
  })
  // Validando Propiedades Unicas (TODO)
  .then(function(result) {

    // Existe un Duplicado
    if (result.exists)
      throw result;

    return utils.getSequence(_this.db, _this.table)
  })
  // Obteniendo Numero de Secuencial
  .then(function(sequence) {
    object._id = sequence;

    _this.db.collection(_this.table).insert(object, function(err, result) {
      if (err)
        throw err;
      deferred.resolve(result.ops[0]);
    });

  })
  .fail(function (result) {
    deferred.reject(result);
  });

  return deferred.promise;
}

/**
 * Actualiza un Objeto en la Base de Datos
 * Se puede enviar un Schema en caso de no querer usar el que está por defecto
 */
Crud.prototype.update = function(query, object) {
  var deferred = q.defer();
  var _this = this;

  if (object.APIEndpoint)
    delete object.APIEndpoint;

  if (query == undefined || JSON.stringify(query) == '{}')    throw new Error('query is not defined');
  if (object == undefined || JSON.stringify(object) == '{}')  throw new Error('object is not defined');

  object = utils.convertPropertiesToDate(object);

  // Validando Propiedades Unicas (TODO)
  _this.validateUniqueProperties(object, _this, _this.composedKey)
  .then(function(result) {

    // Existe un Duplicado
    if (result.exists)
      throw result;

    _this.db.collection(_this.table).update(query, {$set: object }, handleMongoResponse(deferred));

  })
  .fail(function (result) {
    deferred.reject(result);
  });

  return deferred.promise;
};

/**
 * Borra un objeto por su _id
 * Mas adelante agregarle que se pueda borrar por algún parametro extra
 */
Crud.prototype.delete = function(query) {
  var deferred = q.defer();
  var _this = this;

  if (JSON.stringify(query) == '{}')
    throw new Error('query is not defined');

  if (!isNaN(query)) {
    query = {
      _id: Number(query)
    };
  }

  this.db.collection(_this.table).remove(query, null, function(err, result) {

    if (err)
      throw err;

    if (result.result.n > 0) {
      deferred.resolve(result.result.n || result.null);
    } else {
      deferred.reject(result.result.n || null);
    }
  });

  return deferred.promise;
};

/**
 * Funcion rapida para la ejecucion de queries en MongoClient
 * No funciona para todos los casos
 */
var handleMongoResponse = function (deferred) {
  return function(err, data) {
    if (err) {
      console.log('[*] Error in Database', err)
      if (err instanceof Error)
        err = err.toString();

      deferred.reject({message: err})
    }
    else {
      deferred.resolve(data);
    }
  };
};

/**
 * Caracteres del alfabeto con sus acentuaciones
 * Usado para crear el Regex de AdvancedSearch
 */
var accented = {
  'A': '[aàáâäãÅåæ]',
  'B': '[bß]',
  'C': '[cçÇ]',
  'D': '[d]',
  'E': '[eèéêëÆæœ]',
  'F': '[f]',
  'G': '[g]',
  'H': '[h]',
  'I': '[iíïî]',
  'J': '[j]',
  'K': '[k]',
  'L': '[l]',
  'M': '[m]',
  'N': '[nñ]',
  'O': '[oòóõöôØøœ]',
  'P': '[p]',
  'Q': '[q]',
  'R': '[r]',
  'S': '[s]',
  'T': '[t]',
  'U': '[uûüùú]',
  'V': '[v]',
  'W': '[w]',
  'X': '[x]',
  'Y': '[yýÿ]',
  'Z': '[z]'
};

/**
 * Convierte un String en una expresión Regular para poder filtrar
 * palabras que contengan acentos u otros signos de puntuación
 */
var convertStringToRegularExpression = function(string) {
  var _string = '';
  string = (string || '').toUpperCase();
  for (var x in string) {
    _string = _string.concat(accented[string[x]] || string[x]);
  }

  var split = _string.split(' ');
  for (var x in split) {
    split[x] = '(?=.*' + split[x] + ')';
  }
  var _string = '';
  for (var x in split) {
    _string = _string.concat(split[x]);
  }
  return _string;
};

// Export
module.exports = Crud;
