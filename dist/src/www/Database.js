"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var BaseClass_1 = require("cordova-firebase-core/BaseClass");
var Database = /** @class */ (function (_super) {
    __extends(Database, _super);
    function Database() {
        return _super.call(this) || this;
    }
    return Database;
}(BaseClass_1.BaseClass));
exports.Database = Database;
var instance = new Database();
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
