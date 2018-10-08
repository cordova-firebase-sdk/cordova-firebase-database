




var BaseClass = require('cordova-firebase-database.BaseClass'),
  FirebaseDatabasePlugin = require('cordova-firebase-database.FirebaseDatabasePlugin'),
  utils = require('cordova/utils'),
  common = require('cordova-firebase-database.Common');


function CordovaFirebaseDatabase() {
  BaseClass.apply(this);
}
utils.extend(CordovaFirebaseDatabase, BaseClass);

CordovaFirebaseDatabase.prototype.newInstance = function(resolve, reject, args) {

  common.loadJsPromise({
    'url': 'https://www.gstatic.com/firebasejs/5.5.0/firebase-app.js',
    'package': 'firebase.app'
  }).then(function() {
    return common.loadJsPromise({
      'url': 'https://www.gstatic.com/firebasejs/5.5.0/firebase-database.js',
      'package': 'firebase.database'
    });
  })
  .then(function() {
    var options = args[0] || {};

    // Create/retrieve firebaseRef
    if (!firebase.default || firebase.default.apps.length === 0) {
      firebase.initializeApp(options.browserConfigs || {});
    }
    console.log('--->[browser] CordovaFirebaseDatabase.newInstance() : ' + options.id);
    var database = firebase.database();
    //console.log(database.app);

    // Create firebase reference
    var instance = new FirebaseDatabasePlugin(options.id, database);
    var dummyObj = {};
    var keys = Object.getOwnPropertyNames(FirebaseDatabasePlugin.prototype).filter(function (p) {
      return typeof FirebaseDatabasePlugin.prototype[p] === 'function';
    });
    keys.forEach(function(key) {
      dummyObj[key] = instance[key].bind(instance);
    });
    require('cordova/exec/proxy').add(options.id, dummyObj);

    resolve({
      'url': database.ref().toString()
    });
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
