



var utils = require('cordova/utils'),
  Query = require('./Query'),
  OnDisconnect = require('./OnDisconnect'),
  cordova_exec = require('cordova/exec'),
  LZString = require('./LZString');

/*******************************************************************************
 * @name Reference
 ******************************************************************************/
function Reference(database, key, path, parentId) {
  var self = this,
    pluginName = database.id;

  Query.call(this, pluginName, database, key);

  Object.defineProperty(self, 'key', {
    value: key
  });

  Object.defineProperty(self, 'parentId', {
    value: parentId
  });

}

utils.extend(Reference, Query);


//---------------------------------------------------------------------------------
// Reference.child
// https://firebase.google.com/docs/reference/js/firebase.database.Reference#child
//---------------------------------------------------------------------------------
Reference.prototype.child = function(path) {
  var self = this;

  var reference = new Reference(self.ref, path, self.key + '/' + path, self.id);
  self._exec(function() {
    reference._privateInit();
  }, function(error) {
    throw new Error(error);
  }, self.pluginName, 'reference_child', [{
    path: path,
    childId: reference.id,
    targetId: self.id
  }]);

  return reference;
};



//---------------------------------------------------------------------------------
// Reference.onDisconnect
// https://firebase.google.com/docs/reference/js/firebase.database.Reference#remove
//---------------------------------------------------------------------------------
Reference.prototype.onDisconnect = function() {
  var self = this;

  var onDisconnect = new OnDisconnect(self.pluginName, self.ref);
  self._exec(function() {
    onDisconnect._privateInit();
  }, function(error) {
    throw new Error(error);
  }, self.pluginName, 'reference_onDisconnect', [{
    targetId: self.id,
    onDisconnectId: onDisconnect.id
  }]);

  return onDisconnect;
};



//---------------------------------------------------------------------------------
// Reference.push (child() + set())
// https://firebase.google.com/docs/reference/js/firebase.database.Reference#push
//---------------------------------------------------------------------------------
Reference.prototype.push = function(value, onComplete) {
  var self = this;


  var reference = self.ref.child(self.path);
  reference.then = function(callback) {
    reference._onSuccess = callback;
  };
  reference.catch = function(callback) {
    reference._onError = callback;
  };

  self._exec(function() {
    reference._privateInit();

    reference.set(value).then(function() {
      if (typeof reference._onSuccess === 'function') {
        Promise.resolve().then(reference._onSuccess);
      }
      if (typeof onComplete === 'function') {
        onComplete.call(self);
      }
    }, function(error) {
      if (typeof reference._onError === 'function') {
        Promise.reject(error).then(null, reference._onError);
      }
      if (typeof onComplete === 'function') {
        onComplete.call(self, error);
      }
    });

  }, function(error) {
    if (typeof reference._onError === 'function') {
      Promise.reject(error).then(null, reference._onError);
    }
    if (typeof onComplete === 'function') {
      onComplete.call(self, error);
    }
  }, self.pluginName, 'reference_child', [{
    path: path,
    childId: reference.id,
    targetId: self.id
  }]);

  return reference;
};



//---------------------------------------------------------------------------------
// Reference.remove
// https://firebase.google.com/docs/reference/js/firebase.database.Reference#remove
//---------------------------------------------------------------------------------
Reference.prototype.remove = function(onComplete) {
  var self = this;
  return new Promise(function(resolve, reject) {
    self._exec(function() {
      resolve();
      if (typeof onComplete === 'function') {
        onComplete.call(self);
      }
    }, function(error) {
      reject(error);
      if (typeof onComplete === 'function') {
        onComplete.call(self, error);
      }
    }, self.pluginName, 'reference_remove', [{
      targetId: self.id
    }]);
  });
};



