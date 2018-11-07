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
var OnDisconnect_1 = require("./OnDisconnect");
var Query = /** @class */ (function (_super) {
    __extends(Query, _super);
    function Query(params) {
        var _this = _super.call(this, "queryOrReference") || this;
        _this._queue = new index_1.BaseArrayClass();
        _this._listeners = [];
        _this._pluginName = params.pluginName;
        _this._ref = params.ref;
        _this._url = params.url;
        // Bubbling native events
        _this._on("nativeEvent", function (data) {
            _this._trigger.call(_this, data.listenerId, data);
        });
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
    Object.defineProperty(Query.prototype, "pluginName", {
        get: function () {
            return this._pluginName;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Query.prototype, "ref", {
        get: function () {
            return this._ref;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Query.prototype, "url", {
        get: function () {
            return this._url;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * @hidden
     * Internal methods. Don't use it from your code
     */
    Query.prototype._privateInit = function () {
        this._isReady = true;
        this._queue._trigger("insert_at");
    };
    /**
     * Query.endAt
     */
    Query.prototype.endAt = function (value, key) {
        var query = new Query({
            pluginName: this.pluginName,
            ref: this.ref,
            url: this.url,
        });
        this._on("nativeEvent", function (eventData) {
            query._trigger.call(query, "nativeEvent", eventData);
        });
        this.exec({
            args: [{
                    key: key,
                    queryId: query.id,
                    targetId: this.id,
                    value: index_1.LZString.compressToBase64(JSON.stringify(value)),
                }],
            context: this,
            methodName: "query_endAt",
        })
            .then(function () {
            query._privateInit();
        });
        return query;
    };
    /**
     * Query.equalTo
     */
    Query.prototype.equalTo = function (value, key) {
        var query = new Query({
            pluginName: this.pluginName,
            ref: this.ref,
            url: this.url,
        });
        this._on("nativeEvent", function (eventData) {
            query._trigger.call(query, "nativeEvent", eventData);
        });
        this.exec({
            args: [{
                    key: key,
                    queryId: query.id,
                    targetId: this.id,
                    value: index_1.LZString.compressToBase64(JSON.stringify(value)),
                }],
            context: this,
            methodName: "query_equalTo",
        })
            .then(function () {
            query._privateInit();
        });
        return query;
    };
    /**
     * Query.isEqual
     */
    Query.prototype.isEqual = function (other) {
        return this.toString() === other.toString();
    };
    /**
     * Query.limitToFirst
     */
    Query.prototype.limitToFirst = function (value, key) {
        var query = new Query({
            pluginName: this.pluginName,
            ref: this.ref,
            url: this.url,
        });
        this._on("nativeEvent", function (eventData) {
            query._trigger.call(query, "nativeEvent", eventData);
        });
        this.exec({
            args: [{
                    key: key,
                    queryId: query.id,
                    targetId: this.id,
                    value: index_1.LZString.compressToBase64(JSON.stringify(value)),
                }],
            context: this,
            methodName: "query_limitToFirst",
        })
            .then(function () {
            query._privateInit();
        });
        return query;
    };
    /**
     * Query.limitToLast
     */
    Query.prototype.limitToLast = function (value, key) {
        var query = new Query({
            pluginName: this.pluginName,
            ref: this.ref,
            url: this.url,
        });
        this._on("nativeEvent", function (eventData) {
            query._trigger.call(query, "nativeEvent", eventData);
        });
        this.exec({
            args: [{
                    key: key,
                    queryId: query.id,
                    targetId: this.id,
                    value: index_1.LZString.compressToBase64(JSON.stringify(value)),
                }],
            context: this,
            methodName: "query_limitToLast",
        })
            .then(function () {
            query._privateInit();
        });
        return query;
    };
    /**
     * Query.off
     */
    Query.prototype.off = function (eventType, callback, context) {
        var context_ = this;
        if (!context) {
            context_ = context;
        }
        eventType = eventType || "";
        eventType = eventType.toLowerCase();
        if (["value", "child_added", "child_moved", "child_removed", "child_changed"].indexOf(eventType) === -1) {
            var error = [
                "eventType must be one of ",
                "'value','child_added', 'child_moved', 'child_removed', or 'child_changed'.",
            ].join("");
            throw new Error(error);
        }
        var targetListeners = [];
        if (typeof callback === "function") {
            targetListeners = this._listeners.filter(function (info) {
                return info.callback === callback &&
                    info.eventType === eventType &&
                    info.context === context_;
            });
        }
        else if (eventType) {
            targetListeners = this._listeners.filter(function (info) {
                return info.callback === callback;
            });
        }
        else {
            targetListeners = this._listeners;
        }
        this.exec({
            args: [{
                    eventType: eventType,
                    listenerIdSet: targetListeners.map(function (info) {
                        return info.listenerId;
                    }),
                    targetId: this.id,
                }],
            context: this,
            methodName: "query_off",
            pluginName: this.pluginName,
        });
    };
    /**
     * Query.on
     */
    Query.prototype.on = function (eventType, callback, cancelCallbackOrContext, context) {
        var _this = this;
        var context_ = this;
        if (context) {
            context_ = context;
        }
        else if (typeof cancelCallbackOrContext === "object") {
            context_ = cancelCallbackOrContext;
            cancelCallbackOrContext = null;
        }
        eventType = eventType || "";
        eventType = eventType.toLowerCase();
        if (["value", "child_added", "child_moved", "child_removed", "child_changed"].indexOf(eventType) === -1) {
            var error = [
                "eventType must be one of ",
                "'value','child_added', 'child_moved', 'child_removed', or 'child_changed'.",
            ].join("");
            throw new Error(error);
        }
        var listenerId = this.id + "_" + eventType + Math.floor(Date.now() * Math.random());
        this._listeners.push({
            callback: callback,
            context: context_,
            eventType: eventType,
            listenerId: listenerId,
        });
        // Receive data from native side at once,
        this._on(listenerId, function (params) {
            if (params.eventType === "cancelled") {
                // permission error or something
                throw new Error(index_1.LZString.decompressFromBase64(params.args[0]));
            }
            else {
                var snapshotValues = JSON.parse(index_1.LZString.decompressFromBase64(params.args[0]));
                var prevChildKey = params.args[1];
                var snapshot = new DataSnapshot(_this.ref, snapshotValues);
                var args = [snapshot];
                if (prevChildKey) {
                    args.push(prevChildKey);
                }
                // Then trigger an event as eventType
                callback.apply(context_, args);
            }
        });
        this.exec({
            args: [{
                    eventType: eventType,
                    listenerId: listenerId,
                    targetId: this.id,
                }],
            context: this,
            methodName: "query_on",
            pluginName: this.pluginName,
        });
        return callback;
    };
    /**
     * Query.once
     */
    Query.prototype.once = function (eventType, callback, failureCallbackOrContext, context) {
        var _this = this;
        var context_ = this;
        if (context) {
            context_ = context;
        }
        else if (typeof failureCallbackOrContext === "object") {
            context_ = failureCallbackOrContext;
            failureCallbackOrContext = null;
        }
        eventType = eventType || "";
        eventType = eventType.toLowerCase();
        if (["value", "child_added", "child_moved", "child_removed", "child_changed"].indexOf(eventType) === -1) {
            var error = [
                "eventType must be one of ",
                "'value','child_added', 'child_moved', 'child_removed', or 'child_changed'.",
            ].join("");
            throw new Error(error);
        }
        return new Promise(function (resolve, reject) {
            var listener = _this.on(eventType, function (snapshot, key) {
                _this.off(eventType, listener);
                var args = [snapshot];
                if (key) {
                    args.push(key);
                }
                resolve.apply(context_, args);
                if (typeof callback === "function") {
                    callback.apply(context_, args);
                }
            }, function (error) {
                // cancelled
                _this.off(listener);
                reject(error);
                if (typeof failureCallbackOrContext === "function") {
                    failureCallbackOrContext.call(context_, error);
                }
            });
        });
    };
    /**
     * Query.orderByChild
     */
    Query.prototype.orderByChild = function (path) {
        var query = new Query({
            pluginName: this.pluginName,
            ref: this.ref,
            url: this.url,
        });
        this._on("nativeEvent", function (eventData) {
            query._trigger.call(query, "nativeEvent", eventData);
        });
        this.exec({
            args: [{
                    path: path,
                    queryId: query.id,
                    targetId: this.id,
                }],
            context: this,
            methodName: "query_orderByChild",
        })
            .then(function () {
            query._privateInit();
        });
        return query;
    };
    /**
     * Query.orderByKey
     */
    Query.prototype.orderByKey = function (path) {
        var query = new Query({
            pluginName: this.pluginName,
            ref: this.ref,
            url: this.url,
        });
        this._on("nativeEvent", function (eventData) {
            query._trigger.call(query, "nativeEvent", eventData);
        });
        this.exec({
            args: [{
                    queryId: query.id,
                    targetId: this.id,
                }],
            context: this,
            methodName: "query_orderByKey",
        })
            .then(function () {
            query._privateInit();
        });
        return query;
    };
    /**
     * Query.orderByPriority
     */
    Query.prototype.orderByPriority = function (path) {
        var query = new Query({
            pluginName: this.pluginName,
            ref: this.ref,
            url: this.url,
        });
        this._on("nativeEvent", function (eventData) {
            query._trigger.call(query, "nativeEvent", eventData);
        });
        this.exec({
            args: [{
                    queryId: query.id,
                    targetId: this.id,
                }],
            context: this,
            methodName: "query_orderByPriority",
        })
            .then(function () {
            query._privateInit();
        });
        return query;
    };
    /**
     * Query.orderByValue
     */
    Query.prototype.orderByValue = function (path) {
        var query = new Query({
            pluginName: this.pluginName,
            ref: this.ref,
            url: this.url,
        });
        this._on("nativeEvent", function (eventData) {
            query._trigger.call(query, "nativeEvent", eventData);
        });
        this.exec({
            args: [{
                    queryId: query.id,
                    targetId: this.id,
                }],
            context: this,
            methodName: "query_orderByValue",
        })
            .then(function () {
            query._privateInit();
        });
        return query;
    };
    /**
     * Query.startAt
     */
    Query.prototype.startAt = function (value, key) {
        var query = new Query({
            pluginName: this.pluginName,
            ref: this.ref,
            url: this.url,
        });
        this._on("nativeEvent", function (eventData) {
            query._trigger.call(query, "nativeEvent", eventData);
        });
        this.exec({
            args: [{
                    key: key,
                    queryId: query.id,
                    targetId: this.id,
                    value: index_1.LZString.compressToBase64(JSON.stringify(value)),
                }],
            context: this,
            methodName: "query_startAt",
        })
            .then(function () {
            query._privateInit();
        });
        return query;
    };
    /**
     * Query.toJSON
     */
    Query.prototype.toJSON = function () {
        throw new Error("Not implemented");
    };
    /**
     * Query.toString
     */
    Query.prototype.toString = function () {
        return this.url || null;
    };
    Query.prototype.exec = function (params) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            params.resolve = resolve;
            params.reject = reject;
            _this._queue._push(params);
        });
    };
    Query.prototype._forceRefUpdate = function (ref) {
        this._ref = ref;
    };
    return Query;
}(index_1.PluginBase));
exports.Query = Query;
var Reference = /** @class */ (function (_super) {
    __extends(Reference, _super);
    function Reference(params) {
        var _this = _super.call(this, params) || this;
        _this._parent = params.parent;
        _this._key = params.key;
        _this._forceRefUpdate(_this);
        return _this;
    }
    Object.defineProperty(Reference.prototype, "parent", {
        get: function () {
            return this._parent;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Reference.prototype, "key", {
        get: function () {
            return this._key;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Reference.child
     */
    Reference.prototype.child = function (path) {
        var key = null;
        if (path && typeof path === "string") {
            path = path.replace(/\/$/, "");
            key = path.replace(/^.*\//, "") || this.key;
        }
        else {
            throw new Error("Reference.child failed: Was called with 0 arguments. Expects at least 1.");
        }
        var reference = new Reference({
            key: key,
            parent: this,
            pluginName: this.pluginName,
            ref: null,
            url: this.url + "/" + path,
        });
        this._on("nativeEvent", function (eventData) {
            reference._trigger.call(reference, "nativeEvent", eventData);
        });
        this.exec({
            args: [{
                    childId: reference.id,
                    path: path,
                    targetId: this.id,
                }],
            context: this,
            methodName: "reference_child",
            pluginName: this.pluginName,
        })
            .then(function () {
            reference._privateInit();
        });
        return reference;
    };
    /**
     * Reference.onDisconnect
     */
    Reference.prototype.onDisconnect = function () {
        var onDisconnect = new OnDisconnect_1.OnDisconnect(this.pluginName);
        this.exec({
            args: [{
                    onDisconnectId: onDisconnect.id,
                    targetId: this.id,
                }],
            context: this,
            methodName: "reference_onDisconnect",
            pluginName: this.pluginName,
        })
            .then(function () {
            onDisconnect._privateInit();
        });
        return onDisconnect;
    };
    /**
     * Reference.push
     */
    Reference.prototype.push = function (value, onComplete) {
        var _this = this;
        var reference = new ThenableReference({
            key: this.key,
            pluginName: this.pluginName,
            ref: this,
            url: this.url,
        });
        this.exec({
            args: [{
                    newId: reference.id,
                    targetId: this.id,
                    value: index_1.LZString.compressToBase64(JSON.stringify(value)),
                }],
            context: this,
            methodName: "reference_push",
            pluginName: this.pluginName,
        })
            .then(function (result) {
            reference._privateInit();
            if (typeof reference.resolve === "function") {
                Promise.resolve(result).then(reference.resolve);
            }
            if (typeof onComplete === "function") {
                onComplete.call(_this);
            }
        }).catch(function (error) {
            if (typeof reference.reject === "function") {
                Promise.reject(error).then(reference.reject);
            }
            if (typeof onComplete === "function") {
                onComplete.call(_this, error);
            }
        });
        return reference;
    };
    /**
     * Reference.remove
     */
    Reference.prototype.remove = function (onComplete) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.exec({
                args: [{
                        targetId: _this.id,
                    }],
                context: _this,
                methodName: "reference_remove",
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
    /**
     * Reference.set
     */
    Reference.prototype.set = function (value, onComplete) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.exec({
                args: [{
                        data: index_1.LZString.compressToBase64(JSON.stringify(value)),
                        targetId: _this.id,
                    }],
                context: _this,
                methodName: "reference_set",
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
    /**
     * Reference.setPriority
     */
    Reference.prototype.setPriority = function (priority, onComplete) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.exec({
                args: [{
                        priority: index_1.LZString.compressToBase64(JSON.stringify(priority)),
                        targetId: _this.id,
                    }],
                context: _this,
                methodName: "reference_setPriority",
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
    /**
     * Reference.setWithPriority
     */
    Reference.prototype.setWithPriority = function (newVal, newPriority, onComplete) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.exec({
                args: [{
                        priority: index_1.LZString.compressToBase64(JSON.stringify(newPriority)),
                        targetId: _this.id,
                        value: index_1.LZString.compressToBase64(JSON.stringify(newVal)),
                    }],
                context: _this,
                methodName: "reference_setWithPriority",
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
    /**
     * Reference.transaction
     */
    Reference.prototype.transaction = function (transactionUpdate, onComplete, applyLocally) {
        var _this = this;
        var transactionId = Math.floor(Date.now() * Math.random()) + "_transaction";
        var eventName = this.pluginName + "-" + this.id + "-" + transactionId;
        if (cordova.platformId === "browser") {
            // ------------------------
            //       Browser
            // ------------------------
            return new Promise(function (resolve, reject) {
                var proxy = require("cordova/exec/proxy");
                var fbDbPlugin = proxy.get(_this.pluginName);
                var ref = fbDbPlugin._get(_this.id);
                ref.transaction(transactionUpdate, function (error, committed, snapshot) {
                    if (error) {
                        onComplete(error, false);
                    }
                    else {
                        var dataSnapshot = new DataSnapshot(_this, {
                            exists: snapshot.exists(),
                            exportVal: index_1.LZString.compressToBase64(JSON.stringify(snapshot.exportVal())),
                            getPriority: index_1.LZString.compressToBase64(snapshot.getPriority()),
                            key: snapshot.key,
                            numChildren: snapshot.numChildren(),
                            val: index_1.LZString.compressToBase64(JSON.stringify(snapshot.val())),
                        });
                        if (typeof onComplete === "function") {
                            onComplete(null, committed, dataSnapshot);
                        }
                        return Promise.resolve({
                            committed: committed,
                            snapshot: dataSnapshot,
                        });
                    }
                }, applyLocally);
            });
        }
        // ------------------------
        //    Android, iOS
        // ------------------------
        var onNativeCallback = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var newValue = transactionUpdate.call(_this, JSON.parse(index_1.LZString.decompressFromBase64(args[0])));
            cordova_1.exec(null, null, _this.pluginName, "reference_onTransactionCallback", [transactionId, index_1.LZString.compressToBase64(JSON.stringify(newValue))]);
        };
        document.addEventListener(eventName, onNativeCallback, {
            once: true,
        });
        return new Promise(function (resolve, reject) {
            _this.exec({
                args: [{
                        applyLocally: applyLocally,
                        eventName: eventName,
                        hashCode: _this.hashCode,
                        pluginName: _this.pluginName,
                        targetId: _this.id,
                        transactionId: transactionId,
                    }],
                context: _this,
                execOptions: {
                    sync: true,
                },
                methodName: "reference_transaction",
                pluginName: _this.pluginName,
            })
                .then(function (results) {
                var snapshotStr = index_1.LZString.decompressFromBase64(results.snapshot);
                var snapshotValues = JSON.parse(snapshotStr);
                var snapshot = new DataSnapshot(_this, snapshotValues);
                resolve({
                    committed: results.committed,
                    snapshot: snapshot,
                });
                if (typeof onComplete === "function") {
                    onComplete(null, results.committed, snapshot);
                }
            })
                .catch(function (error) {
                reject(error);
                if (typeof onComplete === "function") {
                    onComplete(error, false);
                }
            });
        });
    };
    /**
     * Reference.update
     */
    Reference.prototype.update = function (values, onComplete) {
        var _this = this;
        if (!values || typeof values !== "object") {
            throw new Error("values must contain key-value");
        }
        return new Promise(function (resolve, reject) {
            _this.exec({
                args: [{
                        data: index_1.LZString.compressToBase64(JSON.stringify(values)),
                        targetId: _this.id,
                    }],
                context: _this,
                methodName: "reference_update",
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
    return Reference;
}(Query));
exports.Reference = Reference;
var ThenableReference = /** @class */ (function (_super) {
    __extends(ThenableReference, _super);
    function ThenableReference(params) {
        return _super.call(this, params) || this;
    }
    ThenableReference.prototype.then = function (onResolve, onReject) {
        var _this = this;
        return (new Promise(function (_resolve, _reject) {
            _this.resolve = function (result) {
                _resolve.call(self, result);
            };
            _this.reject = function (error) {
                _reject.call(self, error);
            };
        }))
            .then(function () {
            var result = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                result[_i] = arguments[_i];
            }
            if (typeof onResolve === "function") {
                onResolve.apply(_this, result);
            }
            return Promise.resolve(result[0]);
        })
            .catch(function (error) {
            if (typeof onReject === "function") {
                onReject.call(_this, error);
            }
            return Promise.reject(error);
        });
    };
    return ThenableReference;
}(Reference));
exports.ThenableReference = ThenableReference;
var DataSnapshot = /** @class */ (function () {
    function DataSnapshot(ref, nativeResults) {
        this._ref = ref;
        this._nativeResults = nativeResults;
        this._key = nativeResults.key;
    }
    Object.defineProperty(DataSnapshot.prototype, "ref", {
        get: function () {
            return this._ref;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataSnapshot.prototype, "key", {
        get: function () {
            return this._key;
        },
        enumerable: true,
        configurable: true
    });
    DataSnapshot.prototype.forEach = function (action) {
        var values = JSON.parse(this._nativeResults.val);
        var keys = (Object.keys(values)).sort();
        var sortedValues = keys.map(function (key) {
            return values[key];
        });
        sortedValues.forEach(action);
    };
    DataSnapshot.prototype.getPriority = function () {
        return this._nativeResults.getPriority;
    };
    DataSnapshot.prototype.hasChild = function (path) {
        var values = JSON.parse(this._nativeResults.val);
        return path in values;
    };
    DataSnapshot.prototype.numChildren = function () {
        return this._nativeResults.numChildren;
    };
    DataSnapshot.prototype.exportVal = function () {
        return JSON.parse(index_1.LZString.decompressFromBase64(this._nativeResults.exportVal));
    };
    DataSnapshot.prototype.val = function () {
        return JSON.parse(index_1.LZString.decompressFromBase64(this._nativeResults.val));
    };
    DataSnapshot.prototype.toJSON = function () {
        throw new Error("This method is not implemented");
    };
    return DataSnapshot;
}());
