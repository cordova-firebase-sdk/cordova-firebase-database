




var BaseClass = require('cordova-firebase-core.BaseClass'),
  FirebaseDatabasePlugin = require('./FirebaseDatabasePlugin'),
  utils = require('cordova/utils'),
  common = require('cordova-firebase-core.Common');


function CordovaFirebaseDatabase() {
  BaseClass.apply(this);
}
utils.extend(CordovaFirebaseDatabase, BaseClass);


CordovaFirebaseDatabase.prototype.newInstance = function(resolve, reject, args) {


  common.loadJsPromise({
    'url': 'https://www.gstatic.com/firebasejs/5.5.0/firebase-database.js',
    'package': 'firebase.database'
  })
  .then(function() {
    var options = args[0] || {};

    // Create a database instance
    console.log('--->[browser] CordovaFirebaseDatabase.newInstance() : ' + options.id);
    var app = window.plugin.firebase.app._APPs[options.appId];

    var database = firebase.database(app);

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
