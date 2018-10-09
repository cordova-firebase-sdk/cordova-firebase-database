


var utils = require('cordova/utils'),
  BaseClass = require('cordova-firebase-database.BaseClass'),
  LZString = require('cordova-firebase-database.LZString');

/****************************************************************************** *
 * @name FirebaseDatabasePlugin
 ******************************************************************************/
function FirebaseDatabasePlugin(id, database) {
  var self = this;
  BaseClass.apply(this);

  Object.defineProperty(self, 'id', {
    value: id
  });

  Object.defineProperty(self, 'database', {
    value: database
  });

  Object.defineProperty(window.plugin.firebase, '_isReady', {
    value: false,
    writable: true,
    enumerable: false
  });
}

utils.extend(FirebaseDatabasePlugin, BaseClass);


/******************************************
 * Methods for Database class
 *****************************************/

//---------------------------------------------------------------------------------
// Database.goOffline
// https://firebase.google.com/docs/reference/js/firebase.database.Database#goOffline
//---------------------------------------------------------------------------------
FirebaseDatabasePlugin.prototype.database_goOffline = function(onSuccess, onError) {
  console.log('[broswer] database.goOffline()');

  try {
    this.database.goOffline();
    onSuccess();
  } catch(e) {
    onError(e);
  }
};



//---------------------------------------------------------------------------------
// Database.goOnline
// https://firebase.google.com/docs/reference/js/firebase.database.Database#goOnline
//---------------------------------------------------------------------------------
FirebaseDatabasePlugin.prototype.database_goOnline = function(onSuccess, onError) {
  console.log('[broswer] database.goOnline()');

  try {
    this.database.goOnline();
    onSuccess();
  } catch(e) {
    onError(e);
  }
};



//---------------------------------------------------------------------------------
// Database.ref
// https://firebase.google.com/docs/reference/js/firebase.database.Database#ref
//---------------------------------------------------------------------------------
FirebaseDatabasePlugin.prototype.database_ref = function(onSuccess, onError, args) {
  var options = args[0];
  console.log('[broswer] database.ref()', options);

  var ref = this.database.ref(options.path);
  this.set(options.id, ref);
  onSuccess();
};



/******************************************
 * Methods for OnDisconnect class
 *****************************************/

//---------------------------------------------------------------------------------
// onDisconnect.cancel
// https://firebase.google.com/docs/reference/js/firebase.database.OnDisconnect#cancel
//---------------------------------------------------------------------------------
FirebaseDatabasePlugin.prototype.onDisconnect_cancel = function(onSuccess, onError, args) {
  var options = args[0];
  console.log('[broswer] onDisconnect.cancel()', options);

  var onDisconnect = this.get(options.targetId);
  onDisconnect.cancel().then(onSuccess).catch(onError);
};



//---------------------------------------------------------------------------------
// onDisconnect.remove
// https://firebase.google.com/docs/reference/js/firebase.database.OnDisconnect#remove
//---------------------------------------------------------------------------------
FirebaseDatabasePlugin.prototype.onDisconnect_remove = function(onSuccess, onError, args) {
  var options = args[0];
  console.log('[broswer] onDisconnect.remove()', options);

  var onDisconnect = this.get(options.targetId);
  onDisconnect.remove().then(onSuccess).catch(onError);
};



//---------------------------------------------------------------------------------
// onDisconnect.set
// https://firebase.google.com/docs/reference/js/firebase.database.OnDisconnect#set
//---------------------------------------------------------------------------------
FirebaseDatabasePlugin.prototype.onDisconnect_set = function(onSuccess, onError, args) {
  var options = args[0];
  console.log('[broswer] onDisconnect.set()', options);

  var onDisconnect = this.get(options.targetId);
  onDisconnect.set(JSON.parse(LZString.decompressFromBase64(options.value))).then(onSuccess).catch(onError);
};




