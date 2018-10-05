
function registerPlugin(className, pluginId, args) {
  var classObj = require('cordova-firebase-database.' + className);
  var instance = new (classObj.bind.apply(classObj, args));
  var dummyObj = {};
  var keys = Object.getOwnPropertyNames(classObj.prototype).filter(function (p) {
    return typeof classObj.prototype[p] === 'function';
  });
  keys.forEach(function(key) {
    dummyObj[key] = instance[key].bind(instance);
  });

  require('cordova/exec/proxy').add(pluginId, dummyObj);
}

var nextTick = function(fn) { Promise.resolve().then(fn); };

module.exports = {
  nextTick: nextTick,
  registerPlugin: registerPlugin
};
