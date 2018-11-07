"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cordova_1 = require("cordova");
const index_1 = require("cordova-firebase-core/index");
const CommandQueue_1 = require("./CommandQueue");
const DataClasses_1 = require("./DataClasses");
class Database extends index_1.PluginBase {
    constructor(app, options) {
        super("database");
        this._queue = new index_1.BaseArrayClass();
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
        this._queue._on("insert_at", () => {
            if (!this._isReady) {
                return;
            }
            if (this._queue._getLength() > 0) {
                const cmd = this._queue._removeAt(0, true);
                if (cmd && cmd.context && cmd.methodName) {
                    CommandQueue_1.execCmd(cmd).then(cmd.resolve).catch(cmd.reject);
                }
            }
            if (this._queue._getLength() > 0) {
                this._queue._trigger("insert_at");
            }
        });
        // Create one new instance in native side.
        this._one("fireAppReady", () => {
            const onSuccess = () => {
                this._isReady = true;
                this._queue._trigger("insert_at");
                this._trigger("ready");
            };
            const onError = (error) => {
                throw new Error(error);
            };
            cordova_1.exec(onSuccess, onError, "CordovaFirebaseDatabase", "newInstance", [{
                    appName: this._app.name,
                    id: this.id,
                    options: this._options,
                }]);
        });
    }
    get app() {
        return this._app;
    }
    get url() {
        return this._url;
    }
    /**
     * Database.goOffline
     */
    goOffline() {
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
    goOnline() {
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
    ref(path) {
        let key = null;
        if (typeof path === "string") {
            path = path.replace(/\/$/, "");
            key = path.replace(/^.*\//, "") || null;
        }
        // Create a reference instance.
        const reference = new DataClasses_1.Reference({
            key,
            parent: null,
            pluginName: this.id,
            ref: null,
            url: this.url,
        });
        // Bubbling native events
        this._on("nativeEvent", (...parameters) => {
            parameters.unshift("nativeEvent");
            reference._trigger.apply(reference, parameters);
        });
        this.exec({
            args: [{
                    id: reference.id,
                    path,
                }],
            context: this,
            methodName: "database_ref",
        }).then(() => {
            reference._privateInit();
        });
        return reference;
    }
    /**
     * Database.refFromURL
     * https://firebase.google.com/docs/reference/js/firebase.database.Database#refFromURL
     */
    refFromURL(url) {
        let key = null;
        let path = null;
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
        const reference = new DataClasses_1.Reference({
            key,
            parent: null,
            pluginName: this.id,
            ref: null,
            url: this.url,
        });
        // Bubbling native events
        this._on("nativeEvent", (...parameters) => {
            parameters.unshift("nativeEvent");
            reference._trigger.apply(reference, parameters);
        });
        this.exec({
            args: [{
                    id: reference.id,
                    path,
                }],
            context: this,
            methodName: "database_refFromURL",
        }).then(() => {
            reference._privateInit();
        });
        return reference;
    }
    exec(params) {
        return new Promise((resolve, reject) => {
            params.resolve = resolve;
            params.reject = reject;
            this._queue._push(params);
        });
    }
}
exports.Database = Database;
class SecretDatabaseManager {
    constructor() {
        this._databases = {};
    }
}
if (window.cordova && window.cordova.version) {
    const manager = new SecretDatabaseManager();
    Object.defineProperty(window.plugin.firebase, "database", {
        value: (app) => {
            if (!app) {
                // Obtains default app
                app = window.plugin.firebase.app();
            }
            // If database is created for the app, returns it.
            // Otherwise, create a new instance.
            let database = manager._databases[app.name];
            if (!database) {
                database = new Database(app, app.options);
                manager._databases[app.name] = database;
            }
            return database;
        },
    });
    Object.defineProperty(window.plugin.firebase.database, "_nativeCallback", {
        enumerable: false,
        value: (dbId, listenerId, eventType, args) => {
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
