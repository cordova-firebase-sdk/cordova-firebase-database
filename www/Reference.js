


var VARS_FIELD = typeof Symbol === 'undefined' ? '__vars' + Date.now() : Symbol('vars');
var SUBSCRIPTIONS_FIELD = typeof Symbol === 'undefined' ? '__subs' + Date.now() : Symbol('subscriptions');

var utils = require('cordova/utils'),
  BaseClass = require('./BaseClass'),
  BaseArrayClass = require('./BaseArrayClass'),
  Query = require('./Query'),
  execCmd = require('./commandQueueExecutor');

/*******************************************************************************
 * @name Reference
 ******************************************************************************/
function Reference(database, key, path, parentId) {
  var self = this,
    pluginName = database.id;

  Query.call(this, pluginName, this, key);

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
    refId: reference.refId,
    parentId: this.refId
  }]);

  return reference;
};

module.exports = Reference;
