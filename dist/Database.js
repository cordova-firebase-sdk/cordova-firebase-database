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
var DataClasses_1 = require("./DataClasses");
var Database = /** @class */ (function (_super) {
    __extends(Database, _super);
    function Database(app, options) {
        var _this = _super.call(this, "database") || this;
        _this._queue = new index_1.BaseArrayClass();
        _this._app = app;
        _this._options = options;
        _this._url = options.databaseURL.replace(/(firebaseio.com).*$/, "$1");
        _this._queue._on("insert_at", function () {
            if (!_this._isReady) {
                return;
            }
            if (_this._queue._getLength() > 0) {
                var cmd = _this._queue._removeAt(0, true);
                if (cmd && cmd.context && cmd.methodName) {
                    CommandQueue_1.execCmd(cmd).then(cmd.resolve).catch(cmd.reject);
                }
            }
            if (_this._queue._getLength() > 0) {
                _this._queue._trigger("insert_at");
            }
        });
        // Create one new instance in native side.
        _this._one("fireAppReady", function () {
            var onSuccess = function () {
                _this._isReady = true;
                _this._queue._trigger("insert_at");
                _this._trigger("ready");
            };
            var onError = function (error) {
                throw new Error(error);
            };
            cordova_1.exec(onSuccess, onError, "CordovaFirebaseDatabase", "newInstance", [{
                    appName: _this._app.name,
                    id: _this.id,
                    options: _this._options,
                }]);
        });
        return _this;
    }
    Object.defineProperty(Database.prototype, "app", {
        get: function () {
            return this._app;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Database.prototype, "url", {
        get: function () {
            return this._url;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Database.goOffline
     */
    Database.prototype.goOffline = function () {
        this.exec({
            context: this,
            execOptions: {
                sync: true,
            },
            methodName: "goOffline",
        });
    };
    /**
     * Database.goOnline
     */
    Database.prototype.goOnline = function () {
        this.exec({
            context: this,
            execOptions: {
                sync: true,
            },
            methodName: "goOnline",
        });
    };
    /**
     * Database.ref
     * @param [path] - Optional path representing the location the returned Reference will point.
     * If not provided, the returned Reference will point to the root of the Database.
     * @returns Reference
     */
    Database.prototype.ref = function (path) {
        var key = null;
        if (typeof path === "string") {
            path = path.replace(/\/$/, "");
            key = path.replace(/^.*\//, "") || null;
        }
        // Create a reference instance.
        var reference = new DataClasses_1.Reference({
            key: key,
            parent: null,
            pluginName: this.id,
            ref: null,
            url: this.url,
        });
        // Bubbling native events
        this._on("nativeEvent", function () {
            var parameters = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                parameters[_i] = arguments[_i];
            }
            parameters.unshift("nativeEvent");
            reference._trigger.apply(reference, parameters);
        });
        this.exec({
            args: [{
                    id: reference.id,
                    path: path,
                }],
            context: this,
            methodName: "database_ref",
        }).then(function () {
            reference._privateInit();
        });
        return reference;
    };
    /**
     * Database.refFromURL
     * https://firebase.google.com/docs/reference/js/firebase.database.Database#refFromURL
     */
    Database.prototype.refFromURL = function (url) {
        var key = null;
        var path = null;
        if (typeof url === "string") {
            if (/^https:\/\/(.+?).firebaseio.com/) {
                path = url.replace(/^https:\/\/.+?.firebaseio.com\/?/, "");
                path = path.replace(/\/$/, "");
                key = path.replace(/^.*\//, "") || null;
            }
            else {
                throw new Error("url must be started with https://(project id).firebaseio.com");
            }
        }
        else {
            throw new Error("url must be string");
        }
        // Create a reference instance.
        var reference = new DataClasses_1.Reference({
            key: key,
            parent: null,
            pluginName: this.id,
            ref: null,
            url: this.url,
        });
        // Bubbling native events
        this._on("nativeEvent", function () {
            var parameters = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                parameters[_i] = arguments[_i];
            }
            parameters.unshift("nativeEvent");
            reference._trigger.apply(reference, parameters);
        });
        this.exec({
            args: [{
                    id: reference.id,
                    path: path,
                }],
            context: this,
            methodName: "database_refFromURL",
        }).then(function () {
            reference._privateInit();
        });
        return reference;
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
    Object.defineProperty(window.plugin.firebase.database, "_nativeCallback", {
        enumerable: false,
        value: function (dbId, listenerId, eventType, args) {
            var dbInstance = window.plugin.firebase.database._DBs[dbId];
            if (dbInstance) {
                dbInstance._trigger("nativeEvent", {
                    args: args,
                    eventType: eventType,
                    listenerId: listenerId,
                });
            }
        },
    });
}
