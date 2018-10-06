


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

Database.prototype.child = function(onSuccess, onError, args) {
  var options = args[0];
  console.log('[broswer] reference.child()', options);

  var ref = this.get(options.parentId);
  var childRef = ref.child(options.path);
  this.set(options.targetId, childRef);
  onSuccess();
};

Database.prototype.endAt = function(onSuccess, onError, args) {
  var options = args[0];
  console.log('[broswer] reference.endAt()', options);

  var ref = this.get(options.refId);
  var query = ref.endAt(options.value, options.key);
  this.set(options.queryId, query);

  onSuccess();
};

Database.prototype.startAt = function(onSuccess, onError, args) {
  var options = args[0];
  console.log('[broswer] reference.startAt()', options);

  var ref = this.get(options.refId);
  var query = ref.startAt(options.value, options.key);
  this.set(options.queryId, query);

  onSuccess();
};

Database.prototype.equalTo = function(onSuccess, onError, args) {
  var options = args[0];
  console.log('[broswer] reference.equalTo()', options);

  var ref = this.get(options.refId);
  var query = ref.equalTo(options.value, options.key);
  this.set(options.queryId, query);

  onSuccess();
};

Database.prototype.limitToFirst = function(onSuccess, onError, args) {
  var options = args[0];
  console.log('[broswer] reference.limitToFirst()', options);

  var ref = this.get(options.refId);
  var query = ref.limitToFirst(options.limit);
  this.set(options.queryId, query);

  onSuccess();
};

Database.prototype.limitToLast = function(onSuccess, onError, args) {
  var options = args[0];
  console.log('[broswer] reference.limitToLast()', options);

  var ref = this.get(options.refId);
  var query = ref.limitToLast(options.limit);
  this.set(options.queryId, query);

  onSuccess();
};

Database.prototype.ref = function(onSuccess, onError, args) {
  var options = args[0];
  console.log('[broswer] reference.ref()', options);

  var ref = this.database.ref(options.key);
  this.set(options.id, ref);
  onSuccess();
};

Database.prototype.updateKey = function(onSuccess, onError, args) {
  var options = args[0],
    self = this;
  console.log('[broswer] reference.remove()', options);

  var ref = this.get(options.targetId);
  ref.update(options.data).then(onSuccess).catch(onError);
};

Database.prototype.removeKey = function(onSuccess, onError, args) {
  var options = args[0],
    self = this;
  console.log('[broswer] reference.remove()', options);

  var ref = this.get(options.targetId);
  ref.remove().then(function() {
    self.delete(options.targetId);
    onSuccess();
  }).catch(onError);
};

Database.prototype.setValue = function(onSuccess, onError, args) {
  var options = args[0];
  console.log('[broswer] reference.set()', options);
  var ref = this.get(options.targetId);
  ref.set(options.data).then(onSuccess).catch(onError);
};

Database.prototype.once = function(onSuccess, onError, args) {
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

Database.prototype.orderByKey = function(onSuccess, onError, args) {
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

Database.prototype.orderByPriority = function(onSuccess, onError, args) {
  var self = this,
    options = args[0];
  console.log('[broswer] query.orderByKey()', options);

  var referenceOrQuery = this.get(options.targetId);
  try {
    var newQuery = referenceOrQuery.orderByPriority();
    self.set(options.newId, referenceOrQuery);
    onSuccess();
  } catch (e) {
    onError(e);
  }
};

Database.prototype.orderByPriority = function(onSuccess, onError, args) {
  var self = this,
    options = args[0];
  console.log('[broswer] query.orderByKey()', options);

  var referenceOrQuery = this.get(options.targetId);
  try {
    var newQuery = referenceOrQuery.orderByValue();
    self.set(options.newId, referenceOrQuery);
    onSuccess();
  } catch (e) {
    onError(e);
  }
};

Database.prototype.on = function(onSuccess, onError, args) {
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

Database.prototype.off = function(onSuccess, onError, args) {
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
module.exports = Database;