//---------------------------------------------------------------------------------
// onDisconnect.setWithPriority
// https://firebase.google.com/docs/reference/js/firebase.database.OnDisconnect#setWithPriority
//---------------------------------------------------------------------------------
FirebaseDatabasePlugin.prototype.onDisconnect_setWithPriority = function(onSuccess, onError, args) {
  var options = args[0];
  console.log('[broswer] onDisconnect.setWithPriority()', options);

  var onDisconnect = this.get(options.targetId);
  onDisconnect.setWithPriority(JSON.parse(LZString.decompressFromBase64(options.value)), options.priority).then(onSuccess).catch(onError);
};



//---------------------------------------------------------------------------------
// onDisconnect.update
// https://firebase.google.com/docs/reference/js/firebase.database.OnDisconnect#update
//---------------------------------------------------------------------------------
FirebaseDatabasePlugin.prototype.onDisconnect_update = function(onSuccess, onError, args) {
  var options = args[0];
  console.log('[broswer] onDisconnect.update()', options);

  var onDisconnect = this.get(options.targetId);
  onDisconnect.update(JSON.parse(LZString.decompressFromBase64(options.values))).then(onSuccess).catch(onError);
};



/*******************************************************************************
 * Methods for Reference class
 ******************************************************************************/

//---------------------------------------------------------------------------------
// Reference.child
// https://firebase.google.com/docs/reference/js/firebase.database.Reference#child
//---------------------------------------------------------------------------------
FirebaseDatabasePlugin.prototype.reference_child = function(onSuccess, onError, args) {
  var options = args[0];
  console.log('[broswer] reference.child()', options);

  var ref = this.get(options.targetId);
  var childRef = ref.child(options.path);
  this.set(options.childId, childRef);
  onSuccess({
    key: childRef.key,
    url: childRef.toString()
  });
};



//---------------------------------------------------------------------------------
// Reference.onDisconnect
// https://firebase.google.com/docs/reference/js/firebase.database.Reference#onDisconnect
//---------------------------------------------------------------------------------
FirebaseDatabasePlugin.prototype.reference_onDisconnect = function(onSuccess, onError, args) {
  var options = args[0];
  console.log('[broswer] reference.onDisconnect()', options);

  var ref = this.get(options.targetId);
  var onDisconnect = ref.onDisconnect();
  this.set(options.onDisconnectId, onDisconnect);
  onSuccess();
};



//---------------------------------------------------------------------------------
// Reference.push
// https://firebase.google.com/docs/reference/js/firebase.database.Reference#push
//---------------------------------------------------------------------------------
FirebaseDatabasePlugin.prototype.reference_push = function(onSuccess, onError, args) {
  var options = args[0];
  console.log('[broswer] reference.push()', options);

  var ref = this.get(options.targetId);
  var thenableRef;
  if (options.value) {
    thenableRef = ref.push(JSON.parse(LZString.decompressFromBase64(options.value)));
  } else {
    thenableRef = ref.push();
  }
  this.set(options.newId, thenableRef);
  thenableRef.then(function() {
    onSuccess({
      key: thenableRef.key,
      url: thenableRef.toString()
    });
  }).catch(onError);
};



//---------------------------------------------------------------------------------
// Reference.remove
// https://firebase.google.com/docs/reference/js/firebase.database.Reference#remove
//---------------------------------------------------------------------------------
FirebaseDatabasePlugin.prototype.reference_remove = function(onSuccess, onError, args) {
  var options = args[0],
    self = this;
  console.log('[broswer] reference.remove()', options);

  var ref = this.get(options.targetId);
  ref.remove().then(function() {
    self.delete(options.targetId);
    onSuccess();
  }).catch(onError);
};



//---------------------------------------------------------------------------------
// Reference.set
// https://firebase.google.com/docs/reference/js/firebase.database.Reference#set
//---------------------------------------------------------------------------------
FirebaseDatabasePlugin.prototype.reference_set = function(onSuccess, onError, args) {
  var options = args[0];
  console.log('[broswer] reference.set()', options);
  var ref = this.get(options.targetId);
  ref.set(JSON.parse(LZString.decompressFromBase64(options.data)))
      .then(onSuccess).catch(onError);
};



