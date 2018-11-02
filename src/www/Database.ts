import { exec } from "cordova";
import {
  App,
  BaseArrayClass,
  IAppInitializeOptions,
  loadJsPromise,
  PluginBase,
} from "cordova-firebase-core/index";
import { execCmd, IExecCmdParams } from "./CommandQueue";


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
      const cmd: any = this._queue._removeAt(0, true);
      if (cmd && cmd.context && cmd.methodName) {
        execCmd(cmd).then(cmd.resolve).catch(cmd.reject);
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

  public hello(): Promise<string> {
    return this.exec({
      context: this,
      methodName: "hello",
    });
  }

  private exec(params: IExecCmdParams): Promise<any> {
    return new Promise((resolve, reject) => {
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
}
