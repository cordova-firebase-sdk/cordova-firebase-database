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
var FirebaseDatabasePlugin = /** @class */ (function (_super) {
    __extends(FirebaseDatabasePlugin, _super);
    function FirebaseDatabasePlugin(id, database) {
        return _super.call(this) || this;
    }
    Object.defineProperty(FirebaseDatabasePlugin.prototype, "id", {
        get: function () {
            return this._id;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FirebaseDatabasePlugin.prototype, "database", {
        get: function () {
            return this._database;
        },
        enumerable: true,
        configurable: true
    });
    FirebaseDatabasePlugin.prototype.hello = function (onSuccess) {
        console.log("--->nativeSide: hello");
        onSuccess("world");
    };
    return FirebaseDatabasePlugin;
}(index_1.BaseClass));
exports.FirebaseDatabasePlugin = FirebaseDatabasePlugin;
