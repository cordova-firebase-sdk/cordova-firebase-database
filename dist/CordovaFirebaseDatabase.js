"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("cordova-firebase-core/index");
const FirebaseDatabasePlugin_1 = require("./FirebaseDatabasePlugin");
class CordovaFirebaseDatabase extends index_1.BaseClass {
    constructor() {
        super();
    }
    newInstance(resolve, reject, args) {
        index_1.loadJsPromise({
            package: "firebase.database",
            url: "https://www.gstatic.com/firebasejs/5.5.0/firebase-database.js",
        })
            .then(() => {
            // args[0]
            // {
            //   id: this.id,
            //   appName: app.name,
            //   options: options,
            // }
            const options = args[0] || {};
            // Get the application instance
            let apps = window.firebase.apps.slice(0);
            apps = apps.filter((app) => {
                return app.name === options.appName;
            });
            // Get the Database service for a specific app
            const database = window.firebase.database(apps[0]);
            // console.log("--->[browser] CordovaFirebaseDatabase.newInstance() : " + options.id);
            // Create Database plugin instance
            const instance = new FirebaseDatabasePlugin_1.FirebaseDatabasePlugin(options.id, database);
            const dummyObj = {};
            const keys = Object.getOwnPropertyNames(FirebaseDatabasePlugin_1.FirebaseDatabasePlugin.prototype)
                .filter((p) => {
                return typeof FirebaseDatabasePlugin_1.FirebaseDatabasePlugin.prototype[p] === "function";
            });
            keys.forEach((key) => {
                dummyObj[key] = instance[key].bind(instance);
            });
            const proxy = require("cordova/exec/proxy");
            proxy.add(options.id, dummyObj);
            resolve();
        })
            .catch(reject);
    }
}
exports.CordovaFirebaseDatabase = CordovaFirebaseDatabase;
// Register this plugin
if (window.cordova && window.cordova.version) {
    (() => {
        const instance = new CordovaFirebaseDatabase();
        const dummyObj = {};
        const keys = Object.getOwnPropertyNames(CordovaFirebaseDatabase.prototype)
            .filter((p) => {
            return typeof CordovaFirebaseDatabase.prototype[p] === "function";
        });
        keys.forEach((key) => {
            dummyObj[key] = instance[key].bind(instance);
        });
        const proxy = require("cordova/exec/proxy");
        proxy.add("CordovaFirebaseDatabase", dummyObj);
    })();
}
