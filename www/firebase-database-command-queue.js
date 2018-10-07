
/*****************************************************************************
 * Command queue mechanism
 * (Save the number of method executing at the same time)
 *****************************************************************************/
var cordova_exec = require('cordova/exec'),
  common = require('./Common');

var commandQueue = [];
var _isWaitMethod = null;
var _isExecuting = false;
var _executingCnt = 0;
var MAX_EXECUTE_CNT = 10;

// This flag becomes true when the page will be unloaded.
var _stopRequested = false;


function execCmd(success, error, pluginName, methodName, args, execOptions) {
  execOptions = execOptions || {};

  // The JavaScript special keyword 'this' indicates `who call this function`.
  // This execCmd function is executed from instances.
  // So `this` means `instance` instance.
  var instance = this;

  // If the overlay has been already removed from map,
  // do not execute any methods on it.
  if (instance._isRemoved && !execOptions.remove) {
    console.error('[ignore]' + pluginName + '.' + methodName + ', because removed.');
    return true;
  }

  // If the overlay is not ready in native side,
  // do not execute any methods except remove on it.
  // This code works for map class especially.
  if (!this._isReady && methodName !== 'remove') {
    console.error('[ignore]' + pluginName + '.' + methodName + ', because it\'s not ready.');
    return true;
  }

  // Push the method into the commandQueue(FIFO) at once.
  commandQueue.push({
    'execOptions': execOptions,
    'args': [
      function() {
        //-------------------------------
        // success callback
        //-------------------------------
        //console.log(`[success] ${pluginName}.${methodName}`);

        // Even if the method was successful,
        // but the _stopRequested flag is true,
        // do not execute further code.
        if (!_stopRequested && success) {
          var results = Array.prototype.slice.call(arguments, 0);
          common.nextTick(function() {
            success.apply(instance, results);
          });
        }

        if (methodName === _isWaitMethod) {
          _isWaitMethod = null;
        }

        _executingCnt--;
        common.nextTick(_exec);
      },
      function() {
        //console.log(`[error] ${pluginName}.${methodName}`);
        //-------------------------------
        // error callback
        //-------------------------------
        if (!_stopRequested && error) {
          var results = Array.prototype.slice.call(arguments, 0);
          common.nextTick(function() {
            error.apply(instance, results);
          });
        }

        if (methodName === _isWaitMethod) {
          _isWaitMethod = null;
        }
        _executingCnt--;
        common.nextTick(_exec);
      },
      pluginName, methodName, args]
  });

  // In order to execute all methods in safe,
  // the maps plugin limits the number of execution in a moment to 10.
  //
  // Note that Cordova-Android drops has also another internal queue,
  // and the internal queue drops our statement if the app send too much.
  //
  // Also executing too much statements at the same time,
  // it would cause many errors in native side, such as out-of-memory.
  //
  // In order to prevent these troubles, the maps plugin limits the number of execution is 10.
  if (_isExecuting || _executingCnt >= MAX_EXECUTE_CNT || _isWaitMethod || commandQueue.length === 0) {
    return;
  }
  common.nextTick(_exec);
}
function _exec() {

  // You probably wonder why there is this code because it's already simular code at the end of the execCmd function.
  //
  // Because the commandQueue might change after the last code of the execCmd.
  // (And yes, it was occurred.)
  // In order to block surely, block the execution again.
  if (_isExecuting || _executingCnt >= MAX_EXECUTE_CNT || _isWaitMethod || commandQueue.length === 0) {
    return;
  }
  _isExecuting = true;

  // Execute some execution requests (up to 10) from the commandQueue.
  var methodName;
  while (commandQueue.length > 0 && _executingCnt < MAX_EXECUTE_CNT) {
    if (!_stopRequested) {
      _executingCnt++;
    }

    // Pick up the head one.
    var commandParams = commandQueue.shift();
    methodName = commandParams.args[3];

    // If the `_stopRequested` flag is true,
    // do not execute any statements except `remove()` or `clear()` methods.
    if (_stopRequested && (!commandParams.execOptions.remove || methodName !== 'clear')) {
      _executingCnt--;
      continue;
    }

    // Some methods have to block other execution requests, such as `map.clear()`
    if (commandParams.execOptions.sync) {
      _isWaitMethod = methodName;
      //console.log(`[sync start] ${commandParams.args[2]}.${methodName}`);
      cordova_exec.apply(this, commandParams.args);
      break;
    }
    //console.log(`[start] ${commandParams.args[2]}.${methodName}`);
    cordova_exec.apply(this, commandParams.args);
  }

  _isExecuting = false;

}


//----------------------------------------------------
// Stop all executions if the page will be closed.
//----------------------------------------------------
function stopExecution() {
  // Request stop all tasks.
  _stopRequested = true;
}
window.addEventListener('unload', stopExecution);

module.exports = execCmd;
