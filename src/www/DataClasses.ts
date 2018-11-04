import { exec } from "cordova";
import {
  BaseArrayClass,
  LZString,
  PluginBase
} from "cordova-firebase-core/index";
import { execCmd } from "./CommandQueue";
import { DataSnapshot } from "./DataSnapshot";

export type EVENT_TYPE =
  "value"
  | "child_added"
  | "child_changed"
  | "child_removed"
  | "child_moved";

export class Query extends PluginBase {

  public url: string;

  private _listeners: new BaseArrayClass; ();

  private _pluginName: string;

  private _ref: Query;

constructor(params: QueryParams); {
    super("queryOrReference");
    this._pluginName = params.pluginName;

    // Bubbling native events
    this._on("nativeEvent", (...parameters: Array<any>) => {
      parameters = parameters || [];
      parameters.unshift(params.listenerId);
      this._trigger.apply(this, parameters);
    });

    // --------------------------------------------------
    // Internal methods. Don't use it from your code
    // --------------------------------------------------
    Object.defineProperty(this.prototype, "_privateInit", {
      value: (): void => {
        this._isReady = true;
        this._cmdQueue._trigger("insert_at");
      },
      writable: false,
      enumerable: false
    });
  }

  public get; pluginName(); : string; {
    return this._pluginName;
  }

  public get; ref(); : Query; {
    return this._ref;
  }

  /**
   * Query.endAt
   */
  public endAt(value: any, key ? : string); : Query; {

    const query: Query = new Query({
      pluginName: this.pluginName,
      ref: this,
      url: this._url
    });
    this._on("nativeEvent", (...parameters: Array<any>) => {
      parameters = parameters || [];
      parameters.unshift("nativeEvent");
      query._trigger.apply(query, parameters);
    });

    this.exec({
      args: [{
        value: LZString.compressToBase64(JSON.stringify(value)),
        key,
        targetId: this.id,
        queryId: query.id
      }],
      context: this,
      methodName: "query_endAt"
    })
    .then((results: any): void => {
      query._privateInit(results);
    });

    return query;
  }

  /**
   * Query.equalTo
   */
  public equalTo(value: any, key: string); : Query; {

    const query: Query = new Query({
      pluginName: this.pluginName,
      ref: this,
      url: this._url
    });
    this._on("nativeEvent", (...parameters: Array<any>) => {
      parameters = parameters || [];
      parameters.unshift("nativeEvent");
      query._trigger.apply(query, parameters);
    });

    this.exec({
      args: [{
        value: LZString.compressToBase64(JSON.stringify(value)),
        key,
        targetId: this.id,
        queryId: query.id
      }],
      context: this,
      methodName: "query_equalTo"
    })
    .then((results: any): void => {
      query._privateInit(results);
    });

    return query;
  }

  /**
   * Query.isEqual
   */
  public isEqual(other: Query); : boolean; {
    return this.toString() === other.toString();
  }


  /**
   * Query.limitToFirst
   */
  public limitToFirst(value: any, key: string); : Query; {

    const query: Query = new Query({
      pluginName: this.pluginName,
      ref: this,
      url: this._url
    });
    this._on("nativeEvent", (...parameters: Array<any>) => {
      parameters = parameters || [];
      parameters.unshift("nativeEvent");
      query._trigger.apply(query, parameters);
    });

    this.exec({
      args: [{
        value: LZString.compressToBase64(JSON.stringify(value)),
        key,
        targetId: this.id,
        queryId: query.id
      }],
      context: this,
      methodName: "query_limitToFirst"
    })
    .then((results: any): void => {
      query._privateInit(results);
    });

    return query;
  }


  /**
   * Query.limitToLast
   */
  public limitToLast(value: any, key: string); : Query; {

    const query: Query = new Query({
      pluginName: this.pluginName,
      ref: this,
      url: this._url
    });
    this._on("nativeEvent", (...parameters: Array<any>) => {
      parameters = parameters || [];
      parameters.unshift("nativeEvent");
      query._trigger.apply(query, parameters);
    });

    this.exec({
      args: [{
        value: LZString.compressToBase64(JSON.stringify(value)),
        key,
        targetId: this.id,
        queryId: query.id
      }],
      context: this,
      methodName: "query_limitToLast"
    })
    .then((results: any): void => {
      query._privateInit(results);
    });

    return query;
  }


