import { exec } from "cordova";
// import { Promise } from "es6-promise";
import { nextTick, PluginBase } from "cordova-firebase-core/index";

declare let Promise: any;

/**
 * Parameters for execCmd function
 */
export interface IExecCmdParams {

  /**
   * Plugin's context
   */
  context: PluginBase;

  /**
   * Plugin's name in native side.
   * If omit this, context.id is used.
   */
  pluginName?: string;

  /**
   * Execute method name
   */
  methodName: string;

  /**
   * parameters for native side
   */
  args?: Array<any>;

  /**
   * synchronize options
   */
  execOptions?: {
    sync?: boolean;
    remove?: boolean;
  };

  [key: string]: any;
}

const commandQueue: Array<any> = [];
let isWaitMethod: string;
let isExecuting: boolean;
let executingCnt: number = 0;
const MAX_EXECUTE_CNT: number = 10;

let stopRequested: boolean = false;
window.addEventListener("unload", (): void => {
  stopRequested = true;
}, {
  once: true,
});

export const execCmd = (params: IExecCmdParams): Promise<any> => {
  params.execOptions = params.execOptions || {};
  params.args = params.args || [];
  params.pluginName = params.pluginName || params.context.id;

  // If the instance has been removed, do not execute any methods on it
  // except remove function itself.
  if (params.context.isRemoved && params.execOptions.remove) {
    console.error("[ignore]" + params.context.id + "." + params.methodName + ", because removed.");
    return Promise.resolve();
  }

  // If the overlay is not ready in native side,
  // do not execute any methods except remove on it.
  if (!params.context.isReady && !params.execOptions.remove) {
    console.error("[ignore]" + params.context.id + "." + params.methodName + ", because it's not ready.");
    return Promise.resolve();
  }

  return new Promise((resolve: (...params?: Array<any>) => void, reject: (...params?: Array<any>) => void) => {
    commandQueue.push({
      request: params,

      onSuccess: (...results: Array<any>): void => {
        // -------------------------------
        // success callback
        // -------------------------------

        // Even if the method was successful,
        // but the _stopRequested flag is true,
        // do not execute further code.
        if (!stopRequested) {
          resolve.apply(params.context, results);
        } else {
          // Page will be destroyed.
          return;
        }

        if (params.methodName === isWaitMethod) {
          isWaitMethod = null;
        }

        executingCnt--;
        nextTick(privateExec);
      },

      onError: (...results: Array<any>): void => {
        // -------------------------------
        // error callback
        // -------------------------------
        if (!stopRequested) {
          reject.apply(params.context, results);
        } else {
          // Page will be destroyed.
          return;
        }

        if (params.methodName === isWaitMethod) {
          isWaitMethod = null;
        }

        executingCnt--;
        nextTick(privateExec);
      },

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
    if (isExecuting || executingCnt >= MAX_EXECUTE_CNT || isWaitMethod || commandQueue.length === 0) {
      return;
    }

    privateExec();
  });
};


const privateExec = (): void => {

  // You probably wonder why there is this code because it's already simular code at the end of the execCmd function.
  //
  // Because the commandQueue might change after the last code of the execCmd.
  // (And yes, it was occurred.)
  // In order to block surely, block the execution again.
  if (isExecuting || executingCnt >= MAX_EXECUTE_CNT || isWaitMethod || commandQueue.length === 0) {
    return;
  }

  isExecuting = true;

  // Execute some execution requests (up to 10) from the commandQueue
  let task: any;
  while (commandQueue.length > 0 && executingCnt < MAX_EXECUTE_CNT) {
    if (!stopRequested) {
      executingCnt++;
    }

    // Pick up the head one.
    task = commandQueue.shift();

    // push out normal tasks if stopRequested becomes true
    if (stopRequested && !task.request.execOptions.remove) {
      executingCnt--;
      continue;
    }

    // Some methods have to block other execution requests.
    if (task.request.execOptions.sync) {
      isWaitMethod = task.request.methodName;
      // console.log(`[sync start] ${task.request.pluginName}.${task.request.methodName}`);
      exec(task.onSuccess, task.onError, task.request.pluginName, task.request.methodName, task.request.args);
      break;
    }

    // console.log(`[start] ${task.request.pluginName}.${task.request.methodName}`);
    exec(task.onSuccess, task.onError, task.request.pluginName, task.request.methodName, task.request.args);
  }

  isExecuting = false;
};
