import { exec } from "cordova";
import { BaseArrayClass, LZString, PluginBase } from "cordova-firebase-core/index";
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

  private _cmdQueue: BaseArrayClass = new BaseArrayClass();

  private _listeners: BaseArrayClass = new BaseArrayClass();

  private _pluginName: string;

  private _ref: Query;

  constructor(params: QueryParams) {
    super("queryOrReference");
    this._pluginName = params.pluginName;

    // Bubbling native events
    this._on("nativeEvent", (...parameters: Array<any>): void => {
      parameters = parameters || [];
      parameters.unshift(params.listenerId);
      this._trigger.apply(this, parameters);
    });


    this._queue._on("insert_at", (): void => {
      if (!this._isReady) {
        return;
      }
      if (this._queue._getLength() > 0) {
        const cmd: any = this._queue._removeAt(0, true);
        if (cmd && cmd.context && cmd.methodName) {
          execCmd(cmd).then(cmd.resolve).catch(cmd.reject);
        }
      }
      if (this._queue._getLength() > 0) {
        this._queue._trigger("insert_at");
      }
    });

    // --------------------------------------------------
    // Internal methods. Don't use it from your code
    // --------------------------------------------------
    Object.defineProperty(this.prototype, "_privateInit", {
      enumerable: false,
      value: (): void => {
        this._isReady = true;
        this._cmdQueue._trigger("insert_at");
      },
      writable: false,
    });
  }

  public get pluginName(): string {
    return this._pluginName;
  }

  public get ref(): Query {
    return this._ref;
  }

  /**
   * Query.endAt
   */
  public endAt(value: any, key?: string): Query {

    const query: Query = new Query({
      pluginName: this.pluginName,
      ref: this,
      url: this._url,
    });
    this._on("nativeEvent", (...parameters: Array<any>) => {
      parameters = parameters || [];
      parameters.unshift("nativeEvent");
      query._trigger.apply(query, parameters);
    });

    this.exec({
      args: [{
        key,
        queryId: query.id,
        targetId: this.id,
        value: LZString.compressToBase64(JSON.stringify(value)),
      }],
      context: this,
      methodName: "query_endAt",
    })
    .then((results: any): void => {
      query._privateInit(results);
    });

    return query;
  }

  /**
   * Query.equalTo
   */
  public equalTo(value: any, key: string): Query {

    const query: Query = new Query({
      pluginName: this.pluginName,
      ref: this,
      url: this._url,
    });
    this._on("nativeEvent", (...parameters: Array<any>): void => {
      parameters = parameters || [];
      parameters.unshift("nativeEvent");
      query._trigger.apply(query, parameters);
    });

    this.exec({
      args: [{
        key,
        queryId: query.id,
        targetId: this.id,
        value: LZString.compressToBase64(JSON.stringify(value)),
      }],
      context: this,
      methodName: "query_equalTo",
    })
    .then((results: any): void => {
      query._privateInit(results);
    });

    return query;
  }

  /**
   * Query.isEqual
   */
  public isEqual(other: Query): boolean {
    return this.toString() === other.toString();
  }


  /**
   * Query.limitToFirst
   */
  public limitToFirst(value: any, key: string): Query {

    const query: Query = new Query({
      pluginName: this.pluginName,
      ref: this,
      url: this._url,
    });
    this._on("nativeEvent", (...parameters: Array<any>): void => {
      parameters = parameters || [];
      parameters.unshift("nativeEvent");
      query._trigger.apply(query, parameters);
    });

    this.exec({
      args: [{
        key,
        queryId: query.id,
        targetId: this.id,
        value: LZString.compressToBase64(JSON.stringify(value)),
      }],
      context: this,
      methodName: "query_limitToFirst",
    })
    .then((results: any): void => {
      query._privateInit(results);
    });

    return query;
  }


  /**
   * Query.limitToLast
   */
  public limitToLast(value: any, key: string): Query {

    const query: Query = new Query({
      pluginName: this.pluginName,
      ref: this,
      url: this._url,
    });
    this._on("nativeEvent", (...parameters: Array<any>): void => {
      parameters = parameters || [];
      parameters.unshift("nativeEvent");
      query._trigger.apply(query, parameters);
    });

    this.exec({
      args: [{
        key,
        queryId: query.id,
        targetId: this.id,
        value: LZString.compressToBase64(JSON.stringify(value)),
      }],
      context: this,
      methodName: "query_limitToLast",
    })
    .then((results: any): void => {
      query._privateInit(results);
    });

    return query;
  }


  /**
   * Query.off
   */
  public off(
    eventType?: EVENT_TYPE,
    callback?: (snapshot: DataSnapshot, key: string): => void,
    context?: any): void {

    let context_: any = this;
    if (!context) {
      context_ = context;
    }

    let targetListeners: Array<any> = [];
    if (typeof callback === "function") {
      targetListeners = this._listeners.filter((info: any): boolean => {
        return info.callback === callback &&
          info.eventType === eventType &&
          info.context === context_;
      });
    } else if (eventType) {
      targetListeners = this._listeners.filter((info: any): boolean => {
        return info.callback === callback;
      });
    } else {
      targetListeners = this._listeners;
    }

    this.exec({
      args: [{
        eventType,
        listenerIdSet: targetListeners.map((info: any): string => {
          return info.listenerId;
        }),
        targetId: this.id,
      }],
      context: this,
      methodName: "query_off",
      pluginName: this.pluginName,
    });
  }

  /**
   * Query.on
   */
  public on(eventType: EVENT_TYPE,
            callback: (snapshot: DataSnapshot, key: string): => void,
            cancelCallbackOrContext?: (error: any): => void | any,
            context?: any): void {

    let context_: any = this;
    if (context) {
      context_ = context;
    } else if (typeof cancelCallbackOrContext !== "function") {
      context_ = cancelCallbackOrContext;
    }

    eventType = eventType || "";
    eventType = eventType.toLowerCase();
    if (["value", "child_added", "child_moved", "child_removed", "child_changed"].indexOf(eventType) === -1) {
      const error: string = [
        "eventType must be one of ",
        "'value','child_added', 'child_moved', 'child_removed', or 'child_changed'.",
      ].join("");
      throw new Error(error);
    }

    const listenerId: string = this.id + "_" + eventType + Math.floor(Date.now() * Math.random());
    this._listeners.push({
      callback,
      context: context_,
      eventType,
      listenerId,
    });

    // Receive data from native side at once,
    this._on(listenerId, (params: any): void => {
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
      args: [{
        eventType,
        listenerId,
        targetId: this.id,
      }],
      context: this,
      methodName: "query_on",
      pluginName: this.pluginName,
    });

    return callback;

  }


  /**
   * Query.once
   */
  public once(eventType: EVENT_TYPE,
              callback: (snapshot: DataSnapshot, extra: string): => void,
              failureCallbackOrContext?: (error: Error): => {} | any,
              context?: any): void {

    let context_: any = this;
    if (context) {
      context_ = context;
    } else if (typeof failureCallbackOrContext !== "function") {
      context_ = failureCallbackOrContext;
    }

    eventType = eventType || "";
    eventType = eventType.toLowerCase();
    if (["value", "child_added", "child_moved", "child_removed", "child_changed"].indexOf(eventType) === -1) {
      const error: string = [
        "eventType must be one of ",
        "'value','child_added', 'child_moved', 'child_removed', or 'child_changed'.",
      ].join("");
      throw new Error(error);
    }

    return new Promise((resolve: (...params: Array<any>) => void, reject: (error: any) => void): void => {
      const listener: any = this.on(eventType, (snapshot: DataSnapshot, key: string): void => {
        this.off(eventType, listener);

        const args: Array<any> = [snapshot];
        if (key) {
          args.push(key);
        }
        resolve.apply(context_, args);

        if (typeof successCallback === "function") {
          successCallback.apply(context_, args);
        }
      }, (error: any): void => {
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
  public orderByChild(path: string): Query {

    const query: Query = new Query({
      pluginName: this.pluginName,
      ref: this,
      url: this._url,
    });
    this._on("nativeEvent", (...parameters: Array<any>): void => {
      parameters = parameters || [];
      parameters.unshift("nativeEvent");
      query._trigger.apply(query, parameters);
    });

    this.exec({
      args: [{
        path,
        queryId: query.id,
        targetId: this.id,
      }],
      context: this,
      methodName: "query_orderByChild",
    })
    .then((results: any): void => {
      query._privateInit(results);
    });

    return query;
  }


  /**
   * Query.orderByKey
   */
  public orderByKey(path: string): Query {

    const query: Query = new Query({
      pluginName: this.pluginName,
      ref: this,
      url: this._url,
    });
    this._on("nativeEvent", (...parameters: Array<any>): void => {
      parameters = parameters || [];
      parameters.unshift("nativeEvent");
      query._trigger.apply(query, parameters);
    });

    this.exec({
      args: [{
        queryId: query.id,
        targetId: this.id,
      }],
      context: this,
      methodName: "query_orderByKey",
    })
    .then((results: any): void => {
      query._privateInit(results);
    });

    return query;
  }


  /**
   * Query.orderByPriority
   */
  public orderByPriority(path: string): Query {

    const query: Query = new Query({
      pluginName: this.pluginName,
      ref: this,
      url: this._url,
    });
    this._on("nativeEvent", (...parameters: Array<any>): void => {
      parameters = parameters || [];
      parameters.unshift("nativeEvent");
      query._trigger.apply(query, parameters);
    });

    this.exec({
      args: [{
        queryId: query.id,
        targetId: this.id,
      }],
      context: this,
      methodName: "query_orderByPriority",
    })
    .then((results: any): void => {
      query._privateInit(results);
    });

    return query;
  }

  /**
   * Query.orderByValue
   */
  public orderByValue(path: string): Query {

    const query: Query = new Query({
      pluginName: this.pluginName,
      ref: this,
      url: this._url,
    });
    this._on("nativeEvent", (...parameters: Array<any>): void => {
      parameters = parameters || [];
      parameters.unshift("nativeEvent");
      query._trigger.apply(query, parameters);
    });

    this.exec({
      args: [{
        queryId: query.id,
        targetId: this.id,
      }],
      context: this,
      methodName: "query_orderByValue",
    })
    .then((results: any): void => {
      query._privateInit(results);
    });

    return query;
  }

  /**
   * Query.startAt
   */
  public startAt(value: any, key?: string): Query {

    const query: Query = new Query({
      pluginName: this.pluginName,
      ref: this,
      url: this._url,
    });
    this._on("nativeEvent", (...parameters: Array<any>): void => {
      parameters = parameters || [];
      parameters.unshift("nativeEvent");
      query._trigger.apply(query, parameters);
    });

    this.exec({
      args: [{
        key,
        queryId: query.id,
        targetId: this.id,
        value: LZString.compressToBase64(JSON.stringify(value)),
      }],
      context: this,
      methodName: "query_startAt",
    })
    .then((results: any): void => {
      query._privateInit(results);
    });

    return query;
  }

  /**
   * Query.toJSON
   */
  public toJSON(): void {
    throw new Error("Not implemented");
  }

  /**
   * Query.toString
   */
  public toString(): string {
    return this.url || null;
  }

  private exec(params: IExecCmdParams): Promise<any> {
    return new Promise((resolve: (result: any) => void, reject: (error: any) => void) => {
      params.resolve = resolve;
      params.reject = reject;
      this._queue._push(params);
    });
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
  public child(path: string): Reference {
    if (path && typeof path === "string") {
      path = path.replace(/\/$/, "");
      key = path.replace(/^.*\//, "") || this.key;
    } else {
      throw new Error("Reference.child failed: Was called with 0 arguments. Expects at least 1.");
    }

    const reference: Reference = new Reference({
      key,
      parent: this,
      pluginName: this.pluginName,
      url: this.url + "/" + path,
    });

    this._on("nativeEvent", (...parameters: Array<any>): void => {
      parameters = parameters || [];
      parameters.unshift("nativeEvent");
      reference._trigger.apply(reference, parameters);
    });

    this.exec({
      args: [{
        childId: reference.id,
        path: path,
        targetId: this.id,
      }],
      context: this,
      methodName: "reference_child",
      pluginName: this.pluginName,
    })
    .then((): void => {
      reference._privateInit();
    });

    return reference;
  }


  /**
   * Reference.onDisconnect
   */
  public onDisconnect(): OnDisconnect {
    const onDisconnect: OnDisconnect = new OnDisconnect(this.pluginName);
    this.exec({
      args: [{
        onDisconnectId: onDisconnect.id,
        targetId: this.id,
      }],
      context: this,
      methodName: "reference_onDisconnect",
      pluginName: this.pluginName,
    })
    .then(() => {
      onDisconnect._privateInit();
    });

    return onDisconnect;
  }

  /**
   * Reference.push
   */
  public push(value?: any, onComplete?: (error?: any) => void): ThenableReference {

    const reference: ThenableReference = new ThenableReference({
      key: this.key,
      pluginName: this.pluginName,
      ref: this.parent,
    });

    this.exec({
      args: [{
        newId: reference.id
        targetId: this.id,
        value: LZString.compressToBase64(JSON.stringify(value)),
      }],
      context: this,
      methodName: "reference_push",
      pluginName: this.pluginName,
    })
    .then((result: any): void => {
      reference._privateInit();

      if (typeof reference.resolve === "function") {
        Promise.resolve(result).then(reference.resolve);
      }
      if (typeof onComplete === "function") {
        onComplete.call(this);
      }
    }).catch((error: any): void => {
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
  public remove(onComplete?: (error?: any) => void): Promise<void> {

    return new Promise((resolve: () => void, reject: (error: any) => void) => {
      this.exec({
        args: [{
          targetId: this.id,
        }],
        context: this,
        methodName: "reference_remove",
        pluginName: this.pluginName,
      })
      .then((): void => {
        resolve();
        if (typeof onComplete === "function") {
          onComplete.call(this);
        }
      })
      .catch((error: any): void => {
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
  public set(value: any, onComplete?: (error?: any) => void): Promise<void> {

    return new Promise((resolve: () => void, reject: (error: any) => void) => {
      this.exec({
        args: [{
          data: LZString.compressToBase64(JSON.stringify(value)),
          targetId: this.id,
        }],
        context: this,
        methodName: "reference_set",
        pluginName: this.pluginName,
      })
      .then((): void => {
        resolve();
        if (typeof onComplete === "function") {
          onComplete.call(this);
        }
      })
      .catch((error: any): void => {
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
  public setPriority(priority: any, onComplete?: (error?: any) => void): Promise<void> {

    return new Promise((resolve: () => void, reject: (error: any) => void) => {
      this.exec({
        args: [{
          priority: LZString.compressToBase64(JSON.stringify(priority)),
          targetId: this.id,
        }],
        context: this,
        methodName: "reference_setPriority",
        pluginName: this.pluginName,
      })
      .then((): void => {
        resolve();
        if (typeof onComplete === "function") {
          onComplete.call(this);
        }
      })
      .catch((error: any): void => {
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
  public setWithPriority(newVal: any, newPriority: any, onComplete?: (error?: any) => void): Promise<void> {

    return new Promise((resolve: () => void, reject: (error: any) => void): void => {
      this.exec({
        args: [{
          priority: LZString.compressToBase64(JSON.stringify(newPriority)),
          targetId: this.id,
          value: LZString.compressToBase64(JSON.stringify(newVal)),
        }],
        context: this,
        methodName: "reference_setWithPriority",
        pluginName: this.pluginName,
      })
      .then((): void => {
        resolve();
        if (typeof onComplete === "function") {
          onComplete.call(this);
        }
      })
      .catch((error: any): void => {
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
      transactionUpdate: (currentValue: any) => any,
      onComplete?: (error: any, committed: boolean, snapshot: DataSnapshot) => void,
      applyLocally?: boolean): Promise<void> {

    const transactionId: string = Math.floor(Date.now() * Math.random()) + "_transaction";
    const eventName: string = this.pluginName + "-" + self.id + "-" + transactionId;

    if (cordova.platformId === "browser") {
      // ------------------------
      //       Browser
      // ------------------------
      return new Promise((resolve: () => void, reject: (error: any) => void): void => {
        const proxy: any = require("cordova/exec/proxy");
        const fbDbPlugin: any = proxy.get(this.pluginName);
        const ref: any = fbDbPlugin._get(this.id);
        ref.transaction(transactionUpdate, (error: any, committed: boolean, snapshot: any): void => {

          if (error) {
            onComplete(error, committed);
          } else {
            const dataSnapshot: DataSnapshot = new DataSnapshot(this, {
              exists: snapshot.exists(),
              exportVal: LZString.compressToBase64(JSON.stringify(snapshot.exportVal())),
              key: snapshot.key,
              getPriority: LZString.compressToBase64(snapshot.getPriority()),
              numChildren: snapshot.numChildren(),
              val: LZString.compressToBase64(JSON.stringify(snapshot.val()))
            });
            onComplete(null, committed, dataSnapshot);
          }
        }, applyLocally);
      });

    }
    // ------------------------
    //    Android, iOS
    // ------------------------
    const onNativeCallback = (...args: Array<any>): void {
      const newValue: any = transactionUpdate.call(this, JSON.parse(LZString.decompressFromBase64(args[0])));
      exec(null, null, this.pluginName,
          "reference_onTransactionCallback",
          [transactionId, LZString.compressToBase64(JSON.stringify(newValue))]);
    };
    document.addEventListener(eventName, onNativeCallback, {
      once: true,
    });


    return new Promise((resolve: () => void, reject: (error: any) => void): void => {
      this.exec({
        args: [{
          applyLocally,
          eventName,
          hashCode: this.hashCode,
          pluginName: this.pluginName,
          targetId: this.id,
          transactionId,
        }],
        context: this,
        execOptions: {
          sync: true,
        },
        methodName: "reference_transaction",
        pluginName: this.pluginName,
      })
      .then((): void => {
        resolve();
        if (typeof onComplete === "function") {
          onComplete();
        }
      })
      .catch((error: any): void => {
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
  public update(values: any, onComplete?: (error?: any) => void): Promise<void> {

    if (typeof values !== "object" || Array.isArray(values)) {
      throw new Error("values must be key-value object");
    }
    if (Object.keys(values) === 0) {
      throw new Error("values must contain key-value");
    }


    return new Promise((resolve: () => void, reject: (error: any) => void): void => {
      this.exec({
        args: [{
          data: LZString.compressToBase64(JSON.stringify(value)),
          targetId: this.id,
        }],
        context: this,
        methodName: "reference_update",
        pluginName: this.pluginName,
      })
      .then((): void => {
        resolve();
        if (typeof onComplete === "function") {
          onComplete.call(this);
        }
      })
      .catch((error: any): void => {
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

  public then(
    onResolve?: (value?: any): any => {},
    onReject?: (error: any): any => {}): Promise<any> {

    return (new Promise(
      (_resolve: (result: any) => void, _reject: (error: any) => void): void => {
        this.resolve = (result?: any) => {
          _resolve.call(self, result);
        };
        this.reject = (error: any) => {
          _reject.call(self, error);
        };
      }))
      .then((...result: Array<any>): void => {
        if (typeof onResolve === "function") {
          onResolve.apply(this, result);
        }
        return Promise.resolve(result[0]);
      })
      .catch((error: any): void => {
        if (typeof onReject === "function") {
          onReject.call(this, error);
        }
        return Promise.reject(error);
      });
  }
}



export class DataSnapshot {

  public _nativeResults: any;
  private _ref: Reference;
  private _key: string;

  constructor(ref: Reference, nativeResults: any) {
    this._ref = ref;
    this._nativeResults = nativeResults;
    this._key = nativeResults.key;
  }

  public get ref(): Reference {
    return this._ref;
  }

  public get key(): string {
    return this._key;
  }

  public forEach(action: (snapshot: DataSnapshot) => void): void {
    const values: any = JSON.parse(this._nativeResults.val);
    const keys: Array<string> = (Object.keys(values)).sort();

    const sortedValues: Array<any> = keys.map((key: string) => {
      return values[key];
    });
    sortedValues.forEach(action);
  }

  public getPriority(): string | number {
    return this._nativeResults.getPriority;
  }

  public hasChild(path: string): boolean {
    const values = JSON.parse(this._nativeResults.val);
    return path in values;
  }

  public numChildren(): number {
    return this._nativeResults.numChildren;
  }

  public exportVal(): any {
    return JSON.parse(LZString.decompressFromBase64(this._nativeResults.exportVal));
  }

  public val(): any {
    return JSON.parse(LZString.decompressFromBase64(this._nativeResults.val));
  }

  public toJSON(): any {
    throw new Error("This method is not implemented");
  }

}