//---------------------------------------------------------------------------------
// Reference.set
// https://firebase.google.com/docs/reference/js/firebase.database.Reference#set
//---------------------------------------------------------------------------------
Reference.prototype.set = function(value, onComplete) {
  var self = this;
  return new Promise(function(resolve, reject) {
    self._exec(function() {
      resolve();
      if (typeof onComplete === 'function') {
        onComplete.call(self);
      }
    }, function(error) {
      reject(error);
      if (typeof onComplete === 'function') {
        onComplete.call(self, error);
      }
    }, self.pluginName, 'reference_set', [{
      targetId: self.id,
      data: LZString.compress(JSON.stringify(value))
    }]);
  });
};



//---------------------------------------------------------------------------------
// Reference.setPriority
// https://firebase.google.com/docs/reference/js/firebase.database.Reference#setPriority
//---------------------------------------------------------------------------------
Reference.prototype.setPriority = function(priority, onComplete) {
  var self = this;
  return new Promise(function(resolve, reject) {
    self._exec(function() {
      resolve();
      if (typeof onComplete === 'function') {
        onComplete.call(self);
      }
    }, function(error) {
      reject(error);
      if (typeof onComplete === 'function') {
        onComplete.call(self, error);
      }
    }, self.pluginName, 'reference_setPriority', [{
      targetId: self.id,
      priority: LZString.compress(JSON.stringify(priority))
    }]);
  });
};



//---------------------------------------------------------------------------------
// Reference.setWithPriority
// https://firebase.google.com/docs/reference/js/firebase.database.Reference#setWithPriority
//---------------------------------------------------------------------------------
Reference.prototype.setWithPriority = function(newVal, newPriority, onComplete) {
  var self = this;
  return new Promise(function(resolve, reject) {
    self._exec(function() {
      resolve();
      if (typeof onComplete === 'function') {
        onComplete.call(self);
      }
    }, function(error) {
      reject(error);
      if (typeof onComplete === 'function') {
        onComplete.call(self, error);
      }
    }, self.pluginName, 'reference_setWithPriority', [{
      targetId: self.id,
      data: LZString.compress(JSON.stringify(newVal)),
      priority: LZString.compress(JSON.stringify(newPriority))
    }]);
  });
};



//---------------------------------------------------------------------------------
// Reference.transaction
// https://firebase.google.com/docs/reference/js/firebase.database.Reference#transaction
//---------------------------------------------------------------------------------
Reference.prototype.transaction = function(transactionUpdate, onComplete, applyLocally) {
  var self = this;
  var transactionId = Math.floor(Date.now() * Math.random());
  var eventName = self.pluginName + '-' + self.id + '-transaction';

  var onNativeCallback = function(currentValue) {
    var newValue = transactionUpdate.call(self, JSON.parse(LZString.decompress(currentValue)));
    cordova_exec(null, null, self.pluginName, 'reference_onTransactionCallback', [transactionId, LZString.compress(JSON.stringify(newValue))]);
  };
  document.addEventListener(eventName, onNativeCallback, {
    once: true
  });


  return new Promise(function(resolve, reject) {
    self._exec(function() {
      resolve();
      if (typeof onComplete === 'function') {
        onComplete.call(self);
      }
    }, function(error) {
      reject(error);
      if (typeof onComplete === 'function') {
        onComplete.call(self, error);
      }
    }, self.pluginName, 'reference_transaction', [{
      targetId: self.id,
      eventName: eventName,
      transactionId: transactionId
    }], {
      sync: true
    });
  });
};



//---------------------------------------------------------------------------------
// Reference.update
// https://firebase.google.com/docs/reference/js/firebase.database.Reference#update
//---------------------------------------------------------------------------------
Reference.prototype.update = function(values, onComplete) {
  var self = this;
  return new Promise(function(resolve, reject) {
    self._exec(function() {
      resolve();
      if (typeof onComplete === 'function') {
        onComplete.call(self);
      }
    }, function(error) {
      reject(error);
      if (typeof onComplete === 'function') {
        onComplete.call(self, error);
      }
    }, self.pluginName, 'reference_update', [{
      targetId: self.id,
      data: LZString.compress(JSON.stringify(values))
    }]);
  });
};

module.exports = Reference;