//---------------------------------------------------------------------------------
// Reference.setPriority
// https://firebase.google.com/docs/reference/js/firebase.database.Reference#setPriority
//---------------------------------------------------------------------------------
FirebaseDatabasePlugin.prototype.reference_setPriority = function(onSuccess, onError, args) {
  var options = args[0];
  console.log('[broswer] reference.setPriority()', options);
  var ref = this.get(options.targetId);
  ref.setPriority(JSON.parse(LZString.decompressFromBase64(options.priority)))
    .then(onSuccess)
    .catch(onError);
};



//---------------------------------------------------------------------------------
// Reference.setWithPriority
// https://firebase.google.com/docs/reference/js/firebase.database.Reference#setWithPriority
//---------------------------------------------------------------------------------
FirebaseDatabasePlugin.prototype.reference_setWithPriority = function(onSuccess, onError, args) {
  var options = args[0];
  console.log('[broswer] reference.setWithPriority()', options);
  var ref = this.get(options.targetId);
  ref.setWithPriority(JSON.parse(LZString.decompressFromBase64(options.data)), JSON.parse(LZString.decompressFromBase64(options.priority)))
    .then(onSuccess)
    .catch(onError);
};



//---------------------------------------------------------------------------------
// Reference.transaction
// https://firebase.google.com/docs/reference/js/firebase.database.Reference#transaction
//---------------------------------------------------------------------------------
FirebaseDatabasePlugin.prototype.reference_transaction = function(onSuccess, onError, args) {
  var options = args[0],
    self = this;
  console.log('[broswer] reference.transaction()', options);
  var ref = this.get(options.targetId);

  (new Promise(function(resolve) {
    var prevValue;
    var timer = setInterval(function() {
      ref.once('value').then(function(value) {
        prevValue = value;

        ref.transaction(function(currentValue) {
          if (JSON.stringify(prevValue) === JSON.stringify(currentValue)) {
            clearInterval(timer);
            self._one(options.transactionId + '_callback', function(newValue) {
              resolve(JSON.parse(LZString.decompressFromBase64(newValue)));
            });
            cordova.fireDocumentEvent(options.eventName, [LZString.compressToBase64(JSON.stringify(currentValue))]);
          }
          return; // abort this transaction
        }).then(function() {
          // ignore
        }).catch(function() {
          // ignore
        });
      });
    }, 100);
  }))
  .then(function(newValues) {
    ref.transaction(function() {
      return newValues;
    },
    function(error, committed, snapshot) {
      if (error) {
        onError(error);
        return;
      }

      onSuccess({
        committed: committed,
        snapshot: {
          key: snapshot.key,
          exists: snapshot.exists(),
          exportVal: LZString.compressToBase64(JSON.stringify(snapshot.exportVal())),
          getPriority: snapshot.getPriority(),
          numChildren: snapshot.numChildren(),
          val: LZString.compressToBase64(JSON.stringify(snapshot.val()))
        }
      });

    }, options.applyLocally);
  });
};

FirebaseDatabasePlugin.prototype.reference_onTransactionCallback = function(onSuccess, onError, args) {
  var transactionId = args[0],
    values = args[1];
  console.log('[broswer] reference.reference_onTransactionCallback()');

console.log(args[0], args[1]);
  this._trigger(transactionId + '_callback', values);
  onSuccess();
};



//---------------------------------------------------------------------------------
// Reference.update
// https://firebase.google.com/docs/reference/js/firebase.database.Reference#update
//---------------------------------------------------------------------------------
FirebaseDatabasePlugin.prototype.reference_update = function(onSuccess, onError, args) {
  var options = args[0];
  console.log('[broswer] reference.update()', options);

  var ref = this.get(options.targetId);
  ref.update(JSON.parse(LZString.decompressFromBase64(options.data)))
      .then(onSuccess)
      .catch(onError);
};










