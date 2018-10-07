


var VARS_FIELD = typeof Symbol === 'undefined' ? '__vars' + Date.now() : Symbol('vars');
var SUBSCRIPTIONS_FIELD = typeof Symbol === 'undefined' ? '__subs' + Date.now() : Symbol('subscriptions');

var utils = require('cordova/utils'),
    BaseClass = require('cordova-firebase-database.BaseClass'),
    LZString = require('cordova-firebase-database.LZString');

/****************************************************************************** *
 * @name Database
 ******************************************************************************/
function Database(id, database) {
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

utils.extend(Database, BaseClass);


/******************************************
 * Methods for Database class
 *****************************************/

//---------------------------------------------------------------------------------
// Database.goOffline
// https://firebase.google.com/docs/reference/js/firebase.database.Database#goOffline
//---------------------------------------------------------------------------------
Database.prototype.database_goOffline = function(onSuccess, onError, args) {
  console.log('[broswer] database.goOffline()');

  this.database.goOffline();
  onSuccess();
};



//---------------------------------------------------------------------------------
// Database.goOnline
// https://firebase.google.com/docs/reference/js/firebase.database.Database#goOnline
//---------------------------------------------------------------------------------
Database.prototype.database_goOnline = function(onSuccess, onError, args) {
  console.log('[broswer] database.goOnline()');

  this.database.goOnline();
  onSuccess();
};



//---------------------------------------------------------------------------------
// Database.ref
// https://firebase.google.com/docs/reference/js/firebase.database.Database#ref
//---------------------------------------------------------------------------------
Database.prototype.database_ref = function(onSuccess, onError, args) {
  var options = args[0];
  console.log('[broswer] database.ref()', options);

  var ref = this.database.ref(options.path);
  this.set(options.id, ref);
  onSuccess({
    key: ref.key,
    url: ref.toString()
  });
};



/******************************************
 * Methods for OnDisconnect class
 *****************************************/

//---------------------------------------------------------------------------------
// onDisconnect.cancel
// https://firebase.google.com/docs/reference/js/firebase.database.OnDisconnect#cancel
//---------------------------------------------------------------------------------
Database.prototype.onDisconnect_cancel = function(onSuccess, onError, args) {
  var options = args[0];
  console.log('[broswer] onDisconnect.cancel()', options);

  var onDisconnect = this.get(options.targetId);
  onDisconnect.cancel().then(onSuccess).catch(onError);
};



//---------------------------------------------------------------------------------
// onDisconnect.remove
// https://firebase.google.com/docs/reference/js/firebase.database.OnDisconnect#remove
//---------------------------------------------------------------------------------
Database.prototype.onDisconnect_remove = function(onSuccess, onError, args) {
  var options = args[0];
  console.log('[broswer] onDisconnect.remove()', options);

  var onDisconnect = this.get(options.targetId);
  onDisconnect.remove().then(onSuccess).catch(onError);
};



//---------------------------------------------------------------------------------
// onDisconnect.set
// https://firebase.google.com/docs/reference/js/firebase.database.OnDisconnect#set
//---------------------------------------------------------------------------------
Database.prototype.onDisconnect_set = function(onSuccess, onError, args) {
  var options = args[0];
  console.log('[broswer] onDisconnect.set()', options);

  var onDisconnect = this.get(options.targetId);
  onDisconnect.set(JSON.parse(LZString.decompress(options.value))).then(onSuccess).catch(onError);
};




//---------------------------------------------------------------------------------
// onDisconnect.setWithPriority
// https://firebase.google.com/docs/reference/js/firebase.database.OnDisconnect#set
//---------------------------------------------------------------------------------
Database.prototype.onDisconnect_setWithPriority = function(onSuccess, onError, args) {
  var options = args[0];
  console.log('[broswer] onDisconnect.setWithPriority()', options);

  var onDisconnect = this.get(options.targetId);
  onDisconnect.setWithPriority(JSON.parse(LZString.decompress(options.value)), options.priority).then(onSuccess).catch(onError);
};



//---------------------------------------------------------------------------------
// onDisconnect.update
// https://firebase.google.com/docs/reference/js/firebase.database.OnDisconnect#set
//---------------------------------------------------------------------------------
Database.prototype.onDisconnect_update = function(onSuccess, onError, args) {
  var options = args[0];
  console.log('[broswer] onDisconnect.update()', options);

  var onDisconnect = this.get(options.targetId);
  onDisconnect.update(JSON.parse(LZString.decompress(options.values))).then(onSuccess).catch(onError);
};



/*******************************************************************************
 * Methods for Reference class
 ******************************************************************************/

//---------------------------------------------------------------------------------
// Reference.child
// https://firebase.google.com/docs/reference/js/firebase.database.Reference#child
//---------------------------------------------------------------------------------
Database.prototype.reference_child = function(onSuccess, onError, args) {
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
// https://firebase.google.com/docs/reference/js/firebase.database.Reference#remove
//---------------------------------------------------------------------------------
Database.prototype.reference_onDisconnect = function(onSuccess, onError, args) {
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
Database.prototype.reference_push = function(onSuccess, onError, args) {
  var options = args[0];
  console.log('[broswer] reference.push()', options);

  var ref = this.get(options.targetId);
  var thenableRef;
  if (options.value) {
   thenableRef = ref.push(JSON.parse(LZString.decompress(options.value)));
  } else {
   thenableRef = ref.push();
  }
  this.set(options.newId, thenableRef);
  thenableRef.then(function(res) {
    console.log(res);
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
Database.prototype.reference_remove = function(onSuccess, onError, args) {
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
Database.prototype.reference_set = function(onSuccess, onError, args) {
  var options = args[0];
  console.log('[broswer] reference.set()', options);
  var ref = this.get(options.targetId);
  ref.set(JSON.parse(LZString.decompress(options.data)))
      .then(onSuccess).catch(onError);
};



//---------------------------------------------------------------------------------
// Reference.setPriority
// https://firebase.google.com/docs/reference/js/firebase.database.Reference#setPriority
//---------------------------------------------------------------------------------
Database.prototype.reference_setPriority = function(onSuccess, onError, args) {
  var options = args[0];
  console.log('[broswer] reference.setPriority()', options);
  var ref = this.get(options.targetId);
  ref.setPriority(JSON.parse(LZString.decompress(options.priority)))
    .then(onSuccess)
    .catch(onError);
};



//---------------------------------------------------------------------------------
// Reference.setWithPriority
// https://firebase.google.com/docs/reference/js/firebase.database.Reference#setWithPriority
//---------------------------------------------------------------------------------
Database.prototype.reference_setWithPriority = function(onSuccess, onError, args) {
  var options = args[0];
  console.log('[broswer] reference.setWithPriority()', options);
  var ref = this.get(options.targetId);
  ref.setWithPriority(JSON.parse(LZString.decompress(options.data)), JSON.parse(LZString.decompress(options.priority)))
    .then(onSuccess)
    .catch(onError);
};



//---------------------------------------------------------------------------------
// Reference.transaction
// https://firebase.google.com/docs/reference/js/firebase.database.Reference#transaction
//---------------------------------------------------------------------------------
Database.prototype.reference_transaction = function(onSuccess, onError, args) {
  var options = args[0];
  console.log('[broswer] reference.transaction()', options);
  var ref = this.get(options.targetId);

  (new new Promise(function(resolve, reject) {
    var prevValue;
    var timer = setInterval(function() {
      ref.once('value').then(function(value) {
        prevValue = value;

        ref.transaction(function(currentValue) {
          if (JSON.stringify(prevValue) === JSON.stringify(currentValue)) {
            clearInterval(timer);
            cordova.fireDocumentEvent(options.eventName, LZString.compress(JSON.stringify(currentValue)));
            self.one(options.transactionId + '_callback', function(newValue) {
              resolve(JSON.parse(LZString.decompress(newValue)));
            });
          }
          return undefined; // abort this transaction
        }).then(function() {
          // ignore
        }).catch(function() {
          // ignore
        });
      });
    }, 100);
  }))
  .then(function(newValues) {
    ref.transaction(function(currentValue) {
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
          exportVal: LZString.compress(JSON.stringify(snapshot.exportVal())),
          getPriority: snapshot.getPriority(),
          numChildren: snapshot.numChildren(),
          val: LZString.compress(JSON.stringify(snapshot.val())),
          toJSON: LZString.compress(JSON.stringify(snapshot.toJSON()))
        }
      });

    }, options.applyLocally);
  });
};

Database.prototype.reference_onTransactionCallback = function(onSuccess, onError, args) {
  var transactionId = args[0],
    values = args[1];
  console.log('[broswer] reference.reference_onTransactionCallback()');

  this._trigger(transactionId + '_callback', values);
  onSuccess();
};



//---------------------------------------------------------------------------------
// Reference.update
// https://firebase.google.com/docs/reference/js/firebase.database.Reference#update
//---------------------------------------------------------------------------------
Database.prototype.reference_update = function(onSuccess, onError, args) {
  var options = args[0],
    self = this;
  console.log('[broswer] reference.update()', options);

  var ref = this.get(options.targetId);
  ref.update(JSON.parse(LZString.decompress(options.data)))
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
Database.prototype.query_endAt = function(onSuccess, onError, args) {
  var options = args[0];
  console.log('[broswer] query.endAt()', options);

  var ref = this.get(options.refId);
  var query = ref.endAt(options.value, options.key);
  this.set(options.queryId, query);

  onSuccess();
};



//---------------------------------------------------------------------------------
// Query.equalTo
// https://firebase.google.com/docs/reference/js/firebase.database.Query#limitToFirst
//---------------------------------------------------------------------------------
Database.prototype.query_equalTo = function(onSuccess, onError, args) {
  var options = args[0];
  console.log('[broswer] query.equalTo()', options);

  var ref = this.get(options.refId);
  var query = ref.equalTo(options.value, options.key);
  this.set(options.queryId, query);

  onSuccess();
};



//---------------------------------------------------------------------------------
// Query.limitToFirst
// https://firebase.google.com/docs/reference/js/firebase.database.Query#limitToFirst
//---------------------------------------------------------------------------------
Database.prototype.query_limitToFirst = function(onSuccess, onError, args) {
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
Database.prototype.query_limitToLast = function(onSuccess, onError, args) {
  var options = args[0];
  console.log('[broswer] query.limitToLast()', options);

  var ref = this.get(options.refId);
  var query = ref.limitToLast(options.limit);
  this.set(options.queryId, query);

  onSuccess();
};



//---------------------------------------------------------------------------------
// Query.off
// https://firebase.google.com/docs/reference/js/firebase.database.Query#on
//---------------------------------------------------------------------------------
Database.prototype.query_off = function(onSuccess, onError, args) {
  var self = this,
    options = args[0];
  console.log('[broswer] query.off()', options);

  var referenceOrQuery = this.get(options.targetId);
  var listener;
  if (options.listenerId) {
    listener = this.get(options.listenerId);
  }

  referenceOrQuery.off(options.eventType, listener);

  this.delete(options.listenerId);

};



//---------------------------------------------------------------------------------
// Query.on
// https://firebase.google.com/docs/reference/js/firebase.database.Query#on
//---------------------------------------------------------------------------------
Database.prototype.query_on = function(onSuccess, onError, args) {
  var self = this,
    options = args[0];
  console.log('[broswer] query.on()', options);

  var referenceOrQuery = this.get(options.targetId);
  var listener = referenceOrQuery.on(options.eventType, function(snapshot, key) {

    var dbInstance = window.plugin.firebase.database._DBs[self.id];

    if (dbInstance) {
      var target = dbInstance.get(options.targetId);
      if (target) {
        var args = [options.eventType];
        args.push({
          key: snapshot.key,
          exists: snapshot.exists(),
          exportVal: LZString.compress(JSON.stringify(snapshot.exportVal())),
          getPriority: snapshot.getPriority(),
          numChildren: snapshot.numChildren(),
          val: LZString.compress(JSON.stringify(snapshot.val())),
          toJSON: LZString.compress(JSON.stringify(snapshot.toJSON()))
        });

        if (key) {
          args.push(key);
        }
        target._trigger.apply(target, args);
      }
    }

  });

  this.set(options.listenerId, listener);
};



//---------------------------------------------------------------------------------
// Query.once
// https://firebase.google.com/docs/reference/js/firebase.database.Query#once
//---------------------------------------------------------------------------------
Database.prototype.query_once = function(onSuccess, onError, args) {
  var self = this,
    options = args[0];
  console.log('[broswer] query.once()', options);

  var referenceOrQuery = this.get(options.targetId);
  referenceOrQuery.once(options.eventType)
    .then(function(snapshot) {
      onSuccess({
        key: snapshot.key,
        exists: snapshot.exists(),
        exportVal: LZString.compress(JSON.stringify(snapshot.exportVal())),
        getPriority: snapshot.getPriority(),
        numChildren: snapshot.numChildren(),
        val: LZString.compress(JSON.stringify(snapshot.val())),
        toJSON: LZString.compress(JSON.stringify(snapshot.toJSON()))
      });
    })
    .catch(onError);
};



//---------------------------------------------------------------------------------
// Query.orderByChild
// https://firebase.google.com/docs/reference/js/firebase.database.Query#orderByChild
//---------------------------------------------------------------------------------
Database.prototype.orderByChild = function(onSuccess, onError, args) {
  var self = this,
    options = args[0];
  console.log('[broswer] query.orderByChild()', options);

  var referenceOrQuery = this.get(options.targetId);
  try {
    var newQuery = referenceOrQuery.orderByChild(options.path);
    self.set(options.newId, referenceOrQuery);
    onSuccess();
  } catch (e) {
    onError(e);
  }
};



//---------------------------------------------------------------------------------
// Query.orderByKey
// https://firebase.google.com/docs/reference/js/firebase.database.Query#orderByKey
//---------------------------------------------------------------------------------
Database.prototype.query_orderByKey = function(onSuccess, onError, args) {
  var self = this,
    options = args[0];
  console.log('[broswer] query.orderByKey()', options);

  var referenceOrQuery = this.get(options.targetId);
  try {
    var newQuery = referenceOrQuery.orderByKey();
    self.set(options.newId, referenceOrQuery);
    onSuccess();
  } catch (e) {
    onError(e);
  }
};



//---------------------------------------------------------------------------------
// Query.orderByPriority
// https://firebase.google.com/docs/reference/js/firebase.database.Query#orderByValue
//---------------------------------------------------------------------------------
Database.prototype.query_orderByPriority = function(onSuccess, onError, args) {
  var self = this,
    options = args[0];
  console.log('[broswer] query.orderByPriority()', options);

  var referenceOrQuery = this.get(options.targetId);
  try {
    var newQuery = referenceOrQuery.orderByPriority();
    self.set(options.newId, referenceOrQuery);
    onSuccess();
  } catch (e) {
    onError(e);
  }
};



//---------------------------------------------------------------------------------
// Query.orderByValue
// https://firebase.google.com/docs/reference/js/firebase.database.Query#orderByValue
//---------------------------------------------------------------------------------
Database.prototype.query_orderByValue = function(onSuccess, onError, args) {
  var self = this,
    options = args[0];
  console.log('[broswer] query.orderByValue()', options);

  var referenceOrQuery = this.get(options.targetId);
  try {
    var newQuery = referenceOrQuery.orderByValue();
    self.set(options.newId, referenceOrQuery);
    onSuccess();
  } catch (e) {
    onError(e);
  }
};



//---------------------------------------------------------------------------------
// Query.startAt
// https://firebase.google.com/docs/reference/js/firebase.database.Query#startAt
//---------------------------------------------------------------------------------
Database.prototype.query_startAt = function(onSuccess, onError, args) {
  var options = args[0];
  console.log('[broswer] query.startAt()', options);

  var ref = this.get(options.refId);
  var query = ref.startAt(options.value, options.key);
  this.set(options.queryId, query);

  onSuccess();
};


module.exports = Database;
