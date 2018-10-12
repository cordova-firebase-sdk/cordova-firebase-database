


var utils = require('cordova/utils'),
  BaseClass = require('cordova-firebase-core.BaseClass'),
  BaseArrayClass = require('cordova-firebase-core.BaseArrayClass'),
  DataSnapshot = require('./DataSnapshot'),
  LZString = require('cordova-firebase-core.LZString'),
  execCmd = require('./FirebaseDatabaseCommandQueue');

/*******************************************************************************
 * @name Query
 ******************************************************************************/
function Query(params) {
  var self = this,
    cmdQueue = new BaseArrayClass();
  BaseClass.apply(this);
  window.plugin.firebase.database._DBs[params.pluginName].set(this.hashCode, this);

  Object.defineProperty(self, 'pluginName', {
    value: params.pluginName
  });

  Object.defineProperty(self, 'ref', {
    value: params.ref
  });

  Object.defineProperty(self, 'id', {
    value: this.hashCode + '_queryOrReference'
  });

  Object.defineProperty(self, '_isReady', {
    value: false,
    writable: true,
    enumerable: false
  });

  Object.defineProperty(self, 'url', {
    value: params.url,
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

  self._on('nativeEvent', function(params) {
    self._trigger(params.listenerId, params);
  });
}

utils.extend(Query, BaseClass);



//---------------------------------------------------------------------------------
// Internal methods. Don't use it from your code
//---------------------------------------------------------------------------------
Object.defineProperty(Query.prototype, '_privateInit', {
  value: function() {
    this._isReady = true;
    this._cmdQueue._trigger('insert_at');
  },
  writable: false,
  enumerable: false
});

Object.defineProperty(Query.prototype, '_exec', {
  value: function() {
    this._cmdQueue.push.call(this._cmdQueue, {
      target: this,
      args: Array.prototype.slice.call(arguments, 0)
    });
  },
  writable: false,
  enumerable: false
});



//---------------------------------------------------------------------------------
// Query.endAt
// https://firebase.google.com/docs/reference/js/firebase.database.Query#endAt
//---------------------------------------------------------------------------------
Query.prototype.endAt = function(value, key) {
  var self = this;

  var query = new Query({
    pluginName: self.pluginName,
    ref: self,
    url: self.url
  });
  self._on('nativeEvent', function(params) {
    query._trigger('nativeEvent', params);
  });
  self._exec(function(results) {
    query._privateInit(results);
  }, function(error) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(error);
    }
  }, self.pluginName, 'query_endAt', [{
    value: LZString.compressToBase64(JSON.stringify(value)),
    key: key,
    targetId: self.id,
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

  var query = new Query({
    pluginName: self.pluginName,
    ref: self,
    url: self.url
  });
  self._on('nativeEvent', function(params) {
    query._trigger('nativeEvent', params);
  });
  self._exec(function(results) {
    query._privateInit(results);
  }, function(error) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(error);
    }
  }, self.pluginName, 'query_equalTo', [{
    value: LZString.compressToBase64(JSON.stringify(value)),
    key: key,
    targetId: self.id,
    queryId: query.id
  }]);


  return query;
};



//---------------------------------------------------------------------------------
// Query.isEqual
// https://firebase.google.com/docs/reference/js/firebase.database.Query#isEqual
//---------------------------------------------------------------------------------
Query.prototype.isEqual = function(other) {
  return this.toString() === other.toString();
};



//---------------------------------------------------------------------------------
// Query.limitToFirst
// https://firebase.google.com/docs/reference/js/firebase.database.Query#limitToFirst
//---------------------------------------------------------------------------------
Query.prototype.limitToFirst = function(limit) {
  var self = this;
  limit = Math.min(limit, 100);

  var query = new Query({
    pluginName: self.pluginName,
    ref: self,
    url: self.url
  });
  self._on('nativeEvent', function(params) {
    query._trigger('nativeEvent', params);
  });
  self._exec(function(results) {
    query._privateInit(results);
  }, function(error) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(error);
    }
  }, self.pluginName, 'query_limitToFirst', [{
    limit: limit,
    targetId: self.id,
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

  var query = new Query({
    pluginName: self.pluginName,
    ref: self,
    url: self.url
  });
  self._on('nativeEvent', function(params) {
    query._trigger('nativeEvent', params);
  });
  self._exec(function(results) {
    query._privateInit(results);
  }, function(error) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(error);
    }
  }, self.pluginName, 'query_limitToLast', [{
    limit: limit,
    targetId: self.id,
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


  self._exec(null, function(error) {
    throw new Error(error);
  }, self.pluginName, 'query_off', [{
    targetId: self.id,
    listenerId: listenerId,
    eventType: eventType
  }]);

  var listeners = this._off(listenerId, callback);
  console.log('listeners', listeners);

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
    context_ = cancelCallbackOrContext;
  }

  eventType = eventType || '';
  eventType = eventType.toLowerCase();
  if (['value','child_added', 'child_moved', 'child_removed', 'child_changed'].indexOf(eventType) === -1) {
    var error = 'eventType must be one of \'value\',\'child_added\', \'child_moved\', \'child_removed\', or \'child_changed\'.';
    throw new Error(error);
  }

  var listener = function(result) {
    console.log(result);

    var snapshot = new DataSnapshot(self, result.snapshot);
    if (typeof callback === 'function') {
      var args = [snapshot];
      if (result.key) {
        args.push(result.key);
      }
      callback.apply(context_, args);
    }

  };
  var listenerId = self.id + '_' + eventType.toLowerCase() + Math.floor(Date.now() * Math.random());
  Object.defineProperty(listener, '_hashCode', {
    value: listenerId,
    enumerable: false
  });
  Object.defineProperty(listener, '_cancelCallback', {
    value: function() {

    },
    enumerable: false
  });

  console.log('--->on:' + listenerId);

  self._on(listenerId, function(params) {
    listener(params.values, params.key);
  });

  self._exec(null, function(error) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(error);
    }
  }, self.pluginName, 'query_on', [{
    targetId: self.id,
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
  console.log('--->once');

  return new Promise(function(resolve, reject) {
    try {
      var listener = self.on.call(self, eventType, function(snapshot, key) {
        self.off(listener);

        var args = [snapshot];
        if (key) {
          args.push(key);
        }
        resolve.apply(context_, args);
        if (typeof successCallback === 'function') {
          successCallback.apply(context_, args);
        }
      }, function() {
        console.log('cancelled');
        // cancelled
        self.off(listener);
      });
      console.log('--->once -> on');

    } catch(e) {
      reject(e);
    }

  });

};



//---------------------------------------------------------------------------------
// Query.orderByChild
// https://firebase.google.com/docs/reference/js/firebase.database.Query#orderByChild
//---------------------------------------------------------------------------------
Query.prototype.orderByChild = function(path) {
  var self = this;

  var query = new Query({
    pluginName: self.pluginName,
    ref: self,
    url: self.url
  });
  self._on('nativeEvent', function(params) {
    query._trigger('nativeEvent', params);
  });
  self._exec(function(results) {
    query._privateInit(results);
  }, function(error) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(error);
    }
  }, self.pluginName, 'query_orderByChild', [{
    targetId: self.id,
    queryId: query.id,
    path: path
  }]);

  return query;
};



//---------------------------------------------------------------------------------
// Query.orderByKey
// https://firebase.google.com/docs/reference/js/firebase.database.Query#orderByKey
//---------------------------------------------------------------------------------
Query.prototype.orderByKey = function() {
  var self = this;

  var query = new Query({
    pluginName: self.pluginName,
    ref: self,
    url: self.url
  });
  self._on('nativeEvent', function(params) {
    query._trigger('nativeEvent', params);
  });
  self._exec(function(results) {
    query._privateInit(results);
  }, function(error) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(error);
    }
  }, self.pluginName, 'query_orderByKey', [{
    targetId: self.id,
    queryId: query.id
  }]);

  return query;
};



