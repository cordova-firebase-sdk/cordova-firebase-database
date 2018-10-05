


var VARS_FIELD = typeof Symbol === 'undefined' ? '__vars' + Date.now() : Symbol('vars');
var SUBSCRIPTIONS_FIELD = typeof Symbol === 'undefined' ? '__subs' + Date.now() : Symbol('subscriptions');

var utils = require('cordova/utils'),
  BaseClass = require('./BaseClass'),
  BaseArrayClass = require('./BaseArrayClass'),
  execCmd = require('./commandQueueExecutor');

/*******************************************************************************
 * @name DataSnapshot
 ******************************************************************************/
function DataSnapshot(ref, nativeResults) {
  var self = this;

  Object.defineProperty(self, 'ref', {
    value: ref
  });
  Object.defineProperty(self, 'key', {
    value: nativeResults.key
  });
  Object.defineProperty(self, '_nativeResults', {
    value: nativeResults,
    enumerable: false
  });
}

DataSnapshot.prototype.forEach = function(action) {
  var values = JSON.parse(this._nativeResults.exportVal);
  var keys = Object.keys(values);
  keys = this.sortFunc(keys);
};


DataSnapshot.prototype.getPriority = function() {
  return this._nativeResults.getPriority;
};

DataSnapshot.prototype.hasChild = function(path) {
  var values = JSON.parse(this._nativeResults.exportVal);
  return path in values;
};

DataSnapshot.prototype.hasChildren = function() {
  var values = JSON.parse(this._nativeResults.exportVal);
  var keys = Object.keys(values);
  for (var i = 0; i < keys.length; i++) {
    if (typeof values[key] === 'object') {
      return true;
    }
  }
  return false;
};

DataSnapshot.prototype.numChildren = function() {
  return this._nativeResults.numChildren;
};
DataSnapshot.prototype.exportVal = function() {
  return JSON.parse(this._nativeResults.exportVal);
};
DataSnapshot.prototype.val = function() {
  return JSON.parse(this._nativeResults.exportVal);
};
DataSnapshot.prototype.toJson = function() {
  return JSON.parse(this._nativeResults.exportVal);
};


module.exports = DataSnapshot;
