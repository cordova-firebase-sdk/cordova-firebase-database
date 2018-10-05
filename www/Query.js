

var VARS_FIELD = typeof Symbol === 'undefined' ? '__vars' + Date.now() : Symbol('vars');
var SUBSCRIPTIONS_FIELD = typeof Symbol === 'undefined' ? '__subs' + Date.now() : Symbol('subscriptions');

var utils = require('cordova/utils'),
  BaseClass = require('./BaseClass'),
  BaseArrayClass = require('./BaseArrayClass'),
  execCmd = require('./commandQueueExecutor');

/*******************************************************************************
 * @name Query
 ******************************************************************************/
function Query(ref, value, key) {
  var self = this,
    cmdQueue = new BaseArrayClass();
  BaseClass.apply(this);

  Object.defineProperty(self, 'ref', {
    value: ref
  });

  Object.defineProperty(self, 'queryId', {
    value: this.hashCode + '_query'
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

Query.prototype.on = function(eventName, callback) {
};

module.exports = Query;