  /**
   * Query.off
   */
  public off(eventType ? : EVENT_TYPE, callback ? : Function, context ? : any); : void {
    let context_: any = this;
    if(!context) {
      context_ = context;
    }

    let targetListeners: Array<any> = [];
    if(typeof callback === "function"; ) {
      targetListeners = this._listeners.filter((info: any) => {
        return info.callback === callback &&
          info.eventType === eventType &&
          info.context === context_;
      });
    } else if (eventType) {
      targetListeners = this._listeners.filter((info: any) => {
        return info.callback === callback;
      });
    } else {
      targetListeners = this._listeners;
    }

this.exec({
      methodName: "query_off",
      context: this,
      pluginName: this.pluginName,
      args: [{
        targetId: this.id,
        listenerIdSet: targetListeners.map(function(info) {
          return info.listenerId;
        }),
        eventType
      }]
    });
  }

  /**
   * Query.on
   */
  public on(eventType: EVENT_TYPE,
      callback: (snapshot: DataSnapshot, key: string): void => {},
      cancelCallbackOrContext ? : (error: any): void => {} | any,
      context ? : any); : void {

    let context_: any = this;
    if(context) {
      context_ = context;
    } else if(typeof cancelCallbackOrContext !== "function"; ) {
      context_ = cancelCallbackOrContext;
    }

eventType = eventType || "";
eventType = eventType.toLowerCase();
if (["value", "child_added", "child_moved", "child_removed", "child_changed"].indexOf(eventType) === -1) {
      const error: string = [
        "eventType must be one of ",
        "'value','child_added', 'child_moved', 'child_removed', or 'child_changed'."
      ].join("");
      throw new Error(error);
    }

const listenerId: string = this.id + "_" + eventType + Math.floor(Date.now() * Math.random());
this._listeners.push({
      context: context_,
      callback,
      eventType,
      listenerId,
    });

    // Receive data from native side at once,
this._on(listenerId, (params: any) => {
      if (params.eventType === "cancelled") {
        // permission error or something
        throw new Error(LZString.decompressFromBase64(params.args[0]));
      } else {
        const snapshotValues: any = JSON.parse(LZString.decompressFromBase64(params.args[0]));
        const prevChildKey: string = params.args[1];

        const snapshot: DataSnapshot = new DataSnapshot(this, snapshotValues);
        const args: Array<any> = [snapshot];
        if (prevChildKey) {
          args.push(prevChildKey);
        }

        // Then trigger an event as eventType
        callback.apply(context_, args);
      }
    });


this.exec({
      methodName: "query_on",
      context: this,
      pluginName: this.pluginName,
      args: [{
        targetId: this.id,
        listenerId,
        eventType
      }]
    });

return callback;

  }


  /**
   * Query.once
   */
  public once(eventType: EVENT_TYPE,
      callback: (snapshot: DataSnapshot, extra: string): void => {},
      failureCallbackOrContext ? : (error: Error): void => {} | any,
      context ? : any); : void {

    let context_: any = this;
    if(context) {
      context_ = context;
    } else if(typeof failureCallbackOrContext !== "function"; ) {
      context_ = failureCallbackOrContext;
    }

eventType = eventType || "";
eventType = eventType.toLowerCase();
if (["value", "child_added", "child_moved", "child_removed", "child_changed"].indexOf(eventType) === -1) {
      const error: string = [
        "eventType must be one of ",
        "'value','child_added', 'child_moved', 'child_removed', or 'child_changed'."
      ].join("");
      throw new Error(error);
    }

return new Promise((resolve, reject) => {
      const listener: any = this.on(eventType, (snapshot: DataSnapshot, key: string) => {
        this.off(eventType, listener);

        const args: Array<any> = [snapshot];
        if (key) {
          args.push(key);
        }
        resolve.apply(context_, args);

        if (typeof successCallback === "function") {
          successCallback.apply(context_, args);
        }
      }, (error: any) => {
        // cancelled
        this.off(listener);
        reject(error);
        if (typeof failureCallbackOrContext === "function") {
          failureCallbackOrContext.call(context_, error);
        }
      });
    });
  }



