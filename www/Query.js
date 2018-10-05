

var VARS_FIELD = typeof Symbol === 'undefined' ? '__vars' + Date.now() : Symbol('vars');
var SUBSCRIPTIONS_FIELD = typeof Symbol === 'undefined' ? '__subs' + Date.now() : Symbol('subscriptions');

var utils = require('cordova/utils'),
  BaseClass = require('./BaseClass'),
  BaseArrayClass = require('./BaseArrayClass'),
  DataSnapshot = require('./DataSnapshot'),
  execCmd = require('./commandQueueExecutor');

/*******************************************************************************
 * @name Query
 ******************************************************************************/
function Query(pluginName, ref, key) {
  var self = this,
    cmdQueue = new BaseArrayClass();
  BaseClass.apply(this);

  Object.defineProperty(self, 'pluginName', {
    value: pluginName
  });

  Object.defineProperty(self, 'ref', {
    value: ref
  });

  Object.defineProperty(self, 'id', {
    value: this.hashCode
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

utils.extend(Query, BaseClass);

Query.prototype._privateInit = function() {
  this._isReady = true;
  this._cmdQueue.trigger('insert_at');
};

Query.prototype._exec = function() {
  this._cmdQueue.push.call(this._cmdQueue, {
    target: this,
    args: Array.prototype.slice.call(arguments, 0)
  });
};



Query.prototype.endAt = function(value, key) {
  var self = this;

  var query = new Query(this, value, key);
  this._exec(function() {
    query._privateInit();
  }, function(error) {
    throw new Error(error);
  }, this.getPluginName(), 'endAt', [{
    value: value,
    key: key,
    refId: this.id,
    queryId: query.id
  }]);


  return reference;
};

Query.prototype.set = function(values) {
  console.log('[js]reference.set()', values, this.refId);
  var self = this;
  return new Promise(function(resolve, reject) {
    self._exec(resolve.bind(self), reject.bind(self), self.pluginName, 'setValue', [{
      refId: self.id,
      data: values
    }]);
  });
};


Query.prototype.toString = function() {
  return this.path;
};

Query.prototype.once = function(eventType, successCallback, failureCallbackOrContext, context) {
  var self = this;
  var context_ = this;
  if (arguments.length === 4) {
    context_ = context;
  } else if (arguments.length === 3) {
    context_ = failureCallbackOrContext;
  }

  return new Promise(function(resolve, reject) {
    self._exec(function(result) {

      var snapshot = new DataSnapshot(self, result);
      resolve.call(context_, snapshot);
      if (typeof successCallback === 'function') {
        successCallback.call(context_, snapshot);
      }

    }, function(error) {
      reject.call(context_, error);
      if (typeof failureCallbackOrContext === 'function') {
        failureCallbackOrContext.call(context_, error);
      }
    }, self.pluginName, 'once', [{
      'targetId': self.id,
      'eventType': eventType
    }]);
  });

};

module.exports = Query;
