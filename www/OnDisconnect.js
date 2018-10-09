


var BaseArrayClass = require('./BaseArrayClass'),
  execCmd = require('./FirebaseDatabaseCommandQueue'),
  LZString = require('./LZString');

/*******************************************************************************
 * @name OnDisconnect
 ******************************************************************************/
function OnDisconnect(pluginName) {
  var self = this,
    cmdQueue = new BaseArrayClass();

  Object.defineProperty(self, '_isReady', {
    value: false,
    writable: true
  });
  Object.defineProperty(self, 'id', {
    value: this.hashCode + '_onDisconnect'
  });
  Object.defineProperty(self, 'pluginName', {
    value: pluginName
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

OnDisconnect.prototype._privateInit = function() {
  this._isReady = true;
  this._cmdQueue._trigger('insert_at');
};

OnDisconnect.prototype._exec = function() {
  this._cmdQueue.push.call(this._cmdQueue, {
    target: this,
    args: Array.prototype.slice.call(arguments, 0)
  });
};


//---------------------------------------------------------------------------------
// onDisconnect.cancel
// https://firebase.google.com/docs/reference/js/firebase.database.OnDisconnect#cancel
//---------------------------------------------------------------------------------
OnDisconnect.prototype.cancel = function(onComplete) {
  var self = this;

  return new new Promise(function(resolve, reject) {
    self._exec(function() {
      resolve.call(self);
      if (typeof onComplete === 'function') {
        onComplete.call(self);
      }
    }, function(error) {
      reject.call(self, error);
      if (typeof onComplete === 'function') {
        onComplete.call(self, error);
      }
    }, self.pluginName, 'onDisconnect_cancel', [{
      targetId: self.id
    }]);
  });
};



//---------------------------------------------------------------------------------
// onDisconnect.remove
// https://firebase.google.com/docs/reference/js/firebase.database.OnDisconnect#remove
//---------------------------------------------------------------------------------
OnDisconnect.prototype.remove = function(onComplete) {
  var self = this;

  return new new Promise(function(resolve, reject) {
    self._exec(function() {
      resolve.call(self);
      if (typeof onComplete === 'function') {
        onComplete.call(self);
      }
    }, function(error) {
      reject.call(self, error);
      if (typeof onComplete === 'function') {
        onComplete.call(self, error);
      }
    }, self.pluginName, 'onDisconnect_remove', [{
      targetId: self.id
    }]);
  });
};


//---------------------------------------------------------------------------------
// onDisconnect.set
// https://firebase.google.com/docs/reference/js/firebase.database.OnDisconnect#set
//---------------------------------------------------------------------------------
OnDisconnect.prototype.set = function(value, onComplete) {
  var self = this;

  return new new Promise(function(resolve, reject) {
    self._exec(function() {
      resolve.call(self);
      if (typeof onComplete === 'function') {
        onComplete.call(self);
      }
    }, function(error) {
      reject.call(self, error);
      if (typeof onComplete === 'function') {
        onComplete.call(self, error);
      }
    }, self.pluginName, 'onDisconnect_set', [{
      targetId: self.id,
      value: LZString.compressToBase64(JSON.stringify(value))
    }]);
  });
};



//---------------------------------------------------------------------------------
// onDisconnect.setWithPriority
// https://firebase.google.com/docs/reference/js/firebase.database.OnDisconnect#setWithPriority
//---------------------------------------------------------------------------------
OnDisconnect.prototype.setWithPriority = function(value, priority, onComplete) {
  var self = this;

  return new new Promise(function(resolve, reject) {
    self._exec(function() {
      resolve.call(self);
      if (typeof onComplete === 'function') {
        onComplete.call(self);
      }
    }, function(error) {
      reject.call(self, error);
      if (typeof onComplete === 'function') {
        onComplete.call(self, error);
      }
    }, self.pluginName, 'onDisconnect_setWithPriority', [{
      targetId: self.id,
      value: LZString.compressToBase64(JSON.stringify(value)),
      priority: priority
    }]);
  });
};



//---------------------------------------------------------------------------------
// onDisconnect.update
// https://firebase.google.com/docs/reference/js/firebase.database.OnDisconnect#update
//---------------------------------------------------------------------------------
OnDisconnect.prototype.update = function(values, onComplete) {
  var self = this;

  return new new Promise(function(resolve, reject) {
    self._exec(function() {
      resolve.call(self);
      if (typeof onComplete === 'function') {
        onComplete.call(self);
      }
    }, function(error) {
      reject.call(self, error);
      if (typeof onComplete === 'function') {
        onComplete.call(self, error);
      }
    }, self.pluginName, 'onDisconnect_update', [{
      targetId: self.id,
      values: LZString.compressToBase64(JSON.stringify(values))
    }]);
  });
};



module.exports = OnDisconnect;