/*******************************************************************************
 * Methods for Query class
 ******************************************************************************/

//---------------------------------------------------------------------------------
// Query.endAt
// https://firebase.google.com/docs/reference/js/firebase.database.Query#endAt
//---------------------------------------------------------------------------------
FirebaseDatabasePlugin.prototype.query_endAt = function(onSuccess, onError, args) {
  var options = args[0];
  console.log('[broswer] query.endAt()', options);

  var ref = this.get(options.refId);
  var query = ref.endAt(JSON.parse(LZString.decompressFromBase64(options.value)), options.key);
  this.set(options.queryId, query);

  onSuccess();
};



//---------------------------------------------------------------------------------
// Query.equalTo
// https://firebase.google.com/docs/reference/js/firebase.database.Query#limitToFirst
//---------------------------------------------------------------------------------
FirebaseDatabasePlugin.prototype.query_equalTo = function(onSuccess, onError, args) {
  var options = args[0];
  console.log('[broswer] query.equalTo()', options);

  var ref = this.get(options.refId);
  var query = ref.equalTo(JSON.parse(LZString.decompressFromBase64(options.value)), options.key);
  this.set(options.queryId, query);

  onSuccess();
};



//---------------------------------------------------------------------------------
// Query.limitToFirst
// https://firebase.google.com/docs/reference/js/firebase.database.Query#limitToFirst
//---------------------------------------------------------------------------------
FirebaseDatabasePlugin.prototype.query_limitToFirst = function(onSuccess, onError, args) {
  var options = args[0];
  console.log('[broswer] query.limitToFirst()', options);

  var ref = this.get(options.refId);
  var query = ref.limitToFirst(options.limit);
  this.set(options.queryId, query);

  onSuccess();
};



//---------------------------------------------------------------------------------
// Query.limitToLast
// https://firebase.google.com/docs/reference/js/firebase.database.Query#limitToLast
//---------------------------------------------------------------------------------
FirebaseDatabasePlugin.prototype.query_limitToLast = function(onSuccess, onError, args) {
  var options = args[0];
  console.log('[broswer] query.limitToLast()', options);

  var ref = this.get(options.refId);
  var query = ref.limitToLast(options.limit);
  this.set(options.queryId, query);

  onSuccess();
};



//---------------------------------------------------------------------------------
// Query.off
// https://firebase.google.com/docs/reference/js/firebase.database.Query#off
//---------------------------------------------------------------------------------
FirebaseDatabasePlugin.prototype.query_off = function(onSuccess, onError, args) {
  var self = this,
    options = args[0];
  console.log('[broswer] query.off()', options);

  var referenceOrQuery = self.get(options.targetId);
  var listener;
  if (options.listenerId) {
    listener = self.get(options.listenerId);
  }

  referenceOrQuery.off(options.eventType, listener);

  self.delete(options.listenerId);

};



//---------------------------------------------------------------------------------
// Query.on
// https://firebase.google.com/docs/reference/js/firebase.database.Query#on
//---------------------------------------------------------------------------------
FirebaseDatabasePlugin.prototype.query_on = function(onSuccess, onError, args) {
  var self = this,
    options = args[0];
  console.log('[broswer] query.on()', options);

  var referenceOrQuery = this.get(options.targetId);
  var listener = referenceOrQuery.on(options.eventType, function(snapshot, key) {
    var values = {
      key: snapshot.key,
      exists: snapshot.exists(),
      exportVal: LZString.compressToBase64(JSON.stringify(snapshot.exportVal())),
      getPriority: snapshot.getPriority(),
      numChildren: snapshot.numChildren(),
      val: LZString.compressToBase64(JSON.stringify(snapshot.val()))
    };

    window.plugin.firebase.database._nativeCallback(self.id, options.targetId, options.eventType, values, key);

  });

  this.set(options.listenerId, listener);
  onSuccess();
};



