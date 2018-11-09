import { exec } from "cordova";
import {
  App,
  BaseArrayClass,
  IAppInitializeOptions,
  loadJsPromise,
  PluginBase,
} from "cordova-firebase-core/index";
import { execCmd, IExecCmdParams } from "./CommandQueue";
import { Reference } from "./DataClasses";


declare let Promise: any;
declare let window: any;

export class Database extends PluginBase {

  protected _queue: BaseArrayClass = new BaseArrayClass();

  private _app: App;

  private _options: IAppInitializeOptions;

  private _url: string;

  private _rootRef: Reference;

  constructor(app: App, options: IAppInitializeOptions) {
    super("database");
    if (!app) {
      throw new Error("app must be FirebaseApp instance");
    }
    if (!options) {
      throw new Error("options must be passed");
    }
    if (!options.databaseURL) {
      throw new Error("options.databaseURL must be passed");
    }
    this._app = app;
    this._options = options;
    this._url = options.databaseURL.replace(/(firebaseio.com).*$/, "$1");
    if (this._url.substr(-1) !== "/") {
      this._url += "/";
    }

    this._rootRef = new Reference({
      key: null,
      parent: null,
      pluginName: this.id,
      ref: null,
      url: this._url,
    }, null);
    this._rootRef._privateInit();

    // Bubbling native events
    this._on("nativeEvent", (data: INativeEventParams): void => {
      this._rootRef._trigger.call(this._rootRef, "nativeEvent", data);
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

    // Create one new instance in native side.
    this._one("fireAppReady", (): void => {
      const onSuccess = (result?: any): void => {
        this._isReady = true;
        this._queue._trigger("insert_at");
        this._trigger("ready");
      };
      const onError = (error: any): void => {
        throw new Error(error);
      };
      exec(onSuccess, onError,
      "CordovaFirebaseDatabase", "newInstance",
      [{
        appName: this._app.name,
        id: this.id,
        options: this._options,
      }]);
    });
  }

  public get app(): App {
    return this._app;
  }


  public get url(): string {
    return this._url;
  }


  /**
   * Database.goOffline
   */
  public goOffline(): void {
    this.exec({
      context: this,
      execOptions: {
        sync: true,
      },
      methodName: "goOffline",
    });
  }

  /**
   * Database.goOnline
   */
  public goOnline(): void {
    this.exec({
      context: this,
      execOptions: {
        sync: true,
      },
      methodName: "goOnline",
    });
  }

  /**
   * Database.ref
   * @param [path] - Optional path representing the location the returned Reference will point.
   * If not provided, the returned Reference will point to the root of the Database.
   * @returns Reference
   */
  public ref(path?: string): Reference {

    let key: string = null;
    let url: string = this.url;

    if (typeof path === "string") {

      if (path === "") {
        throw new Error("First argument must not be empty string");
      }

      if (/[\.#$\[\]]/.test(path)) {
        throw new Error("First argument must be a valid firebase URL and the path can't contain \".\", \"#\", \"$\", \"[\", or \"]\".");
      }

      path = path.replace(/\/$/, "");
      key = path.replace(/^.*\//, "") || null;
      if (url.substr(0, 1) !== "/") {
        url += "/" + path;
      }
      url = url.replace(/\/+/g, "/");
      url = url.replace(/https:\//, "https://");
    }

    // Create a reference instance.
    const reference: Reference = new Reference({
      key,
      parent: null,
      pluginName: this.id,
      ref: null,
      url,
    }, this._rootRef);


    this.exec({
      args: [{
        id: reference.id,
        path,
      }],
      context: this,
      methodName: "database_ref",
    }).then((): void => {
      reference._privateInit();
    });

    return reference;
  }


  /**
   * Database.refFromURL
   * https://firebase.google.com/docs/reference/js/firebase.database.Database#refFromURL
   */
  public refFromURL(url: string): Reference {

    if (typeof url !== "string") {
      throw new Error("First argument must be string");
    }

    if (url === "") {
      throw new Error("First argument must not be empty string");
    }

    const tmp: Array<any> = this.url.match(/:\/\/(.+?.firebaseio.com)/);
    if (url.indexOf(tmp[1]) === -1) {
      throw new Error("First argument must be with the current database");
    }
    url = url.replace(/\?.*$/, "");

    const tmpUrl: string = url.replace(/https:\/\/[a-z0-9]+\.firebaseio\.com\//i, "");
    if (/[\.#$\[\]]/.test(tmpUrl)) {
      throw new Error("First argument must be a valid firebase URL and the path can't contain \".\", \"#\", \"$\", \"[\", or \"]\".");
    }


    let path: string = url.replace(/^https:\/\/.+?.firebaseio.com\/?/, "");
    path = path.replace(/\/$/, "");
    path = path.replace(/^\//, "");

    let reference: Reference = null;
    let currentUrl: string = this.url;
    let newRef: Reference = null;
    const refs: Array<Reference> = (path.split(/\//)).map((key: string) => {

      currentUrl += "/" + key;

      newRef = new Reference({
        key,
        parent: reference,
        pluginName: this.id,
        ref: null,
        url: currentUrl,
      }, this._rootRef);

      // Bubbling native events
      this._on("nativeEvent", (...parameters: Array<any>): void => {
        parameters.unshift("nativeEvent");
        newRef._trigger.apply(newRef, parameters);
      });

      this.exec({
        args: [{
          id: newRef.id,
          path,
        }],
        context: this,
        methodName: "database_ref",
      }).then((): void => {
        newRef._privateInit();
      });

      reference = newRef;

      return newRef;
    });
    //
    // this.exec({
    //   args: [{
    //     id: reference.id,
    //     path,
    //   }],
    //   context: this,
    //   methodName: "database_refFromURL",
    // }).then((): void => {
    //   reference._privateInit();
    // });

    return reference;
  }


  private exec(params: IExecCmdParams): Promise<any> {
    return new Promise((resolve: (result: any) => void, reject: (error: any) => void) => {
      params.resolve = resolve;
      params.reject = reject;
      this._queue._push(params);
    });
  }

}



class SecretDatabaseManager {

  public _databases: any = {};

}

if (window.cordova && window.cordova.version) {
  const manager: SecretDatabaseManager = new SecretDatabaseManager();

  Object.defineProperty(window.plugin.firebase, "database", {
    value: (app?: App): Database => {
      if (!app) {
        // Obtains default app
        app = window.plugin.firebase.app();
      }

      // If database is created for the app, returns it.
      // Otherwise, create a new instance.
      let database: Database = manager._databases[app.name];
      if (!database) {
        database = new Database(app, app.options);
        manager._databases[app.name] = database;
      }
      return database;
    },
  });

  Object.defineProperty(window.plugin.firebase.database, "_nativeCallback", {
    enumerable: false,
    value: (dbId: string, listenerId: string, eventType: string, args: Array<any>): void => {

      const dbInstance = window.plugin.firebase.database._DBs[dbId];

      if (dbInstance) {
        dbInstance._trigger("nativeEvent", {
          args,
          eventType,
          listenerId,
        });
      }
    },
  });
}