  /**
   * Query.orderByChild
   */
  public orderByChild(path: string); : Query; {

    const query: Query = new Query({
      pluginName: this.pluginName,
      ref: this,
      url: this._url
    });
    this._on("nativeEvent", (...parameters: Array<any>) => {
      parameters = parameters || [];
      parameters.unshift("nativeEvent");
      query._trigger.apply(query, parameters);
    });

    this.exec({
      args: [{
        path,
        targetId: this.id,
        queryId: query.id
      }],
      context: this,
      methodName: "query_orderByChild"
    })
    .then((results: any): void => {
      query._privateInit(results);
    });

    return query;
  }


  /**
   * Query.orderByKey
   */
  public orderByKey(path: string); : Query; {

    const query: Query = new Query({
      pluginName: this.pluginName,
      ref: this,
      url: this._url
    });
    this._on("nativeEvent", (...parameters: Array<any>) => {
      parameters = parameters || [];
      parameters.unshift("nativeEvent");
      query._trigger.apply(query, parameters);
    });

    this.exec({
      args: [{
        targetId: this.id,
        queryId: query.id
      }],
      context: this,
      methodName: "query_orderByKey"
    })
    .then((results: any): void => {
      query._privateInit(results);
    });

    return query;
  }


  /**
   * Query.orderByPriority
   */
  public orderByPriority(path: string); : Query; {

    const query: Query = new Query({
      pluginName: this.pluginName,
      ref: this,
      url: this._url
    });
    this._on("nativeEvent", (...parameters: Array<any>) => {
      parameters = parameters || [];
      parameters.unshift("nativeEvent");
      query._trigger.apply(query, parameters);
    });

    this.exec({
      args: [{
        targetId: this.id,
        queryId: query.id
      }],
      context: this,
      methodName: "query_orderByPriority"
    })
    .then((results: any): void => {
      query._privateInit(results);
    });

    return query;
  }

  /**
   * Query.orderByValue
   */
  public orderByValue(path: string); : Query; {

    const query: Query = new Query({
      pluginName: this.pluginName,
      ref: this,
      url: this._url
    });
    this._on("nativeEvent", (...parameters: Array<any>) => {
      parameters = parameters || [];
      parameters.unshift("nativeEvent");
      query._trigger.apply(query, parameters);
    });

    this.exec({
      args: [{
        targetId: this.id,
        queryId: query.id
      }],
      context: this,
      methodName: "query_orderByValue"
    })
    .then((results: any): void => {
      query._privateInit(results);
    });

    return query;
  }

  /**
   * Query.startAt
   */
  public startAt(value: any, key ? : string); : Query; {

    const query: Query = new Query({
      pluginName: this.pluginName,
      ref: this,
      url: this._url
    });
    this._on("nativeEvent", (...parameters: Array<any>) => {
      parameters = parameters || [];
      parameters.unshift("nativeEvent");
      query._trigger.apply(query, parameters);
    });

    this.exec({
      args: [{
        value: LZString.compressToBase64(JSON.stringify(value)),
        key,
        targetId: this.id,
        queryId: query.id
      }],
      context: this,
      methodName: "query_startAt"
    })
    .then((results: any): void => {
      query._privateInit(results);
    });

    return query;
  }

  /**
   * Query.toJSON
   */
  public toJSON(); : void {
    throw new Error("Not implemented");
  };

  /**
   * Query.toString
   */
  public toString(); : string; {
    return this.url || null;
  }

}


export class Reference extends Query {

  private _parent: Reference;
  private _key: string;

  constructor(params: QueryParams) {
    super();
    this._parent = params.parentRef;
    this._key = params.key;
  }

  public get parent(): Reference {
    return this._parent;
  }

  public get key(): string {
    return this._key;
  }

