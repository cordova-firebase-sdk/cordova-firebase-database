

var utils = require('cordova/utils'),
  BaseClass = require('cordova-firebase-core.BaseClass'),
  BaseArrayClass = require('cordova-firebase-core.BaseArrayClass'),
  ReferenceModule = require('./Reference'),
  LZString = require('cordova-firebase-core.LZString'),
  common = require('cordova-firebase-core.Common'),
  execCmd = require('./FirebaseDatabaseCommandQueue');

function CordovaFirebaseDatabase(appId, firebaseInitOptions) {
  BaseClass.apply(this);
  if (!firebaseInitOptions) {
    throw new Error('firebaseInitOptions parameter is required.');
  }
  if (!firebaseInitOptions.databaseURL) {
    throw new Error('Please specify \'databaseURL\' property at least.');
  }
  if (firebaseInitOptions.databaseURL.indexOf('firebaseio.com') === -1) {
    throw new Error('Invalid url is specified for \'databaseURL\' property.');
  }

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

  Object.defineProperty(self, 'appId', {
    value: appId,
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

  var dbUrl = firebaseInitOptions.databaseURL.replace(/(firebaseio.com).*$/, '$1');

  Object.defineProperty(self, 'url', {
    value: dbUrl,
    enumerable: false
  });

  self._one('fireAppReady', function() {
    execCmd.call({
      '_isReady': true
    }, function() {
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
      'appId': self.appId
    }], {
      'sync': true
    });
  });
}

utils.extend(CordovaFirebaseDatabase, BaseClass);

CordovaFirebaseDatabase.prototype._exec = function() {
  this._cmdQueue.push.call(this._cmdQueue, {
    target: this,
    args: Array.prototype.slice.call(arguments, 0)
  });
};



//---------------------------------------------------------------------------------
// Database.goOffline
// https://firebase.google.com/docs/reference/js/firebase.database.Database#goOffline
//---------------------------------------------------------------------------------
CordovaFirebaseDatabase.prototype.goOffline = function() {

  this._exec(null, function(error) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(error);
    }
  }, this.id, 'database_goOffline', [], {
    sync: true
  });
};



//---------------------------------------------------------------------------------
// Database.goOnline
// https://firebase.google.com/docs/reference/js/firebase.database.Database#goOnline
//---------------------------------------------------------------------------------
CordovaFirebaseDatabase.prototype.goOnline = function() {

  this._exec(null, function(error) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(error);
    }
  }, this.id, 'database_goOnline', [], {
    sync: true
  });
};



//---------------------------------------------------------------------------------
// Database.ref
// https://firebase.google.com/docs/reference/js/firebase.database.Database#ref
//---------------------------------------------------------------------------------
CordovaFirebaseDatabase.prototype.ref = function(path) {

  var key = null;
  if (path) {
    path = path.replace(/\/$/, '');
    key = path.replace(/^.*\//, '') || null;
  }

  var reference = new ReferenceModule.Reference({
    pluginName: this.id,
    parent: null,
    key: key,
    url: this.url
  });
  this._on('nativeEvent', function(params) {
    reference._trigger('nativeEvent', params);
  });

  this._exec(function(results) {
    reference._privateInit(results);
  }, function(error) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(error);
    }
  }, this.id, 'database_ref', [{
    path: path,
    id: reference.id
  }]);

  return reference;
};



//---------------------------------------------------------------------------------
// Database.ref
// https://firebase.google.com/docs/reference/js/firebase.database.Database#refFromURL
//---------------------------------------------------------------------------------
CordovaFirebaseDatabase.prototype.refFromURL = function(path) {

  var key = null;
  if (path) {
    path = path.replace(/\/$/, '');
    key = path.replace(/^.*\//, '') || null;
  }

  var reference = new ReferenceModule.Reference({
    pluginName: this.id,
    parent: null,
    key: key,
    url: this.url
  });
  this._on('nativeEvent', function(params) {
    reference._trigger('nativeEvent', params);
  });

  this._exec(function(results) {
    reference._privateInit(results);
  }, function(error) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(error);
    }
  }, this.id, 'database_ref', [{
    path: path,
    id: reference.id
  }]);

  return reference;
};

module.exports = CordovaFirebaseDatabase;


cordova.addConstructor(function() {
  if (!window.Cordova) {
    window.Cordova = cordova;
  }
  if (common.isInitialized('plugin.firebase.app')) {
    window.plugin = window.plugin || {};
    window.plugin.firebase = window.plugin.firebase || {};
    window.plugin.firebase.database = {};

    Object.defineProperty(window.plugin.firebase.database, '_DBs', {
      value: {},
      enumerable: false
    });
    Object.defineProperty(window.plugin.firebase.database, '_nativeCallback', {
      value: function(dbId, listenerId, eventType, args) {

        var dbInstance = window.plugin.firebase.database._DBs[dbId];

        if (dbInstance) {
          dbInstance._trigger('nativeEvent', {
            listenerId: listenerId,
            eventType: eventType,
            args: args
          });
        }
      },
      enumerable: false
    });
  }
});
