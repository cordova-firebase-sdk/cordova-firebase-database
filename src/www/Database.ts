import { exec } from "cordova";
import {
  App,
  BaseArrayClass,
  IAppInitializeOptions,
  loadJsPromise,
  PluginBase,
} from "cordova-firebase-core/index";
import { execCmd, IExecCmdParams } from "./CommandQueue";
import { Reference } from "./Reference";


declare let Promise: any;
declare let window: any;

export class Database extends PluginBase {

  private _app: App;

  private _options: IAppInitializeOptions;

  private _queue: BaseArrayClass = new BaseArrayClass();

  constructor(app: App, options: IAppInitializeOptions) {
    super("database");
    this._app = app;
    this._options = options;

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
      exec(() => {
        this._isReady = true;
        this._queue._trigger("insert_at");
        this._trigger("ready");
      },
      (error: any) => {
        throw new Error(error);
      },
      "CordovaFirebaseDatabase",
      "newInstance",
      [{
        appName: this._app.name,
        id: this.id,
        options: this._options,
      }]);
    });
  }

  /**
   * The app associated with the Database service instance.
   *
   * @link https://firebase.google.com/docs/reference/js/firebase.database.Database#app
   */
  public get app(): App {
    return this._app;
  }


  private exec(params: IExecCmdParams): Promise<any> {
    return new Promise((resolve, reject) => {
      params.resolve = resolve;
      params.reject = reject;
      this._queue._push(params);
    });
  }

  /**
   * Database.goOffline
   */
  public goOffline(): Promise<void> {
    return this.exec({
      context: this,
      methodName: "goOffline",
    });
  }

  /**
   * Database.goOnline
   */
  public goOnline(): Promise<void> {
    return this.exec({
      context: this,
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
    if (typeof url === "string") {
      path = path.replace(/\/$/, '');
      key = path.replace(/^.*\//, '') || null;
    }

    // Create a reference instance.
    const reference: Reference = new Reference({
      pluginName: this.id,
      parent: null,
      key: key,
      url: this.url
    });

    // Bubbling native events
    this._on("nativeEvent", function(params) {
      reference._trigger("nativeEvent", params);
    });

    this.exec({
      args: [{
        path: path,
        id: reference.id
      }],
      context: this,
      methodName: "database_ref"
    }).then((result: any) => {
      reference._privateInit(result);
    });

    return reference;
  }


  /**
   * Database.refFromURL
   * https://firebase.google.com/docs/reference/js/firebase.database.Database#refFromURL
   */
  public refFromURL(url: string): Reference {

    let key: string = null;
    let path: string = null;
    if (typeof url === "string") {
      if (/^https:\/\/(.+?).firebaseio.com/) {
        path = url.replace(^https:\/\/.+?.firebaseio.com\/?/, "");
        path = path.replace(/\/$/, '');
        key = path.replace(/^.*\//, '') || null;
      } else {
        throw new Error("url must be started with https://(project id).firebaseio.com");
      }
    } else {
      throw new Error("url must be string");
    }

    // Create a reference instance.
    let reference: Reference = new Reference({
      pluginName: this.id,
      parent: null,
      key: key,
      url: url
    });

    // Bubbling native events
    this._on("nativeEvent", function(params) {
      reference._trigger("nativeEvent", params);
    });

    this.exec({
      args: [{
        url: url,
        id: reference.id
      }],
      context: this,
      methodName: "database_refFromURL"
    }).then((result: any) => {
      reference._privateInit(result);
    });

    return reference;
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
}
