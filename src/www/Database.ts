import {
  App,
  IAppInitializeOptions,
  loadJsPromise,
  PluginBase,
} from "cordova-firebase-core/index";

declare let Promise: any;
declare let window: any;

export class Database extends PluginBase {

  private _app: App;

  constructor(app: App, options: IAppInitializeOptions) {
    super("database");
  }

  /**
   * The app associated with the Database service instance.
   *
   * @link https://firebase.google.com/docs/reference/js/firebase.database.Database#app
   */
  public get app(): App {
    return this._app;
  }

  public hello(): string {
    return "world";
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
