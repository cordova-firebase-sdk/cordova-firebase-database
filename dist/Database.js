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
var cordova_1 = require("cordova");
var index_1 = require("cordova-firebase-core/index");
var CommandQueue_1 = require("./CommandQueue");
var Database = /** @class */ (function (_super) {
    __extends(Database, _super);
    function Database(app, options) {
        var _this = _super.call(this, "database") || this;
        _this._queue = new index_1.BaseArrayClass();
        _this._app = app;
        _this._options = options;
        _this._queue._on("insert_at", function () {
            if (!_this._isReady) {
                return;
            }
            var cmd = _this._queue._removeAt(0, true);
            if (cmd && cmd.context && cmd.methodName) {
                CommandQueue_1.execCmd(cmd).then(cmd.resolve).catch(cmd.reject);
            }
            if (_this._queue._getLength() > 0) {
                _this._queue._trigger("insert_at");
            }
        });
        // Create one new instance in native side.
        _this._one("fireAppReady", function () {
            cordova_1.exec(function () {
                _this._isReady = true;
                _this._queue._trigger("insert_at");
            }, function (error) {
                throw new Error(error);
            }, "CordovaFirebaseDatabase", "newInstance", [{
                    appName: _this._app.name,
                    id: _this.id,
                    options: _this._options,
                }]);
        });
        return _this;
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
        return this.exec({
            context: this,
            methodName: "hello",
        });
    };
    Database.prototype.exec = function (params) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            params.resolve = resolve;
            params.reject = reject;
            _this._queue._push(params);
        });
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
