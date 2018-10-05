

var utils = require('cordova/utils'),
  exec = require('cordova/exec'),
  BaseClass = require('./BaseClass'),
  BaseArrayClass = require('./BaseArrayClass'),
  Reference = require('./Reference'),
  execCmd = require('./commandQueueExecutor');

function CordovaFirebaseDatabase(firebaseInitOptions) {
  BaseClass.apply(this);

  var self = this,
    cmdQueue = new BaseArrayClass();

  Object.defineProperty(self, '_isReady', {
    value: false,
    writable: true,
    enumerable: false
  });

  Object.defineProperty(self, '_isRemoved', {
    value: false,
    enumerable: false
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

  Object.defineProperty(self, 'id', {
    value: 'firedb_' + self.hashCode,
    writable: false,
    enumerable: false
  });

  Object.defineProperty(self, 'execCmd', {
    value: execCmd,
    writable: false,
    enumerable: false
  });

  execCmd.call({
    '_isReady': true
  },
  function() {
    self._isReady = true;
    self._cmdQueue._trigger('insert_at');
  }, function(error) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(error);
    }
  }, 'CordovaFirebaseDatabase', 'newInstance', [{
    'id': self.id,
    'refPath': firebaseInitOptions.refPath || '',
    'browserConfigs': firebaseInitOptions.browserConfigs || {}
  }], {
    'sync': true
  });
}

utils.extend(CordovaFirebaseDatabase, BaseClass);

CordovaFirebaseDatabase.prototype._exec = function() {
  this._cmdQueue.push.call(this._cmdQueue, {
    target: this,
    args: Array.prototype.slice.call(arguments, 0)
  });
};

CordovaFirebaseDatabase.prototype.ref = function(key) {
  console.log('--->[js]CordovaFirebaseDatabase.ref()', this.id);

  var reference = new Reference(this, key);
  this._exec(function() {
    reference._privateInit();
  }, function(error) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(error);
    }
  }, this.id, 'ref', [{
    key: key,
    id: reference.id
  }]);

  return reference;
};




cordova.addConstructor(function() {
  if (!window.Cordova) {
      window.Cordova = cordova;
  }
  window.plugin = window.plugin || {};
  window.plugin.firebase = window.plugin.firebase || {};
  window.plugin.firebase.database = function(options) {
    var db = new CordovaFirebaseDatabase(options);
    window.plugin.firebase.database._DBs[db.id] = db;
    return db;
  };

  Object.defineProperty(window.plugin.firebase.database, '_DBs', {
    value: {},
    enumerable: false
  });
});
