"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("cordova-firebase-core/index");
const CommandQueue_1 = require("./CommandQueue");
class OnDisconnect extends index_1.PluginBase {
    constructor(pluginName) {
        super("OnDisconnect");
        this._queue = new index_1.BaseArrayClass();
        this._pluginName = pluginName;
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
    }
    get pluginName() {
        return this._pluginName;
    }
    /**
     * Internal use only. Don't execute this method.
     * @hidden
     */
    _privateInit() {
        if (!this._isReady) {
            this._isReady = true;
            this._queue._trigger("insert_at");
        }
    }
    cancel(onComplete) {
        return new Promise((resolve, reject) => {
            this.exec({
                args: [{
                        targetId: this.id,
                    }],
                context: this,
                methodName: "onDisconnect_cancel",
                pluginName: this.pluginName,
            })
                .then(() => {
                resolve();
                if (typeof onComplete === "function") {
                    onComplete();
                }
            })
                .catch((error) => {
                reject(error);
                if (typeof onComplete === "function") {
                    onComplete(error);
                }
            });
        });
    }
    remove(onComplete) {
        return new Promise((resolve, reject) => {
            this.exec({
                args: [{
                        targetId: this.id,
                    }],
                context: this,
                methodName: "onDisconnect_remove",
                pluginName: this.pluginName,
            })
                .then(() => {
                resolve();
                if (typeof onComplete === "function") {
                    onComplete();
                }
            })
                .catch((error) => {
                reject(error);
                if (typeof onComplete === "function") {
                    onComplete(error);
                }
            });
        });
    }
    set(value, onComplete) {
        return new Promise((resolve, reject) => {
            this.exec({
                args: [{
                        targetId: this.id,
                        value: index_1.LZString.compressToBase64(JSON.stringify(value)),
                    }],
                context: this,
                methodName: "onDisconnect_set",
                pluginName: this.pluginName,
            })
                .then(() => {
                resolve();
                if (typeof onComplete === "function") {
                    onComplete();
                }
            })
                .catch((error) => {
                reject(error);
                if (typeof onComplete === "function") {
                    onComplete(error);
                }
            });
        });
    }
    setWithPriority(value, property, onComplete) {
        return new Promise((resolve, reject) => {
            this.exec({
                args: [{
                        priority: index_1.LZString.compressToBase64(JSON.stringify(property)),
                        targetId: this.id,
                        value: index_1.LZString.compressToBase64(JSON.stringify(value)),
                    }],
                context: this,
                methodName: "onDisconnect_setWithPriority",
                pluginName: this.pluginName,
            })
                .then(() => {
                resolve();
                if (typeof onComplete === "function") {
                    onComplete();
                }
            })
                .catch((error) => {
                reject(error);
                if (typeof onComplete === "function") {
                    onComplete(error);
                }
            });
        });
    }
    update(values, onComplete) {
        if (!values || typeof values !== "object" || Array.isArray(values)) {
            throw new Error("values must be key-value object");
        }
        return new Promise((resolve, reject) => {
            this.exec({
                args: [{
                        targetId: this.id,
                        values: index_1.LZString.compressToBase64(JSON.stringify(values)),
                    }],
                context: this,
                methodName: "onDisconnect_update",
                pluginName: this.pluginName,
            })
                .then(() => {
                resolve();
                if (typeof onComplete === "function") {
                    onComplete.call(this);
                }
            })
                .catch((error) => {
                reject(error);
                if (typeof onComplete === "function") {
                    onComplete.call(this, error);
                }
            });
        });
    }
    exec(params) {
        return new Promise((resolve, reject) => {
            params.resolve = resolve;
            params.reject = reject;
            this._queue._push(params);
        });
    }
}
exports.OnDisconnect = OnDisconnect;
