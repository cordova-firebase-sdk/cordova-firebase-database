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
import { INativeEventParams } from "./INativeEventParams";

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
      url: this._url,
    }, {
      exec: this.exec,
      root: null,
    });

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
      const onSuccess = (): void => {
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
   * @hidden
   * This method is for `Reference.transcation` implementation
   */
  public getSelf(): Database {
    console.log("--->getSelf", this);
    return this;
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
      pluginName: this.id,
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
      pluginName: this.id,
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

    if (typeof path === "string" && path !== "") {

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
    } else {
      path = "/";
    }

    let reference: Reference = this._rootRef;
    let currentUrl: string = this.url;
    if (currentUrl.substr(-1) === "/") {
      currentUrl = currentUrl.substr(0, currentUrl.length - 1);
    }
    let currentPath: string = "";
    let newRef: Reference;

    const refs: Array<Reference> = (path.split(/\//)).map((pathStep: string): Reference => {

      currentUrl += "/" + pathStep;
      currentPath += (currentPath ? "/" : "") + pathStep;

      newRef = new Reference({
        key: pathStep,
        parent: reference,
        pluginName: this.id,
        url: currentUrl,
      }, {
        exec: this.exec.bind(this),
        root: this._rootRef,
      });

      reference = newRef;

      return newRef;
    });
    return refs.pop();
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
    path = path.replace(/\/+$/, "");
    path = path.replace(/^\//, "");

    return this.ref(path);
  }


  private exec(params: IExecCmdParams): Promise<any> {

    return new Promise((resolve: (result: any) => void, reject: (error: any) => void): void => {
      this._queue._push({
        args: params.args,
        context: this,
        execOptions: params.execOptions,
        methodName: params.methodName,
        pluginName: params.pluginName,
        reject,
        resolve,
      });
    });
  }

}



class SecretDatabaseManager {

  public _databasesByName: any = {};
  public _databasesById: any = {};

}

if ((window as any).cordova && (window as any).cordova.version) {
  const manager: SecretDatabaseManager = new SecretDatabaseManager();

  Object.defineProperty((window as any).plugin.firebase, "database", {
    value: (app?: App): Database => {
      if (!app) {
        // Obtains default app
        app = (window as any).plugin.firebase.app();
      }

      // If database is created for the app, returns it.
      // Otherwise, create a new instance.
      let database: Database = manager._databasesByName[app.name];
      if (!database) {
        database = new Database(app, app.options);
        manager._databasesByName[app.name] = database;
        manager._databasesById[database.id] = database;
      }
      return database;
    },
  });

  Object.defineProperty((window as any).plugin.firebase.database, "_nativeCallback", {
    enumerable: false,
    value: (dbId: string, listenerId: string, eventType: string, args: Array<any>): void => {

      const dbInstance: Database = manager._databasesById[dbId];
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
