


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

  window.plugin.firebase.database._DBs[pluginName].set(this.hashCode, this);

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
  this._cmdQueue._trigger('insert_at');
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
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(error);
    }
  }, this.pluginName, 'endAt', [{
    value: value,
    key: key,
    targetId: this.id,
    queryId: query.id
  }]);


  return query;
};

Query.prototype.equalTo = function(value, key) {
  var self = this;

  var query = new Query(this, value, key);
  this._exec(function() {
    query._privateInit();
  }, function(error) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(error);
    }
  }, this.pluginName, 'equalTo', [{
    value: value,
    key: key,
    targetId: this.id,
    queryId: query.id
  }]);


  return query;
};

Query.prototype.isEqual = function(other) {
  var thisRefPath = [];
  var target = this;
  while(target !== null && target.ref) {
    thisRefPath.unshift(target.key);
    target = target.ref;
  }

  var otherRefPath = [];
  target = other;
  while(target !== null && target.ref) {
    otherRefPath.unshift(target.key);
    target = target.ref;
  }

  var thisRefPathStr = thisRefPath.join('/');
  var otherRefPathStr = otherRefPath.join('/');
  console.log(thisRefPathStr, otherRefPathStr);
  return thisRefPath === otherRefPathStr;
};

Query.prototype.limitToFirst = function(limit) {
  var self = this;
  limit = Math.min(limit, 100);

  var query = new Query(this, value, key);
  this._exec(function() {
    query._privateInit();
  }, function(error) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(error);
    }
  }, this.pluginName, 'limitToFirst', [{
    limit: limit,
    targetId: this.id,
    queryId: query.id
  }]);


  return query;
};

Query.prototype.limitToLast = function(limit) {
  var self = this;
  limit = Math.min(limit, 100);

  var query = new Query(this, value, key);
  this._exec(function() {
    query._privateInit();
  }, function(error) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(error);
    }
  }, this.pluginName, 'limitToLast', [{
    limit: limit,
    targetId: this.id,
    queryId: query.id
  }]);


  return query;
};

Query.prototype.set = function(values) {
  console.log('[js]reference.set()', values, this.refId);
  var self = this;
  return new Promise(function(resolve, reject) {
    self._exec(resolve.bind(self), reject.bind(self), self.pluginName, 'setValue', [{
      targetId: self.id,
      data: values
    }]);
  });
};

Query.prototype.orderByChild = function(path) {
  var self = this;

  var query = new Query(this.pluginName, path);
  this._exec(function() {
    query._privateInit();
  }, function(error) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(error);
    }
  }, this.pluginName, 'orderByChild', [{
    targetId: this.id,
    newId: query.id,
    path: path
  }]);

  return query;
};

Query.prototype.orderByKey = function(path) {
  var self = this;

  var query = new Query(this.pluginName, path);
  this._exec(function() {
    query._privateInit();
  }, function(error) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(error);
    }
  }, this.pluginName, 'orderByKey', [{
    targetId: this.id,
    newId: query.id
  }]);

  return query;
};

Query.prototype.orderByPriority = function(path) {
  var self = this;

  var query = new Query(this.pluginName, path);
  this._exec(function() {
    query._privateInit();
  }, function(error) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(error);
    }
  }, this.pluginName, 'orderByPriority', [{
    targetId: this.id,
    newId: query.id
  }]);

  return query;
};

Query.prototype.orderByValue = function(path) {
  var self = this;

  var query = new Query(this.pluginName, path);
  this._exec(function() {
    query._privateInit();
  }, function(error) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(error);
    }
  }, this.pluginName, 'orderByValue', [{
    targetId: this.id,
    newId: query.id
  }]);

  return query;
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

  console.log('[js] Query.once');

  return new Promise(function(resolve, reject) {
    self._exec(function(result) {

      var snapshot = new DataSnapshot(self, result);
      console.log(result);
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

Query.prototype.on = function(eventType, callback, cancelCallbackOrContext, context) {
  var self = this;
  var context_ = this;
  if (arguments.length === 4) {
    context_ = context;
  } else if (arguments.length === 3) {
    context_ = failureCallbackOrContext;
  }

  var listener = function(result, key) {

    var snapshot = new DataSnapshot(self, result);
    if (typeof callback === 'function') {
      var args = [snapshot];
      if (key) {
        args.push(key);
      }
      callback.apply(context_, args);
    }
  };
  var listenerId = this.id + '_on' + Math.floor(Date.now() * Math.random());
  Object.defineProperty(listener, '_hashCode', {
    value: listenerId,
    enumerable: false
  });

  this._on(eventType, listener);

  this._exec(null, function(error) {
    if (typeof failureCallbackOrContext === 'function') {
      failureCallbackOrContext.call(context_, new Error(error));
    } else {
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error(error);
      }
    }
  }, this.pluginName, 'on', [{
    targetId: this.id,
    listenerId: listenerId,
    eventType: eventType
  }]);

  return listener;


};

Query.prototype.off = function(eventType, callback) {
  var self = this;

  var listenerId;
  if (callback) {
    listenerId = callback._hashCode;
    if (!listenerId) {
      throw new Error('Specified callback is not registered.');
    }
  }


  this._exec(null, function(error) {
    throw new Error(error);
  }, this.pluginName, 'off', [{
    targetId: this.id,
    listenerId: listenerId,
    eventType: eventType
  }]);

  this._off(eventType, callback);

};

Query.prototype.startAt = function(value, key) {
  var self = this;

  var query = new Query(this, value, key);
  this._exec(function() {
    query._privateInit();
  }, function(error) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(error);
    }
  }, this.pluginName, 'startAt', [{
    value: value,
    key: key,
    targetId: this.id,
    queryId: query.id
  }]);


  return query;
};

module.exports = Query;
