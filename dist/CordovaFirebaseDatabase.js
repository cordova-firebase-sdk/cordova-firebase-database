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
var FirebaseDatabasePlugin_1 = require("./FirebaseDatabasePlugin");
var CordovaFirebaseDatabase = /** @class */ (function (_super) {
    __extends(CordovaFirebaseDatabase, _super);
    function CordovaFirebaseDatabase() {
        return _super.call(this) || this;
    }
    CordovaFirebaseDatabase.prototype.newInstance = function (resolve, reject, args) {
        index_1.loadJsPromise({
            package: "firebase.database",
            url: "https://www.gstatic.com/firebasejs/5.5.0/firebase-database.js",
        })
            .then(function () {
            // args[0]
            // {
            //   id: this.id,
            //   appName: app.name,
            //   options: options,
            // }
            var options = args[0] || {};
            console.log(options);
            // Get the application instance
            var apps = window.firebase.apps.slice(0);
            apps = apps.filter(function (app) {
                return app.name === options.appName;
            });
            // Get the Database service for a specific app
            var database = window.firebase.database(apps[0]);
            // console.log("--->[browser] CordovaFirebaseDatabase.newInstance() : " + options.id);
            // Create Database plugin instance
            var instance = new FirebaseDatabasePlugin_1.FirebaseDatabasePlugin(options.id, database);
            var dummyObj = {};
            var keys = Object.getOwnPropertyNames(FirebaseDatabasePlugin_1.FirebaseDatabasePlugin.prototype).filter(function (p) {
                return typeof FirebaseDatabasePlugin_1.FirebaseDatabasePlugin.prototype[p] === "function";
            });
            keys.forEach(function (key) {
                dummyObj[key] = instance[key].bind(instance);
            });
            var proxy = require("cordova/exec/proxy");
            proxy.add(options.id, dummyObj);
            resolve();
        })
            .catch(reject);
    };
    return CordovaFirebaseDatabase;
}(index_1.BaseClass));
exports.CordovaFirebaseDatabase = CordovaFirebaseDatabase;
// Register this plugin
if (window.cordova && window.cordova.version) {
    (function () {
        var instance = new CordovaFirebaseDatabase();
        var dummyObj = {};
        var keys = Object.getOwnPropertyNames(CordovaFirebaseDatabase.prototype).filter(function (p) {
            return typeof CordovaFirebaseDatabase.prototype[p] === "function";
        });
        keys.forEach(function (key) {
            dummyObj[key] = instance[key].bind(instance);
        });
        var proxy = require("cordova/exec/proxy");
        proxy.add("CordovaFirebaseDatabase", dummyObj);
    })();
}