//---------------------------------------------------------------------------------
// Query.once
// https://firebase.google.com/docs/reference/js/firebase.database.Query#once
//---------------------------------------------------------------------------------
FirebaseDatabasePlugin.prototype.query_once = function(onSuccess, onError, args) {
  var options = args[0];
  console.log('[broswer] query.once()', options);

  var referenceOrQuery = this.get(options.targetId);
  referenceOrQuery.once(options.eventType)
    .then(function(snapshot) {
      onSuccess({
        key: snapshot.key,
        exists: snapshot.exists(),
        exportVal: LZString.compressToBase64(JSON.stringify(snapshot.exportVal())),
        getPriority: snapshot.getPriority(),
        numChildren: snapshot.numChildren(),
        val: LZString.compressToBase64(JSON.stringify(snapshot.val()))
      });
    })
    .catch(onError);
};



//---------------------------------------------------------------------------------
// Query.orderByChild
// https://firebase.google.com/docs/reference/js/firebase.database.Query#orderByChild
//---------------------------------------------------------------------------------
FirebaseDatabasePlugin.prototype.query_orderByChild = function(onSuccess, onError, args) {
  var self = this,
    options = args[0];
  console.log('[broswer] query.orderByChild()', options);

  var referenceOrQuery = this.get(options.targetId);
  try {
    var newQuery = referenceOrQuery.orderByChild(options.path);
    self.set(options.queryId, newQuery);
    onSuccess();
  } catch (e) {
    onError(e);
  }
};



//---------------------------------------------------------------------------------
// Query.orderByKey
// https://firebase.google.com/docs/reference/js/firebase.database.Query#orderByKey
//---------------------------------------------------------------------------------
FirebaseDatabasePlugin.prototype.query_orderByKey = function(onSuccess, onError, args) {
  var self = this,
    options = args[0];
  console.log('[broswer] query.orderByKey()', options);

  var referenceOrQuery = this.get(options.targetId);
  try {
    var newQuery = referenceOrQuery.orderByKey();
    self.set(options.queryId, newQuery);
    onSuccess();
  } catch (e) {
    onError(e);
  }
};



//---------------------------------------------------------------------------------
// Query.orderByPriority
// https://firebase.google.com/docs/reference/js/firebase.database.Query#orderByValue
//---------------------------------------------------------------------------------
FirebaseDatabasePlugin.prototype.query_orderByPriority = function(onSuccess, onError, args) {
  var self = this,
    options = args[0];
  console.log('[broswer] query.orderByPriority()', options);

  var referenceOrQuery = this.get(options.targetId);
  try {
    var newQuery = referenceOrQuery.orderByPriority();
    self.set(options.queryId, newQuery);
    onSuccess();
  } catch (e) {
    onError(e);
  }
};



//---------------------------------------------------------------------------------
// Query.orderByValue
// https://firebase.google.com/docs/reference/js/firebase.database.Query#orderByValue
//---------------------------------------------------------------------------------
FirebaseDatabasePlugin.prototype.query_orderByValue = function(onSuccess, onError, args) {
  var self = this,
    options = args[0];
  console.log('[broswer] query.orderByValue()', options);

  var referenceOrQuery = this.get(options.targetId);
  try {
    var newQuery = referenceOrQuery.orderByValue();
    self.set(options.queryId, newQuery);
    onSuccess();
  } catch (e) {
    onError(e);
  }
};



//---------------------------------------------------------------------------------
// Query.startAt
// https://firebase.google.com/docs/reference/js/firebase.database.Query#startAt
//---------------------------------------------------------------------------------
FirebaseDatabasePlugin.prototype.query_startAt = function(onSuccess, onError, args) {
  var options = args[0];
  console.log('[broswer] query.startAt()', options);

  var ref = this.get(options.refId);
  var query = ref.startAt(JSON.parse(LZString.decompressFromBase64(options.value)), options.key);
  this.set(options.queryId, query);

  onSuccess();
};


module.exports = FirebaseDatabasePlugin;
