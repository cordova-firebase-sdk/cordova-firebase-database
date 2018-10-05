

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
    cmdQueue = new BaseArrayClass();
  BaseClass.apply(this);

  Object.defineProperty(self, 'ref', {
    value: database
  });
  Object.defineProperty(self, 'pluginName', {
    value: database.refId
  });
  Object.defineProperty(self, 'path', {
    value: path
  });
  Object.defineProperty(self, 'refId', {
    value: this.hashCode + '_ref'
  });

  Object.defineProperty(self, 'key', {
    value: key
  });

  Object.defineProperty(self, 'parent', {
    value: parentId || null
  });

  Object.defineProperty(self, '_isReady', {
    value: false,
    writable: true
  });

  cmdQueue._on('insert_at', function() {
    if (!self._isReady) return;

    var cmd;
    while(cmdQueue.getLength() > 0) {
      cmd = cmdQueue.removeAt(0, true);
      if (cmd && cmd.target && cmd.args) {
        execCmd.apply(cmd.target, cmd.args);
      }
    }
  });

  Object.defineProperty(self, '_cmdQueue', {
    value: cmdQueue,
    writable: false,
    enumerable: false
  });

}

utils.extend(Reference, BaseClass);

Reference.prototype._privateInit = function() {
  this._isReady = true;
  this._cmdQueue.trigger('insert_at');
};

Reference.prototype._exec = function() {
  this._cmdQueue.push.call(this._cmdQueue, {
    target: this,
    args: Array.prototype.slice.call(arguments, 0)
  });
};

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

Reference.prototype.endAt = function(value, key) {
  var self = this;

  var query = new Query(this, value, key);
  this._exec(function() {
    query._privateInit();
  }, function(error) {
    throw new Error(error);
  }, this.getPluginName(), 'endAt', [{
    value: value,
    key: key,
    refId: this.refId,
    queryId: query.queryId
  }]);


  return reference;
};

Reference.prototype.set = function(values) {
  console.log('[js]reference.set()', values, this.refId);
  var self = this;
  return new Promise(function(resolve, reject) {
    self._exec(resolve.bind(self), reject.bind(self), self.pluginName, 'setValue', [{
      refId: self.refId,
      data: values
    }]);
  });
};


Reference.prototype.toString = function() {
  return this.path;
};

module.exports = Reference;
