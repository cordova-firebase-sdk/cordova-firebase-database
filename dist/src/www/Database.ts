import Core = require("cordova-firebase-core/index");

const BaseClass = Core.BaseClass;

export class Database extends BaseClass {
  constructor() {
    super();
  }
}

const instance: any = new Database();
console.log(instance);

//
// const App = Core.App;
// const IAppInitializeOptions = Core.IAppInitializeOptions;
// const loadJsPromise = Core.common.loadJsPromise;
// const PluginBase = Core.PluginBase;
// import App = require("cordova-firebase-core.App");
// import IAppInitializeOptions = require("cordova-firebase-core.IAppInitializeOptions");
// import loadJsPromise = require("cordova-firebase-core.loadJsPromise");
// import PluginBase = require("cordova-firebase-core.PluginBase");
//
// declare let Promise: any;
//
// export class Database extends PluginBase {
//
//   private _app: App;
//
//   constructor(app: App, options: IAppInitializeOptions) {
//     super("database");
//   }
//
//   /**
//    * The app associated with the Database service instance.
//    *
//    * @link https://firebase.google.com/docs/reference/js/firebase.database.Database#app
//    */
//   public get app(): App {
//     return this._app;
//   }
//
//   public hello(): string {
//     return "world";
//   }
//
// }
//
//
//
// class SecretDatabaseManager {
//
//   public _databases: any = {};
//
// }
//
// if ((cordova as any) && (cordova as any).version) {
//   const manager: SecretDatabaseManager = new SecretDatabaseManager();
//
//   (cordova as any).addConstructor(() => {
//
//     Object.defineProperty((window as any).plugin.firebase, "database", {
//       value: (app?: App): Database => {
//         if (!app) {
//           // Obtains default app
//           app = (window as any).plugin.firebase.app();
//         }
//
//         // If database is created for the app, returns it.
//         // Otherwise, create a new instance.
//         let database: Database = manager._databases[app.name];
//         if (!database) {
//           database = new Database(app, app.options);
//           manager._databases[app.name] = database;
//         }
//         return database;
//       },
//     });
//   });
// }
