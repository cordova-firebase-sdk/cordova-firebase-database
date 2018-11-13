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
        if (this._url.substr(-1) !== "/") {
            this._url += "/";
        }
        this._rootRef = new DataClasses_1.Reference({
            key: null,
            parent: null,
            pluginName: this.id,
            url: this._url,
        }, {
            root: null,
        });
        // Bubbling native events
        this._on("nativeEvent", (data) => {
            this._rootRef._trigger.call(this._rootRef, "nativeEvent", data);
        });
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
            const onSuccess = (result) => {
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
     * @hidden
     * This method is for `Reference.transcation` implementation
     */
    getSelf() {
        console.log("--->getSelf", this);
        return this;
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
        let url = this.url;
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
        }
        else {
            path = "/";
        }
        let reference = this._rootRef;
        let currentUrl = this.url;
        if (currentUrl.substr(-1) === "/") {
            currentUrl = currentUrl.substr(0, currentUrl.length - 1);
        }
        let currentPath = "";
        let newRef;
        const refs = (path.split(/\//)).map((pathStep) => {
            currentUrl += "/" + pathStep;
            currentPath += (currentPath ? "/" : "") + pathStep;
            newRef = new DataClasses_1.Reference({
                key: pathStep,
                parent: reference,
                pluginName: this.id,
                url: currentUrl,
            }, {
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
    refFromURL(url) {
        if (typeof url !== "string") {
            throw new Error("First argument must be string");
        }
        if (url === "") {
            throw new Error("First argument must not be empty string");
        }
        const tmp = this.url.match(/:\/\/(.+?.firebaseio.com)/);
        if (url.indexOf(tmp[1]) === -1) {
            throw new Error("First argument must be with the current database");
        }
        url = url.replace(/\?.*$/, "");
        const tmpUrl = url.replace(/https:\/\/[a-z0-9]+\.firebaseio\.com\//i, "");
        if (/[\.#$\[\]]/.test(tmpUrl)) {
            throw new Error("First argument must be a valid firebase URL and the path can't contain \".\", \"#\", \"$\", \"[\", or \"]\".");
        }
        let path = url.replace(/^https:\/\/.+?.firebaseio.com\/?/, "");
        path = path.replace(/\/+$/, "");
        path = path.replace(/^\//, "");
        return this.ref(path);
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
