



var VARS_FIELD = typeof Symbol === 'undefined' ? '__vars' + Date.now() : Symbol('vars');
var SUBSCRIPTIONS_FIELD = typeof Symbol === 'undefined' ? '__subs' + Date.now() : Symbol('subscriptions');

var utils = require('cordova/utils'),
  BaseClass = require('./BaseClass'),
  BaseArrayClass = require('./BaseArrayClass'),
  Query = require('./Query'),
  execCmd = require('./FirebaseDatabaseCommandQueue');

/*******************************************************************************
 * @name Reference
 ******************************************************************************/
function Reference(database, key, path, parentId) {
  var self = this,
    pluginName = database.id;

  Query.call(this, pluginName, database, key);

  Object.defineProperty(self, 'key', {
    value: key
  });

}

utils.extend(Reference, Query);

Reference.prototype.child = function(path) {
  var self = this;

  var reference = new Reference(this.ref, path, this.key + '/' + path, this.id);
  this._exec(function() {
    reference._privateInit();
  }, function(error) {
    throw new Error(error);
  }, this.pluginName, 'child', [{
    path: path,
    targetId: reference.id,
    parentId: this.id
  }]);

  return reference;
};

Reference.prototype.update = function(values, onComplete) {
  var self = this;
  return new Promise(function(resolve, reject) {
    self._exec(function() {
      resolve();
      if (typeof onComplete === 'function') {
        onComplete.call(self);
      }
    }, function(error) {
      reject(error);
    }, self.pluginName, 'updateKey', [{
      targetId: self.id,
      data: values
    }]);
  });
};

Reference.prototype.remove = function(onComplete) {
  var self = this;
  return new Promise(function(resolve, reject) {
    self._exec(function() {
      resolve();
      if (typeof onComplete === 'function') {
        onComplete.call(self);
      }
    }, function(error) {
      reject(error);
    }, self.pluginName, 'removeKey', [{
      targetId: self.id
    }]);
  });
};

module.exports = Reference;