//---------------------------------------------------------------------------------
// Query.orderByPriority
// https://firebase.google.com/docs/reference/js/firebase.database.Query#orderByPriority
//---------------------------------------------------------------------------------
Query.prototype.orderByPriority = function() {
  var self = this;

  var query = new Query({
    pluginName: self.pluginName,
    ref: self,
    url: self.url
  });
  self._on('nativeEvent', function(params) {
    query._trigger('nativeEvent', params);
  });
  self._exec(function(results) {
    query._privateInit(results);
  }, function(error) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(error);
    }
  }, self.pluginName, 'query_orderByPriority', [{
    targetId: self.id,
    queryId: query.id
  }]);

  return query;
};



//---------------------------------------------------------------------------------
// Query.orderByValue
// https://firebase.google.com/docs/reference/js/firebase.database.Query#orderByValue
//---------------------------------------------------------------------------------
Query.prototype.orderByValue = function() {
  var self = this;

  var query = new Query({
    pluginName: self.pluginName,
    ref: self,
    url: self.url
  });
  self._on('nativeEvent', function(params) {
    query._trigger('nativeEvent', params);
  });
  self._exec(function(results) {
    query._privateInit(results);
  }, function(error) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(error);
    }
  }, self.pluginName, 'query_orderByValue', [{
    targetId: self.id,
    queryId: query.id
  }]);

  return query;
};




//---------------------------------------------------------------------------------
// Query.startAt
// https://firebase.google.com/docs/reference/js/firebase.database.Query#startAt
//---------------------------------------------------------------------------------
Query.prototype.startAt = function(value, key) {
  var self = this;

  var query = new Query({
    pluginName: self.pluginName,
    ref: self,
    url: self.url
  });
  self._on('nativeEvent', function(params) {
    query._trigger('nativeEvent', params);
  });
  self._exec(function(results) {
    query._privateInit(results);
  }, function(error) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(error);
    }
  }, self.pluginName, 'query_startAt', [{
    value: LZString.compressToBase64(JSON.stringify(value)),
    key: key,
    targetId: self.id,
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
  return this.url || null;
};

module.exports = Query;