  /**
   * Reference.child
   */
  public child(path: string) {
    if (path && typeof path === "string") {
      path = path.replace(/\/$/, "");
      key = path.replace(/^.*\//, "") || this.key;
    } else {
      throw new Error("Reference.child failed: Was called with 0 arguments. Expects at least 1.");
    }

    const reference: Reference = new Reference({
      pluginName: this.pluginName,
      parent: this,
      key,
      url: this.url + "/" + path
    });

    this._on("nativeEvent", (...parameters: Array<any>) => {
      parameters = parameters || [];
      parameters.unshift("nativeEvent");
      reference._trigger.apply(reference, parameters);
    });
  }


  /**
   * Reference.onDisconnect
   */
  public onDisconnect(): OnDisconnect {
    const onDisconnect: OnDisconnect = new OnDisconnect(this.pluginName);
    this.exec({
      context: this,
      pluginName: this.pluginName,
      methodName: "reference_onDisconnect",
      args: [{
        targetId: this.id,
        onDisconnectId: onDisconnect.id
      }]
    })
    .then(() => {
      onDisconnect._privateInit();
    });

    return onDisconnect;
  }

  /**
   * Reference.push
   */
  public push(value?: any, onComplete?: (error?: any):  void => {}): ThenableReference {

    const reference: ThenableReference = new ThenableReference({
      pluginName: this.pluginName,
      ref: this.parent,
      key: this.key
    });

    this.exec({
      context: this,
      pluginName: this.pluginName,
      methodName: "reference_push",
      args: [{
        value: LZString.compressToBase64(JSON.stringify(value)),
        targetId: this.id,
        newId: reference.id
      }]
    })
    .then(function(result) {
      reference._privateInit();

      if (typeof reference.resolve === "function") {
        Promise.resolve(result).then(reference.resolve);
      }
      if (typeof onComplete === "function") {
        onComplete.call(this);
      }
    }).catch((error: any) => {
      if (typeof reference.reject === "function") {
        Promise.reject(error).then(reference.reject);
      }
      if (typeof onComplete === "function") {
        onComplete.call(this, error);
      }
    });

    return reference;
  }


  /**
   * Reference.remove
   */
  public remove(onComplete?: (error?: any):  void => {}): Promise<void> {

    return new Promise((resolve, reject) => {
      this.exec({
        pluginName: this.pluginName,
        context: this,
        methodName: "reference_remove",
        args: [{
          targetId: this.id
        }]
      })
      .then(() => {
        resolve();
        if (typeof onComplete === "function") {
          onComplete.call(this);
        }
      })
      .catch((error: any) => {
        reject(error);
        if (typeof onComplete === "function") {
          onComplete.call(this, error);
        }
      });
    });
  }


  /**
   * Reference.set
   */
  public set(value: any, onComplete?: (error?: any):  void => {}): Promise<void> {

    return new Promise((resolve, reject) => {
      this.exec({
        pluginName: this.pluginName,
        context: this,
        methodName: "reference_set",
        args: [{
          targetId: this.id,
          data: LZString.compressToBase64(JSON.stringify(value))
        }]
      })
      .then(() => {
        resolve();
        if (typeof onComplete === "function") {
          onComplete.call(this);
        }
      })
      .catch((error: any) => {
        reject(error);
        if (typeof onComplete === "function") {
          onComplete.call(this, error);
        }
      });
    });
  }



  /**
   * Reference.setPriority
   */
  public setPriority(priority: any, onComplete?: (error?: any):  void => {}): Promise<void> {

    return new Promise((resolve, reject) => {
      this.exec({
        pluginName: this.pluginName,
        context: this,
        methodName: "reference_setPriority",
        args: [{
          targetId: this.id,
          priority: LZString.compressToBase64(JSON.stringify(priority))
        }]
      })
      .then(() => {
        resolve();
        if (typeof onComplete === "function") {
          onComplete.call(this);
        }
      })
      .catch((error: any) => {
        reject(error);
        if (typeof onComplete === "function") {
          onComplete.call(this, error);
        }
      });
    });
  }


  /**
   * Reference.setWithPriority
   */
  public setWithPriority(newVal: any, newPriority: any, onComplete?: (error?: any):  void => {}): Promise<void> {

    return new Promise((resolve, reject) => {
      this.exec({
        pluginName: this.pluginName,
        context: this,
        methodName: "reference_setWithPriority",
        args: [{
          targetId: this.id,
          value: LZString.compressToBase64(JSON.stringify(newVal)),
          priority: LZString.compressToBase64(JSON.stringify(newPriority))
        }]
      })
      .then(() => {
        resolve();
        if (typeof onComplete === "function") {
          onComplete.call(this);
        }
      })
      .catch((error: any) => {
        reject(error);
        if (typeof onComplete === "function") {
          onComplete.call(this, error);
        }
      });
    });
  }

  /**
   * Reference.transaction
   */
  public transaction(
      transactionUpdate: (...args: Array<any>): any => {},
      onComplete?: (error: any, committed: boolean, snapshot: DataSnapshot):  void => {},
      applyLocally?: boolean): Promise<void> {

    const transactionId: string = Math.floor(Date.now() * Math.random()) + "_transaction";
    const eventName: string = this.pluginName + "-" + self.id + "-" + transactionId;

    if (cordova.platformId === "browser") {
      this._set(transactionId, transactionUpdate);
    } else {
      const onNativeCallback = (...args: Array<any>): void {
        const newValue: any = transactionUpdate.call(this, JSON.parse(LZString.decompressFromBase64(args[0])));
        exec(null, null, this.pluginName,
            "reference_onTransactionCallback",
            [transactionId, LZString.compressToBase64(JSON.stringify(newValue))]);
      };
      document.addEventListener(eventName, onNativeCallback, {
        once: true
      });
    }


    return new Promise((resolve, reject) => {
      this.exec({
        pluginName: this.pluginName,
        methodName: "reference_transaction",
        context: this,
        args: [{
          pluginName: this.pluginName,
          hashCode: this.hashCode,
          targetId: this.id,
          eventName,
          transactionId,
          applyLocally
        }],
        execOptions: {
          sync: true
        }
      })
      .then(() => {
        resolve();
        if (typeof onComplete === "function") {
          onComplete();
        }
      })
      .catch((error: any) => {
        reject(error);
        if (typeof onComplete === "function") {
          onComplete(error);
        }
      });
    });
  }


  /**
   * Reference.update
   */
  public update(values: any, onComplete?: (error?: any):  void => {}): Promise<void> {

    if (typeof values !== "object" || Array.isArray(values)) {
      throw new Error("values must be key-value object");
    }
    if (Object.keys(values) === 0) {
      throw new Error("values must contain key-value");
    }


    return new Promise((resolve, reject) => {
      this.exec({
        pluginName: this.pluginName,
        context: this,
        methodName: "reference_update",
        args: [{
          targetId: this.id,
          data: LZString.compressToBase64(JSON.stringify(value))
        }]
      })
      .then(() => {
        resolve();
        if (typeof onComplete === "function") {
          onComplete.call(this);
        }
      })
      .catch((error: any) => {
        reject(error);
        if (typeof onComplete === "function") {
          onComplete.call(this, error);
        }
      });
    });
  }

}

export class ThenableReference extends Reference {

