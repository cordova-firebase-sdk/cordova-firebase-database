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

  private _listeners: new BaseArrayClass();

  private _pluginName: string;

  private _ref: Query;

  constructor(params: QueryParams) {
    super("queryOrReference");
    this._pluginName = params.pluginName;

    // Bubbling native events
    this._on("nativeEvent", ((params: any) => {
      this._trigger(params.listenerId, params);
    });

    //--------------------------------------------------
    // Internal methods. Don't use it from your code
    //--------------------------------------------------
    Object.defineProperty(this.prototype, '_privateInit', {
      value: (): void => {
        this._isReady = true;
        this._cmdQueue._trigger('insert_at');
      },
      writable: false,
      enumerable: false
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
  public endAt(value: any, key: string): Query {

    const query: Query = new Query({
      pluginName: this.pluginName,
      ref: this,
      url: this._url
    });
    this._on("nativeEvent", (params: any) => {
      query._trigger("nativeEvent", params);
    });

    this.exec({
      args: [{
        value: LZString.compressToBase64(JSON.stringify(value)),
        key: key,
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
  public equalTo(value: any, key: string): Query {

    const query: Query = new Query({
      pluginName: this.pluginName,
      ref: this,
      url: this._url
    });
    this._on("nativeEvent", (params: any) => {
      query._trigger("nativeEvent", params);
    });

    this.exec({
      args: [{
        value: LZString.compressToBase64(JSON.stringify(value)),
        key: key,
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
      url: this._url
    });
    this._on("nativeEvent", (params: any) => {
      query._trigger("nativeEvent", params);
    });

    this.exec({
      args: [{
        value: LZString.compressToBase64(JSON.stringify(value)),
        key: key,
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
  public limitToLast(value: any, key: string): Query {

    const query: Query = new Query({
      pluginName: this.pluginName,
      ref: this,
      url: this._url
    });
    this._on("nativeEvent", (params: any) => {
      query._trigger("nativeEvent", params);
    });

    this.exec({
      args: [{
        value: LZString.compressToBase64(JSON.stringify(value)),
        key: key,
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
  public off(eventType?: EVENT_TYPE, callback?: Function, context?: any): void {
    let context_: any = this;
    if (!context) {
      context_ = context;
    }

    let targetListeners: Array<any> = [];
    if (typeof callback === "function") {
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
        targetId: self.id,
        listenerIdSet: targetListeners.map(function(info) {
          return info.listenerId;
        }),
        eventType: eventType
      }]
    });
  }

}


export class DataSnapshot {

  private _nativeResults: any;
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

  public forEach(action: Function): void {
    const values: any = JSON.parse(this._nativeResults.val);
    const keys: Array<string> = (Object.keys(values)).sort();
    const sortedValues: Array<any> = keys.map((key: string) => {
      return values[key];
    });
    sortedValues.forEach(action);
  }

  public getPriority: (): any {
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
