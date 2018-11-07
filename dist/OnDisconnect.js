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
var CommandQueue_1 = require("./CommandQueue");
var OnDisconnect = /** @class */ (function (_super) {
    __extends(OnDisconnect, _super);
    function OnDisconnect(pluginName) {
        var _this = _super.call(this, "OnDisconnect") || this;
        _this._queue = new index_1.BaseArrayClass();
        _this._pluginName = pluginName;
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
        return _this;
    }
    Object.defineProperty(OnDisconnect.prototype, "pluginName", {
        get: function () {
            return this._pluginName;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Internal use only. Don't execute this method.
     * @hidden
     */
    OnDisconnect.prototype._privateInit = function () {
        this._isReady = true;
        this._queue._trigger("insert_at");
    };
    OnDisconnect.prototype.cancel = function (onComplete) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.exec({
                args: [{
                        targetId: _this.id,
                    }],
                context: _this,
                methodName: "onDisconnect_cancel",
                pluginName: _this.pluginName,
            })
                .then(function () {
                resolve();
                if (typeof onComplete === "function") {
                    onComplete();
                }
            })
                .catch(function (error) {
                reject(error);
                if (typeof onComplete === "function") {
                    onComplete(error);
                }
            });
        });
    };
    OnDisconnect.prototype.remove = function (onComplete) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.exec({
                args: [{
                        targetId: _this.id,
                    }],
                context: _this,
                methodName: "onDisconnect_remove",
                pluginName: _this.pluginName,
            })
                .then(function () {
                resolve();
                if (typeof onComplete === "function") {
                    onComplete();
                }
            })
                .catch(function (error) {
                reject(error);
                if (typeof onComplete === "function") {
                    onComplete(error);
                }
            });
        });
    };
    OnDisconnect.prototype.set = function (value, onComplete) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.exec({
                args: [{
                        targetId: _this.id,
                        value: index_1.LZString.compressToBase64(JSON.stringify(value)),
                    }],
                context: _this,
                methodName: "onDisconnect_set",
                pluginName: _this.pluginName,
            })
                .then(function () {
                resolve();
                if (typeof onComplete === "function") {
                    onComplete();
                }
            })
                .catch(function (error) {
                reject(error);
                if (typeof onComplete === "function") {
                    onComplete(error);
                }
            });
        });
    };
    OnDisconnect.prototype.setWithPriority = function (value, property, onComplete) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.exec({
                args: [{
                        priority: index_1.LZString.compressToBase64(JSON.stringify(property)),
                        targetId: _this.id,
                        value: index_1.LZString.compressToBase64(JSON.stringify(value)),
                    }],
                context: _this,
                methodName: "onDisconnect_setWithPriority",
                pluginName: _this.pluginName,
            })
                .then(function () {
                resolve();
                if (typeof onComplete === "function") {
                    onComplete();
                }
            })
                .catch(function (error) {
                reject(error);
                if (typeof onComplete === "function") {
                    onComplete(error);
                }
            });
        });
    };
    OnDisconnect.prototype.update = function (values, onComplete) {
        var _this = this;
        if (!values || typeof values !== "object" || Array.isArray(values)) {
            throw new Error("values must be key-value object");
        }
        return new Promise(function (resolve, reject) {
            _this.exec({
                args: [{
                        targetId: _this.id,
                        values: index_1.LZString.compressToBase64(JSON.stringify(values)),
                    }],
                context: _this,
                methodName: "onDisconnect_update",
                pluginName: _this.pluginName,
            })
                .then(function () {
                resolve();
                if (typeof onComplete === "function") {
                    onComplete.call(_this);
                }
            })
                .catch(function (error) {
                reject(error);
                if (typeof onComplete === "function") {
                    onComplete.call(_this, error);
                }
            });
        });
    };
    OnDisconnect.prototype.exec = function (params) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            params.resolve = resolve;
            params.reject = reject;
            _this._queue._push(params);
        });
    };
    return OnDisconnect;
}(index_1.PluginBase));
exports.OnDisconnect = OnDisconnect;
