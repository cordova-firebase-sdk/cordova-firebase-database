




var BaseClass = require('cordova-firebase-database.BaseClass'),
  Database = require('cordova-firebase-database.Database'),
  utils = require('cordova/utils'),
  common = require('cordova-firebase-database.Common');

var isInitialized = function(packageName) {
  var parent = window;
  var steps = packageName.split(/\./);
  var results = steps.filter(function(step) {
    if (step in parent) {
      parent = parent[step];
      return true;
    } else {
      return false;
    }
  });

  return results.length === steps.length;
};

var loadJsPromise = function(options) {
  return new Promise(function(resolve, reject) {

    if (isInitialized(options.package)) {
      resolve();
    } else {
      var scriptTag = document.createElement('script');
      scriptTag.src = options.url;
      scriptTag.onload = function() {
        var timer = setInterval(function() {
          if (isInitialized(options.package)) {
            clearInterval(timer);
            resolve();
          }
        }, 10);
      };
      scriptTag.onerror = reject;
      document.body.appendChild(scriptTag);
    }
  });
};


function CordovaFirebaseDatabase() {
  BaseClass.apply(this);
}
utils.extend(CordovaFirebaseDatabase, BaseClass);

CordovaFirebaseDatabase.prototype.newInstance = function(resolve, reject, args) {
  var self = this;

  loadJsPromise({
    'url': 'https://www.gstatic.com/firebasejs/5.5.0/firebase-app.js',
    'package': 'firebase.app'
  }).then(function() {
    return loadJsPromise({
      'url': 'https://www.gstatic.com/firebasejs/5.5.0/firebase-database.js',
      'package': 'firebase.database'
    });
  })
  .then(function() {
    var options = args[0] || {};

    // Create/retrieve firebaseRef
    var firebaseRef;
    if (!firebase.default || firebase.default.apps.length === 0) {
      firebase.initializeApp(options.browserConfigs || {});
    }
    console.log('--->[browser] CordovaFirebaseDatabase.newInstance() : ' + options.id);

    // Create firebase reference
    var instance = new Database(options.id, firebase.database());
    var dummyObj = {};
    var keys = Object.getOwnPropertyNames(Database.prototype).filter(function (p) {
      return typeof Database.prototype[p] === 'function';
    });
    keys.forEach(function(key) {
      dummyObj[key] = instance[key].bind(instance);
    });
    require('cordova/exec/proxy').add(options.id, dummyObj);

    window.plugin.firebase._DBs[options.id] = dummyObj;

    resolve();
  })
  .catch(reject);
};


// Register this plugin
(function() {
  var instance = new CordovaFirebaseDatabase();
  var dummyObj = {};
  var keys = Object.getOwnPropertyNames(CordovaFirebaseDatabase.prototype).filter(function (p) {
    return typeof CordovaFirebaseDatabase.prototype[p] === 'function';
  });
  keys.forEach(function(key) {
    dummyObj[key] = instance[key].bind(instance);
  });

  require('cordova/exec/proxy').add('CordovaFirebaseDatabase', dummyObj);
})();
