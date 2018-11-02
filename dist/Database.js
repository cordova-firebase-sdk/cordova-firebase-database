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
var index_1 = require("cordova-firebase-core/index");
var Database = /** @class */ (function (_super) {
    __extends(Database, _super);
    function Database(app, options) {
        return _super.call(this, "database") || this;
    }
    Object.defineProperty(Database.prototype, "app", {
        /**
         * The app associated with the Database service instance.
         *
         * @link https://firebase.google.com/docs/reference/js/firebase.database.Database#app
         */
        get: function () {
            return this._app;
        },
        enumerable: true,
        configurable: true
    });
    Database.prototype.hello = function () {
        return "world";
    };
    return Database;
}(index_1.PluginBase));
exports.Database = Database;
var SecretDatabaseManager = /** @class */ (function () {
    function SecretDatabaseManager() {
        this._databases = {};
    }
    return SecretDatabaseManager;
}());
if (window.cordova && window.cordova.version) {
    var manager_1 = new SecretDatabaseManager();
    Object.defineProperty(window.plugin.firebase, "database", {
        value: function (app) {
            if (!app) {
                // Obtains default app
                app = window.plugin.firebase.app();
            }
            // If database is created for the app, returns it.
            // Otherwise, create a new instance.
            var database = manager_1._databases[app.name];
            if (!database) {
                database = new Database(app, app.options);
                manager_1._databases[app.name] = database;
            }
            return database;
        },
    });
}
