



var utils = require('cordova/utils'),
  Query = require('./Query'),
  OnDisconnect = require('./OnDisconnect'),
  cordova_exec = require('cordova/exec'),
  LZString = require('./LZString');

/*******************************************************************************
 * @name ThenableReference
 ******************************************************************************/
function ThenableReference(params) {
  var self = this;
  Query.call(this, params);

  Object.defineProperty(self, 'parent', {
    value: params.parentRef
  });
  Object.defineProperty(self, 'key', {
    value: params.key
  });

}


utils.extend(ThenableReference, Query);

ThenableReference.prototype.then = function(resolveCallback) {
  var self = this;

  return new Promise(function(resolve, reject) {
    self._resolve = function() {
      resolveCallback.call(self, self);
    };
    self._reject = reject;
  });
};

ThenableReference.prototype.catch = function(rejectCallback) {
  this._reject = rejectCallback;
};


//---------------------------------------------------------------------------------
// ThenableReference.child
// https://firebase.google.com/docs/reference/js/firebase.database.Reference#child
//---------------------------------------------------------------------------------
ThenableReference.prototype.child = function(path) {
  var self = this;

  var reference = new ThenableReference(self.pluginName, self);
  delete reference.then;
  delete reference.catch;
  self._exec(function() {
    ThenableReference._privateInit();
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
// ThenableReference.onDisconnect
// https://firebase.google.com/docs/reference/js/firebase.database.Reference#remove
//---------------------------------------------------------------------------------
ThenableReference.prototype.onDisconnect = function() {
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
// ThenableReference.push
// https://firebase.google.com/docs/reference/js/firebase.database.Reference#push
//---------------------------------------------------------------------------------
ThenableReference.prototype.push = function(value, onComplete) {
  var self = this;

  var reference = new ThenableReference({
    pluginName: self.pluginName,
    ref: self.parent,
    key: self.key
  });

  (new Promise(function(resolve, reject) {

    self._exec(function(results) {
      reference._privateInit(results);
      resolve.call(reference);
    }, function(error) {
      reject.call(reference, error);
      if (typeof onComplete === 'function') {
        onComplete.call(self, error);
      }
    }, self.pluginName, 'reference_push', [{
      value: LZString.compress(JSON.stringify(value)),
      targetId: self.id,
      newId: reference.id
    }]);
  }))
  .then(function(result) {
    if (typeof reference._resolve === 'function') {
      Promise.resolve(result).then(reference._resolve);
    }
    if (typeof onComplete === 'function') {
      onComplete.call(self);
    }
  }).catch(function(error) {
    if (typeof reference._reject === 'function') {
      Promise.reject(error).then(reference._reject);
    }
    if (typeof onComplete === 'function') {
      onComplete.call(self, error);
    }
  });

  return reference;
};



//---------------------------------------------------------------------------------
// ThenableReference.remove
// https://firebase.google.com/docs/reference/js/firebase.database.Reference#remove
//---------------------------------------------------------------------------------
ThenableReference.prototype.remove = function(onComplete) {
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
// ThenableReference.set
// https://firebase.google.com/docs/reference/js/firebase.database.Reference#set
//---------------------------------------------------------------------------------
ThenableReference.prototype.set = function(value, onComplete) {
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
// ThenableReference.setPriority
// https://firebase.google.com/docs/reference/js/firebase.database.Reference#setPriority
//---------------------------------------------------------------------------------
ThenableReference.prototype.setPriority = function(priority, onComplete) {
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
// ThenableReference.setWithPriority
// https://firebase.google.com/docs/reference/js/firebase.database.Reference#setWithPriority
//---------------------------------------------------------------------------------
ThenableReference.prototype.setWithPriority = function(newVal, newPriority, onComplete) {
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
// ThenableReference.transaction
// https://firebase.google.com/docs/reference/js/firebase.database.Reference#transaction
//---------------------------------------------------------------------------------
ThenableReference.prototype.transaction = function(transactionUpdate, onComplete, applyLocally) {
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
      transactionId: transactionId,
      applyLocally: applyLocally
    }], {
      sync: true
    });
  });
};



//---------------------------------------------------------------------------------
// ThenableReference.update
// https://firebase.google.com/docs/reference/js/firebase.database.Reference#update
//---------------------------------------------------------------------------------
ThenableReference.prototype.update = function(values, onComplete) {
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

module.exports = ThenableReference;
