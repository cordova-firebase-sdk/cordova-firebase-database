

var VARS_FIELD = typeof Symbol === 'undefined' ? '__vars' + Date.now() : Symbol('vars');
var SUBSCRIPTIONS_FIELD = typeof Symbol === 'undefined' ? '__subs' + Date.now() : Symbol('subscriptions');

var utils = require('cordova/utils'),
    BaseClass = require('cordova-firebase-database.BaseClass');

/*******************************************************************************
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
  console.log('[broswer] database->child', options);

  var ref = this.get(options.parentId);
  var childRef = ref.child(options.path);
  this.set(options.refId, childRef);
  onSuccess();
};

Database.prototype.endAt = function(onSuccess, onError, args) {
  var options = args[0];
  console.log('[broswer] database->endAt', options);

  var ref = this.get(options.refId);
  var query = ref.endAt(options.value, options.key);
  this.set(options.queryId, query);

  onSuccess();
};

Database.prototype.ref = function(onSuccess, onError, args) {
  var options = args[0];
  console.log('[broswer] database->ref', options);

  var ref = this.database.ref(options.path);
  this.set(options.refId, ref);
  onSuccess();
};

Database.prototype.setValue = function(onSuccess, onError, args) {
  var options = args[0];
  console.log('[broswer] database->set', args);
  var ref = this.get(options.refId);
  ref.set(options.data).then(onSuccess).catch(onError);
};

Database.prototype._callbackFromNative = function(eventName) {
  console.log(eventName);
};


module.exports = Database;
