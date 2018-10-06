

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

var nextTick = function(fn) { Promise.resolve().then(fn); };

module.exports = {
  nextTick: nextTick,
  loadJsPromise: loadJsPromise
};
