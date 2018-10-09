




var utils = require('cordova/utils'),
  Query = require('./Query'),
  OnDisconnect = require('./OnDisconnect'),
  cordova_exec = require('cordova/exec'),
  LZString = require('./LZString');

/*******************************************************************************
 * @name Reference
 ******************************************************************************/
function Reference(params) {
  var self = this;
  Query.call(this, params);


  Object.defineProperty(self, 'parent', {
    value: params.parentRef
  });
  Object.defineProperty(self, 'key', {
    value: params.key
  });

}

utils.extend(Reference, Query);


//---------------------------------------------------------------------------------
// Reference.child
// https://firebase.google.com/docs/reference/js/firebase.database.Reference#child
//---------------------------------------------------------------------------------
Reference.prototype.child = function(path) {
  var self = this;

  var key = null;
  if (path) {
    path = path.replace(/\/$/, '');
    key = path.replace(/^.*\//, '') || self.key;
  } else {
    throw new Error('Reference.child failed: Was called with 0 arguments. Expects at least 1.');
  }

  var reference = new Reference({
    pluginName: self.pluginName,
    parent: self,
    key: key,
    url: self.url + '/' + path
  });
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

  var onDisconnect = new OnDisconnect(self.pluginName);
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
// Reference.push
// https://firebase.google.com/docs/reference/js/firebase.database.Reference#push
//---------------------------------------------------------------------------------
Reference.prototype.push = function(value, onComplete) {
  var self = this;

  var reference = new ThenableReference({
    pluginName: self.pluginName,
    ref: self.parent,
    key: self.key
  });

  (new Promise(function(resolve, reject) {

    self._exec(function() {
      reference._privateInit();
      resolve.call(reference);
    }, function(error) {
      reject.call(reference, error);
      if (typeof onComplete === 'function') {
        onComplete.call(self, error);
      }
    }, self.pluginName, 'reference_push', [{
      value: LZString.compressToBase64(JSON.stringify(value)),
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
      data: LZString.compressToBase64(JSON.stringify(value))
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
      priority: LZString.compressToBase64(JSON.stringify(priority))
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
      data: LZString.compressToBase64(JSON.stringify(newVal)),
      priority: LZString.compressToBase64(JSON.stringify(newPriority))
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
  var eventName = self.pluginName + '-' + self.id + '-' + transactionId + '-transaction';

  var onNativeCallback = function(args) {
    var newValue = transactionUpdate.call(self, JSON.parse(LZString.decompressFromBase64(args[0])));
    cordova_exec(null, null, self.pluginName, 'reference_onTransactionCallback', [transactionId, LZString.compressToBase64(JSON.stringify(newValue))]);
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
      data: LZString.compressToBase64(JSON.stringify(values))
    }]);
  });
};


/*******************************************************************************
 * @name ThenableReference
 ******************************************************************************/
function ThenableReference(params) {
  Reference.call(this, params);
}

utils.extend(ThenableReference, Reference);

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


module.exports = {
  Reference: Reference,
  ThenableReference: ThenableReference
};
