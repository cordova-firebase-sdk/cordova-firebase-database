import { exec } from "cordova";
import { BaseArrayClass, LZString, PluginBase } from "cordova-firebase-core/index";
import { execCmd, IExecCmdParams } from "./CommandQueue";
import { INativeEventParams } from "./INativeEventParams";
import { OnDisconnect } from "./OnDisconnect";

declare const Promise: any;

interface IQueryParams {
  key?: string;
  url: string;
  ref: Reference;
  parent?: Reference;
  pluginName: string;
}

export type CANCEL_CALLBACK = (error: any) => void;

export type ON_CALLBACK = (snapshot: DataSnapshot, key: string) => void;

export class Query extends PluginBase {


  protected _ref: Reference;

  private _url: string;

  private _queue: BaseArrayClass = new BaseArrayClass();

  private _listeners: Array<any> = [];

  private _pluginName: string;

  constructor(params: IQueryParams) {
    super("queryOrReference");
    this._pluginName = params.pluginName;
    this._ref = params.ref;

    params.url = params.url.replace(/\/+$/, "");
    this._url = params.url;

    // Bubbling native events
    this._on("nativeEvent", (data: INativeEventParams): void => {
      this._trigger.call(this, data.listenerId, data);
    });

    this._queue._one("insert_at", (): void => {

      this.exec({
        args: [{
          id: this.ref.id,
          path: this.url.replace(/^.+firebaseio.com\//i, ""),
        }],
        context: this,
        methodName: "database_ref",
      }).then((): void => {
        this._isReady = true;
        this._queue._trigger("insert_at");
      });

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

  }

  public get pluginName(): string {
    return this._pluginName;
  }

  public get ref(): Reference {
    return this._ref;
  }

  public get url(): string {
    return this._url;
  }


  /**
   * Query.endAt
   */
  public endAt(value: any, key?: string): Query {

    const query: Query = new Query({
      pluginName: this.pluginName,
      ref: this.ref,
      url: this.url,
    });
    this._on("nativeEvent", (eventData: INativeEventParams) => {
      query._trigger.call(query, "nativeEvent", eventData);
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
    // })
    // .then((): void => {
    //   query._privateInit();
    });

    return query;
  }

  /**
   * Query.equalTo
   */
  public equalTo(value: any, key: string): Query {

    const query: Query = new Query({
      pluginName: this.pluginName,
      ref: this.ref,
      url: this.url,
    });
    this._on("nativeEvent", (eventData: INativeEventParams) => {
      query._trigger.call(query, "nativeEvent", eventData);
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
    // })
    // .then((): void => {
    //   query._privateInit();
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
      ref: this.ref,
      url: this.url,
    });
    this._on("nativeEvent", (eventData: INativeEventParams) => {
      query._trigger.call(query, "nativeEvent", eventData);
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
    // })
    // .then((): void => {
    //   query._privateInit();
    });

    return query;
  }


  /**
   * Query.limitToLast
   */
  public limitToLast(value: any, key: string): Query {

    const query: Query = new Query({
      pluginName: this.pluginName,
      ref: this.ref,
      url: this.url,
    });
    this._on("nativeEvent", (eventData: INativeEventParams) => {
      query._trigger.call(query, "nativeEvent", eventData);
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
    // })
    // .then((): void => {
    //   query._privateInit();
    });

    return query;
  }


  /**
   * Query.off
   */
  public off(
    eventType?: string,
    callback?: (snapshot: DataSnapshot, key: string) => void,
    context?: any): void {

    let context_: any = this;
    if (!context) {
      context_ = context;
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
  public on(eventType: string,
            callback: ON_CALLBACK,
            cancelCallbackOrContext?: object | CANCEL_CALLBACK,
            context?: any): ON_CALLBACK {

    let context_: any = this;
    if (context) {
      context_ = context;
    } else if (typeof cancelCallbackOrContext === "object") {
      context_ = cancelCallbackOrContext;
      cancelCallbackOrContext = null;
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

        const snapshot: DataSnapshot = new DataSnapshot(this.ref, snapshotValues);
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
  public once(eventType: string,
              callback: ON_CALLBACK,
              failureCallbackOrContext?: object | CANCEL_CALLBACK,
              context?: any): Promise<void> {

    let context_: any = this;
    if (context) {
      context_ = context;
    } else if (typeof failureCallbackOrContext === "object") {
      context_ = failureCallbackOrContext;
      failureCallbackOrContext = null;
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

        if (typeof callback === "function") {
          callback.apply(context_, args);
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
      ref: this.ref,
      url: this.url,
    });
    this._on("nativeEvent", (eventData: INativeEventParams) => {
      query._trigger.call(query, "nativeEvent", eventData);
    });

    this.exec({
      args: [{
        path,
        queryId: query.id,
        targetId: this.id,
      }],
      context: this,
      methodName: "query_orderByChild",
    // })
    // .then((): void => {
    //   query._privateInit();
    });

    return query;
  }


  /**
   * Query.orderByKey
   */
  public orderByKey(path: string): Query {

    const query: Query = new Query({
      pluginName: this.pluginName,
      ref: this.ref,
      url: this.url,
    });
    this._on("nativeEvent", (eventData: INativeEventParams) => {
      query._trigger.call(query, "nativeEvent", eventData);
    });

    this.exec({
      args: [{
        queryId: query.id,
        targetId: this.id,
      }],
      context: this,
      methodName: "query_orderByKey",
    // })
    // .then((): void => {
    //   query._privateInit();
    });

    return query;
  }


  /**
   * Query.orderByPriority
   */
  public orderByPriority(path: string): Query {

    const query: Query = new Query({
      pluginName: this.pluginName,
      ref: this.ref,
      url: this.url,
    });
    this._on("nativeEvent", (eventData: INativeEventParams) => {
      query._trigger.call(query, "nativeEvent", eventData);
    });

    this.exec({
      args: [{
        queryId: query.id,
        targetId: this.id,
      }],
      context: this,
      methodName: "query_orderByPriority",
    // })
    // .then((): void => {
    //   query._privateInit();
    });

    return query;
  }

  /**
   * Query.orderByValue
   */
  public orderByValue(path: string): Query {

    const query: Query = new Query({
      pluginName: this.pluginName,
      ref: this.ref,
      url: this.url,
    });
    this._on("nativeEvent", (eventData: INativeEventParams) => {
      query._trigger.call(query, "nativeEvent", eventData);
    });

    this.exec({
      args: [{
        queryId: query.id,
        targetId: this.id,
      }],
      context: this,
      methodName: "query_orderByValue",
    // })
    // .then((): void => {
    //   query._privateInit();
    });

    return query;
  }

  /**
   * Query.startAt
   */
  public startAt(value: any, key?: string): Query {

    const query: Query = new Query({
      pluginName: this.pluginName,
      ref: this.ref,
      url: this.url,
    });
    this._on("nativeEvent", (eventData: INativeEventParams) => {
      query._trigger.call(query, "nativeEvent", eventData);
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
    // })
    // .then((): void => {
    //   query._privateInit();
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

  protected exec(params: IExecCmdParams): Promise<any> {
    return new Promise((resolve: (result: any) => void, reject: (error: any) => void) => {
      params.resolve = resolve;
      params.reject = reject;
      this._queue._push(params);
    });
  }
}


export class Reference extends Query {

  private _key: string;
  private _parent: Reference;
  private _rootRef: Reference;

  constructor(params: IQueryParams, _rootRef: Reference) {
    super(params);
    this._parent = params.parent;
    this._key = params.key;
    this._ref = params.ref || this;
    this._rootRef = _rootRef || this;

    // Bubbling native events
    const parentRef: Reference = this._parent || this._rootRef;
    if (parentRef) {
      parentRef._on("nativeEvent", (data: INativeEventParams): void => {
        this._trigger.call(this, "nativeEvent", data);
      });
    }

  }

  public get root(): Reference {
    return this._rootRef;
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

    let key: string = null;
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
      ref: null,
      url: this.url + "/" + path,
    }, this.root);

    this._on("nativeEvent", (eventData: INativeEventParams) => {
      reference._trigger.call(reference, "nativeEvent", eventData);
    });

    this.exec({
      args: [{
        childId: reference.id,
        path,
        targetId: this.id,
      }],
      context: this,
      methodName: "reference_child",
      pluginName: this.pluginName,
    // })
    // .then((): void => {
    //   reference._privateInit();
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
      ref: this,
      url: this.url,
    }, this.root);

    this.exec({
      args: [{
        newId: reference.id,
        targetId: this.id,
        value: LZString.compressToBase64(JSON.stringify(value)),
      }],
      context: this,
      methodName: "reference_push",
      pluginName: this.pluginName,
    })
    .then((result: any): void => {
      //reference._privateInit();

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
      onComplete?: (error: any, committed: boolean, snapshot?: DataSnapshot) => void,
      applyLocally?: boolean): Promise<void> {

    const transactionId: string = Math.floor(Date.now() * Math.random()) + "_transaction";
    const eventName: string = this.pluginName + "-" + this.id + "-" + transactionId;

    if (cordova.platformId === "browser") {
      // ------------------------
      //       Browser
      // ------------------------
      return new Promise(
        (resolve: any, reject: any): void => {

          const proxy: any = require("cordova/exec/proxy");
          const fbDbPlugin: any = proxy.get(this.pluginName);
          const ref: any = fbDbPlugin._get(this.id);
          ref.transaction(transactionUpdate, (error: any, committed: boolean, snapshot: any): Promise<any> => {
            if (error) {
              onComplete(error, false);
            } else {
              const dataSnapshot: DataSnapshot = new DataSnapshot(this, {
                exists: snapshot.exists(),
                exportVal: LZString.compressToBase64(JSON.stringify(snapshot.exportVal())),
                getPriority: LZString.compressToBase64(snapshot.getPriority()),
                key: snapshot.key,
                numChildren: snapshot.numChildren(),
                val: LZString.compressToBase64(JSON.stringify(snapshot.val())),
              });
              if (typeof onComplete === "function") {
                onComplete(null, committed, dataSnapshot);
              }
              return Promise.resolve({
                committed,
                snapshot: dataSnapshot,
              });
            }
          }, applyLocally);

      });

    }
    // ------------------------
    //    Android, iOS
    // ------------------------
    const onNativeCallback = (...args: Array<any>): void => {
      const newValue: any = transactionUpdate.call(this, JSON.parse(LZString.decompressFromBase64(args[0])));
      exec(null, null, this.pluginName,
          "reference_onTransactionCallback",
          [transactionId, LZString.compressToBase64(JSON.stringify(newValue))]);
    };
    document.addEventListener(eventName, onNativeCallback, {
      once: true,
    });


    return new Promise(
      (resolve: any, reject: any): void => {
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
        .then((results: any): void => {
          const snapshotStr: string = LZString.decompressFromBase64(results.snapshot);
          const snapshotValues: any = JSON.parse(snapshotStr);
          const snapshot: DataSnapshot = new DataSnapshot(this, snapshotValues);
          resolve({
            committed: results.committed,
            snapshot,
          });

          if (typeof onComplete === "function") {
            onComplete(null, results.committed, snapshot);
          }
        })
        .catch((error: any): void => {
          reject(error);
          if (typeof onComplete === "function") {
            onComplete(error, false);
          }
        });
    });
  }


  /**
   * Reference.update
   */
  public update(values: any, onComplete?: (error?: any) => void): Promise<void> {

    if (!values || typeof values !== "object") {
      throw new Error("values must contain key-value");
    }

    return new Promise((resolve: () => void, reject: (error: any) => void): void => {
      this.exec({
        args: [{
          data: LZString.compressToBase64(JSON.stringify(values)),
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

  constructor(params: IQueryParams, _rootRef: Reference) {
    super(params, _rootRef);
  }

  public then(
    onResolve?: (value?: any) => any,
    onReject?: (error: any) => any): Promise<any> {

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



class DataSnapshot {

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
