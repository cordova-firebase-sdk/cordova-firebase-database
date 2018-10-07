


var utils = require('cordova/utils'),
  BaseClass = require('./BaseClass'),
  BaseArrayClass = require('./BaseArrayClass'),
  DataSnapshot = require('./DataSnapshot'),
  execCmd = require('./FirebaseDatabaseCommandQueue');

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
    value: this.hashCode + '_queryOrReference'
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



//---------------------------------------------------------------------------------
// Query.endAt
// https://firebase.google.com/docs/reference/js/firebase.database.Query#endAt
//---------------------------------------------------------------------------------
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
  }, this.pluginName, 'query_endAt', [{
    value: value,
    key: key,
    targetId: this.id,
    queryId: query.id
  }]);


  return query;
};





//---------------------------------------------------------------------------------
// Query.equalTo
// https://firebase.google.com/docs/reference/js/firebase.database.Query#limitToFirst
//---------------------------------------------------------------------------------
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
  }, this.pluginName, 'query_equalTo', [{
    value: value,
    key: key,
    targetId: this.id,
    queryId: query.id
  }]);


  return query;
};



//---------------------------------------------------------------------------------
// Query.isEqual
// https://firebase.google.com/docs/reference/js/firebase.database.Query#isEqual
//---------------------------------------------------------------------------------
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
  return thisRefPath === otherRefPathStr;
};



//---------------------------------------------------------------------------------
// Query.limitToFirst
// https://firebase.google.com/docs/reference/js/firebase.database.Query#limitToFirst
//---------------------------------------------------------------------------------
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
  }, this.pluginName, 'query_limitToFirst', [{
    limit: limit,
    targetId: this.id,
    queryId: query.id
  }]);


  return query;
};




//---------------------------------------------------------------------------------
// Query.limitToLast
// https://firebase.google.com/docs/reference/js/firebase.database.Query#limitToLast
//---------------------------------------------------------------------------------
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
  }, this.pluginName, 'query_limitToLast', [{
    limit: limit,
    targetId: this.id,
    queryId: query.id
  }]);


  return query;
};



//---------------------------------------------------------------------------------
// Query.off
// https://firebase.google.com/docs/reference/js/firebase.database.Query#on
//---------------------------------------------------------------------------------
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
  }, this.pluginName, 'query_off', [{
    targetId: this.id,
    listenerId: listenerId,
    eventType: eventType
  }]);

  this._off(eventType, callback);

};



//---------------------------------------------------------------------------------
// Query.on
// https://firebase.google.com/docs/reference/js/firebase.database.Query#on
//---------------------------------------------------------------------------------
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
  }, this.pluginName, 'query_on', [{
    targetId: this.id,
    listenerId: listenerId,
    eventType: eventType
  }]);

  return listener;


};



//---------------------------------------------------------------------------------
// Query.once
// https://firebase.google.com/docs/reference/js/firebase.database.Query#once
//---------------------------------------------------------------------------------
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
      resolve.call(context_, snapshot);
      if (typeof successCallback === 'function') {
        successCallback.call(context_, snapshot);
      }

    }, function(error) {
      reject.call(context_, error);
      if (typeof failureCallbackOrContext === 'function') {
        failureCallbackOrContext.call(context_, error);
      }
    }, self.pluginName, 'query_once', [{
      'targetId': self.id,
      'eventType': eventType
    }]);
  });

};



//---------------------------------------------------------------------------------
// Query.orderByChild
// https://firebase.google.com/docs/reference/js/firebase.database.Query#orderByChild
//---------------------------------------------------------------------------------
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
  }, this.pluginName, 'query_orderByChild', [{
    targetId: this.id,
    newId: query.id,
    path: path
  }]);

  return query;
};



//---------------------------------------------------------------------------------
// Query.orderByKey
// https://firebase.google.com/docs/reference/js/firebase.database.Query#orderByKey
//---------------------------------------------------------------------------------
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
  }, this.pluginName, 'query_orderByKey', [{
    targetId: this.id,
    newId: query.id
  }]);

  return query;
};



//---------------------------------------------------------------------------------
// Query.orderByPriority
// https://firebase.google.com/docs/reference/js/firebase.database.Query#orderByPriority
//---------------------------------------------------------------------------------
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
  }, this.pluginName, 'query_orderByPriority', [{
    targetId: this.id,
    newId: query.id
  }]);

  return query;
};



//---------------------------------------------------------------------------------
// Query.orderByValue
// https://firebase.google.com/docs/reference/js/firebase.database.Query#orderByValue
//---------------------------------------------------------------------------------
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
  }, this.pluginName, 'query_orderByValue', [{
    targetId: this.id,
    newId: query.id
  }]);

  return query;
};




//---------------------------------------------------------------------------------
// Query.startAt
// https://firebase.google.com/docs/reference/js/firebase.database.Query#startAt
//---------------------------------------------------------------------------------
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
  }, this.pluginName, 'query_startAt', [{
    value: value,
    key: key,
    targetId: this.id,
    queryId: query.id
  }]);


  return query;
};



//---------------------------------------------------------------------------------
// Query.toJSON
// https://firebase.google.com/docs/reference/js/firebase.database.Query#toJSON
//---------------------------------------------------------------------------------
Query.prototype.toJSON = function() {
  throw new Error('not implemented');
};


//---------------------------------------------------------------------------------
// Query.toString
// https://firebase.google.com/docs/reference/js/firebase.database.Query#toString
//---------------------------------------------------------------------------------
Query.prototype.toString = function() {
  return this.path;
};

module.exports = Query;