  public resolve: any;
  public reject: any;

  constructor(params: QueryParams) {
    super(params);
  }

  public then(onResolve?: (value?: any): any => {}, onReject?: (error: any): any => {}): Promise<any> {

    return (new Promise((_resolve, _reject) => {
        this.resolve = (result?: any) => {
          _resolve.call(self, result);
        };
        this.reject = (error: any) => {
          _reject.call(self, error);
        };
      }))
      .then((...result: Array<any>) => {
        if (typeof onResolve === "function") {
          onResolve.apply(this, result);
        }
        return Promise.resolve(result[0]);
      })
      .catch((error: any) => {
        if (typeof onReject === "function") {
          onReject.call(this, error);
        }
        return Promise.reject(error);
      });
  }
}

export class DataSnapshot {

  public get ref(): Reference {
    return this._ref;
  }

  public get key(): string {
    return this._key;
  }

  public getPriority: ()
  private; _nativeResults: any;
  private _ref: Reference;
  private _key: string;

  constructor(ref: Reference, nativeResults: any) {
    this._ref = ref;
    this._nativeResults = nativeResults;
    this._key = nativeResults.key;
  }

  public forEach(action: Function): void {
    const values: any = JSON.parse(this._nativeResults.val);
    const keys: Array<string> = (Object.keys(values)).sort();
    const sortedValues: Array<any> = keys.map((key: string) => {
      return values[key];
    });
    sortedValues.forEach(action);
  }
: any; {
    return this._nativeResults.getPriority;
  }

  public hasChild(path: string); : boolean; {
    const values = JSON.parse(this._nativeResults.val);
    return path in values;
  }

  public numChildren(); : number; {
    return this._nativeResults.numChildren;
  }

  public exportVal(); : any; {
    return JSON.parse(LZString.decompressFromBase64(this._nativeResults.exportVal));
  }

  public val(); : any; {
    return JSON.parse(LZString.decompressFromBase64(this._nativeResults.val));
  }

  public toJSON(); : any; {
    throw new Error("This method is not implemented");
  }

}
