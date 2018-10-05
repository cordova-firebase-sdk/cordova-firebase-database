

var exec = require('cordova/exec'),
  BaseClass = require('./BaseClass'),
  BaseArrayClass = require('./BaseArrayClass'),
  Reference = require('./Reference'),
  execCmd = require('./commandQueueExecutor');

function CordovaFirebaseDatabase(firebaseInitOptions) {

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

  Object.defineProperty(self, 'hashCode', {
    value: Math.floor(Date.now() * Math.random()),
    writable: false,
    enumerable: false
  });

  Object.defineProperty(self, 'refId', {
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
    self._cmdQueue.trigger('insert_at');
  }, function(error) {
    throw new Error(error);
  }, 'CordovaFirebaseDatabase', 'newInstance', [{
    'id': self.refId,
    'refPath': firebaseInitOptions.refPath || '',
    'browserConfigs': firebaseInitOptions.browserConfigs || {}
  }], {
    'sync': true
  });
}

CordovaFirebaseDatabase.prototype.getPluginName = function() {
  return this.refId;
};

CordovaFirebaseDatabase.prototype._exec = function() {
  this._cmdQueue.push.call(this._cmdQueue, {
    target: this,
    args: Array.prototype.slice.call(arguments, 0)
  });
};

CordovaFirebaseDatabase.prototype.ref = function(path) {
  console.log('--->[js]CordovaFirebaseDatabase.ref()', this.getPluginName());

  var reference = new Reference(this, path || null, path || null, parent);
  this._exec(function() {
    reference._privateInit();
  }, function(error) {
    throw new Error(error);
  }, this.getPluginName(), 'ref', [{
    path: path,
    refId: reference.refId,
    parent: null
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
    return new CordovaFirebaseDatabase(options);
  };

  Object.defineProperty(window.plugin.firebase, '_DBs', {
    value: {},
    enumerable: false
  });
});
