"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cordova_1 = require("cordova");
const index_1 = require("cordova-firebase-core/index");
const OnDisconnect_1 = require("./OnDisconnect");
class Query extends index_1.PluginBase {
    constructor(params, _opts) {
        super("queryOrReference");
        this._queue = new index_1.BaseArrayClass();
        this._listeners = [];
        this._pluginName = params.pluginName;
        this._ref = params.ref;
        params.url = params.url.replace(/\/+/g, "/");
        params.url = params.url.replace(/https:\//, "https://");
        this._url = params.url;
        if (!_opts || !_opts.exec) {
            throw new Error("_opts must be provided.");
        }
        // Bubbling native events
        this._on("nativeEvent", (data) => {
            this._trigger.call(this, data.listenerId, data);
        });
        this._queue._on("insert_at", () => {
            if (!this._isReady) {
                return;
            }
            if (this._queue._getLength() > 0) {
                const cmd = this._queue._removeAt(0, true);
                if (cmd && cmd.context && cmd.methodName) {
                    _opts.exec(cmd).then(cmd.resolve).catch(cmd.reject);
                }
            }
            if (this._queue._getLength() > 0) {
                this._queue._trigger("insert_at");
            }
        });
        if (!_opts.noInit) {
            this._queue._one("insert_at", () => {
                _opts.exec({
                    args: [{
                            id: this.id,
                            path: this.url.replace(/^.+firebaseio.com\//i, ""),
                        }],
                    context: this,
                    methodName: "database_ref",
                    pluginName: this.pluginName,
                }).then(() => {
                    this._isReady = true;
                    this._queue._trigger("insert_at");
                });
            });
        }
    }
    get pluginName() {
        return this._pluginName;
    }
    get ref() {
        return this._ref;
    }
    get url() {
        return this._url;
    }
    /**
     * Query.endAt
     */
    endAt(value, key) {
        const query = new Query({
            pluginName: this.pluginName,
            ref: this.ref,
            url: this.url,
        }, {
            exec: this.exec.bind(this),
        });
        this._on("nativeEvent", (eventData) => {
            query._trigger.call(query, "nativeEvent", eventData);
        });
        this.exec({
            args: [{
                    key,
                    queryId: query.id,
                    targetId: this.id,
                    value: index_1.LZString.compressToBase64(JSON.stringify(value)),
                }],
            context: this,
            methodName: "query_endAt",
            pluginName: this.pluginName,
        });
        return query;
    }
    /**
     * Query.equalTo
     */
    equalTo(value, key) {
        const query = new Query({
            pluginName: this.pluginName,
            ref: this.ref,
            url: this.url,
        }, {
            exec: this.exec.bind(this),
        });
        this._on("nativeEvent", (eventData) => {
            query._trigger.call(query, "nativeEvent", eventData);
        });
        this.exec({
            args: [{
                    key,
                    queryId: query.id,
                    targetId: this.id,
                    value: index_1.LZString.compressToBase64(JSON.stringify(value)),
                }],
            context: this,
            methodName: "query_equalTo",
            pluginName: this.pluginName,
        });
        return query;
    }
    /**
     * Query.isEqual
     */
    isEqual(other) {
        return this.toString() === other.toString();
    }
    /**
     * Query.limitToFirst
     */
    limitToFirst(limit) {
        const query = new Query({
            pluginName: this.pluginName,
            ref: this.ref,
            url: this.url,
        }, {
            exec: this.exec.bind(this),
        });
        this._on("nativeEvent", (eventData) => {
            query._trigger.call(query, "nativeEvent", eventData);
        });
        this.exec({
            args: [{
                    limit,
                    queryId: query.id,
                    targetId: this.id,
                }],
            context: this,
            methodName: "query_limitToFirst",
            pluginName: this.pluginName,
        });
        return query;
    }
    /**
     * Query.limitToLast
     */
    limitToLast(limit) {
        const query = new Query({
            pluginName: this.pluginName,
            ref: this.ref,
            url: this.url,
        }, {
            exec: this.exec.bind(this),
        });
        this._on("nativeEvent", (eventData) => {
            query._trigger.call(query, "nativeEvent", eventData);
        });
        this.exec({
            args: [{
                    limit,
                    queryId: query.id,
                    targetId: this.id,
                }],
            context: this,
            methodName: "query_limitToLast",
            pluginName: this.pluginName,
        });
        return query;
    }
    /**
     * Query.off
     */
    off(eventType, callback, context) {
        let context_ = this;
        if (!context) {
            context_ = context;
        }
        eventType = eventType || "";
        eventType = eventType.toLowerCase();
        if (["value", "child_added", "child_moved", "child_removed", "child_changed"].indexOf(eventType) === -1) {
            const error = [
                "eventType must be one of ",
                "'value','child_added', 'child_moved', 'child_removed', or 'child_changed'.",
            ].join("");
            throw new Error(error);
        }
        let targetListeners = [];
        if (typeof callback === "function") {
            targetListeners = this._listeners.filter((info) => {
                return info.callback === callback &&
                    info.eventType === eventType;
            });
        }
        else if (eventType) {
            targetListeners = this._listeners.filter((info) => {
                return info.callback === callback;
            });
        }
        else {
            targetListeners = this._listeners;
        }
        this._listeners = this._listeners.filter((info) => {
            return targetListeners.indexOf(info) === -1;
        });
        targetListeners.forEach((info) => {
            this._off(info.listenerId);
        });
        this.exec({
            args: [{
                    eventType,
                    listenerIdSet: targetListeners.map((info) => {
                        return info.listenerId;
                    }),
                    targetId: this.id,
                }],
            context: this,
            methodName: "query_off",
            pluginName: this.pluginName,
        });
    }
    /**
     * Query.on
     */
    on(eventType, callback, cancelCallbackOrContext, context) {
        let context_ = this;
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
            const error = [
                "eventType must be one of ",
                "'value','child_added', 'child_moved', 'child_removed', or 'child_changed'.",
            ].join("");
            throw new Error(error);
        }
        const listenerId = this.id + "_" + eventType + Math.floor(Date.now() * Math.random());
        this._listeners.push({
            callback,
            context: context_,
            eventType,
            listenerId,
        });
        // Receive data from native side at once,
        this._on(listenerId, (params) => {
            if (params.eventType === "cancelled") {
                // permission error or something
                throw new Error(index_1.LZString.decompressFromBase64(params.args[0]));
            }
            else {
                const snapshotValues = JSON.parse(index_1.LZString.decompressFromBase64(params.args[0]));
                const prevChildKey = params.args[1];
                const snapshot = new DataSnapshot(this.ref, snapshotValues);
                const args = [snapshot];
                if (prevChildKey) {
                    args.push(prevChildKey);
                }
                // Then trigger an event as eventType
                callback.apply(context_, args);
            }
        });
        this.exec({
            args: [{
                    eventType,
                    listenerId,
                    targetId: this.id,
                }],
            context: this,
            methodName: "query_on",
            pluginName: this.pluginName,
        });
        return callback;
    }
    /**
     * Query.once
     */
    once(eventType, callback, failureCallbackOrContext, context) {
        let context_ = this;
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
            const error = [
                "eventType must be one of ",
                "'value','child_added', 'child_moved', 'child_removed', or 'child_changed'.",
            ].join("");
            throw new Error(error);
        }
        return new Promise((resolve, reject) => {
            const listener = this.on(eventType, (snapshot, key) => {
                this.off(eventType, listener);
                const args = [snapshot];
                if (key) {
                    args.push(key);
                }
                resolve(snapshot);
                if (typeof callback === "function") {
                    callback.apply(context_, args);
                }
            }, (error) => {
                // cancelled
                this.off(listener);
                reject(error);
                if (typeof failureCallbackOrContext === "function") {
                    failureCallbackOrContext.call(context_, error);
                }
            });
        });
    }
    /**
     * Query.orderByChild
     */
    orderByChild(path) {
        const query = new Query({
            pluginName: this.pluginName,
            ref: this.ref,
            url: this.url,
        }, {
            exec: this.exec.bind(this),
        });
        this._on("nativeEvent", (eventData) => {
            query._trigger.call(query, "nativeEvent", eventData);
        });
        this.exec({
            args: [{
                    path,
                    queryId: query.id,
                    targetId: this.id,
                }],
            context: this,
            methodName: "query_orderByChild",
            pluginName: this.pluginName,
        });
        return query;
    }
    /**
     * Query.orderByKey
     */
    orderByKey() {
        const query = new Query({
            pluginName: this.pluginName,
            ref: this.ref,
            url: this.url,
        }, {
            exec: this.exec.bind(this),
        });
        this._on("nativeEvent", (eventData) => {
            query._trigger.call(query, "nativeEvent", eventData);
        });
        this.exec({
            args: [{
                    queryId: query.id,
                    targetId: this.id,
                }],
            context: this,
            methodName: "query_orderByKey",
            pluginName: this.pluginName,
        });
        return query;
    }
    /**
     * Query.orderByPriority
     */
    orderByPriority() {
        const query = new Query({
            pluginName: this.pluginName,
            ref: this.ref,
            url: this.url,
        }, {
            exec: this.exec.bind(this),
        });
        this._on("nativeEvent", (eventData) => {
            query._trigger.call(query, "nativeEvent", eventData);
        });
        this.exec({
            args: [{
                    queryId: query.id,
                    targetId: this.id,
                }],
            context: this,
            methodName: "query_orderByPriority",
            pluginName: this.pluginName,
        });
        return query;
    }
    /**
     * Query.orderByValue
     */
    orderByValue() {
        const query = new Query({
            pluginName: this.pluginName,
            ref: this.ref,
            url: this.url,
        }, {
            exec: this.exec.bind(this),
        });
        this._on("nativeEvent", (eventData) => {
            query._trigger.call(query, "nativeEvent", eventData);
        });
        this.exec({
            args: [{
                    queryId: query.id,
                    targetId: this.id,
                }],
            context: this,
            methodName: "query_orderByValue",
            pluginName: this.pluginName,
        });
        return query;
    }
    /**
     * Query.startAt
     */
    startAt(value, key) {
        const query = new Query({
            pluginName: this.pluginName,
            ref: this.ref,
            url: this.url,
        }, {
            exec: this.exec.bind(this),
        });
        this._on("nativeEvent", (eventData) => {
            query._trigger.call(query, "nativeEvent", eventData);
        });
        this.exec({
            args: [{
                    key,
                    queryId: query.id,
                    targetId: this.id,
                    value: index_1.LZString.compressToBase64(JSON.stringify(value)),
                }],
            context: this,
            methodName: "query_startAt",
            pluginName: this.pluginName,
        });
        return query;
    }
    /**
     * Query.toJSON
     */
    toJSON() {
        throw new Error("Not implemented");
    }
    /**
     * Query.toString
     */
    toString() {
        return this.url || null;
    }
    exec(params) {
        return new Promise((resolve, reject) => {
            this._queue._push({
                args: params.args,
                context: this,
                execOptions: params.execOptions,
                methodName: params.methodName,
                pluginName: params.pluginName,
                reject,
                resolve,
            });
        });
    }
}
exports.Query = Query;
class Reference extends Query {
    constructor(params, _opts) {
        super(params, _opts);
        this._parent = params.parent;
        this._key = params.key;
        this._rootRef = this;
        if (_opts && _opts.root) {
            this._rootRef = _opts.root;
        }
        // Bubbling native events
        const parentRef = this._parent || this._rootRef;
        if (parentRef && parentRef !== this) {
            parentRef._on("nativeEvent", (data) => {
                this._trigger.call(this, "nativeEvent", data);
            });
        }
    }
    get root() {
        return this._rootRef;
    }
    get parent() {
        return this._parent;
    }
    get key() {
        return this._key;
    }
    /**
     * Reference.child
     */
    child(path) {
        if (typeof path !== "string") {
            throw new Error("Reference.child failed: Was called with 0 arguments. Expects at least 1.");
        }
        if (path === "" || /[\.#$\[\]]/.test(path)) {
            throw new Error([
                "First argument was an invalid path = \"" + path + "\".",
                "Paths must be non-empty strings and can't contain \".\", \"#\", \"$\", \"[\", or \"]\"",
            ].join(" "));
        }
        path = path.replace(/\/$/, "");
        const key = path.replace(/^.*\//, "") || this.key;
        const reference = new Reference({
            key,
            parent: this,
            pluginName: this.pluginName,
            url: this.url + "/" + path,
        }, {
            exec: this.exec.bind(this),
            root: this._rootRef,
        });
        //
        // this._on("nativeEvent", (eventData: INativeEventParams) => {
        //   reference._trigger.call(reference, "nativeEvent", eventData);
        // });
        // this.exec({
        //   args: [{
        //     childId: reference.id,
        //     path,
        //     targetId: this.id,
        //   }],
        //   context: this,
        //   methodName: "reference_child",
        //   pluginName: this.pluginName,
        // // })
        // // .then((): void => {
        // //   reference._privateInit();
        // });
        return reference;
    }
    /**
     * Reference.onDisconnect
     */
    onDisconnect() {
        const onDisconnect = new OnDisconnect_1.OnDisconnect(this.pluginName);
        this.exec({
            args: [{
                    onDisconnectId: onDisconnect.id,
                    targetId: this.id,
                }],
            context: this,
            methodName: "reference_onDisconnect",
            pluginName: this.pluginName,
        })
            .then(() => {
            onDisconnect._privateInit();
        });
        return onDisconnect;
    }
    /**
     * Reference.push
     */
    push(value, onComplete) {
        const reference = new ThenableReference({
            key: this.key,
            pluginName: this.pluginName,
            url: this.url,
        }, {
            exec: this.exec.bind(this),
            noInit: true,
            root: this.root,
        });
        cordova_1.exec((result) => {
            if (typeof reference.resolve === "function") {
                Promise.resolve(result).then(reference.resolve);
            }
            if (typeof onComplete === "function") {
                onComplete.call(this);
            }
        }, (error) => {
            if (typeof reference.reject === "function") {
                Promise.reject(error).then(reference.reject);
            }
            if (typeof onComplete === "function") {
                onComplete.call(this, error);
            }
        }, this.pluginName, "reference_push", [{
                newId: reference.id,
                targetId: this.id,
                value: index_1.LZString.compressToBase64(JSON.stringify(value)),
            }]);
        return reference;
    }
    /**
     * Reference.remove
     */
    remove(onComplete) {
        return new Promise((resolve, reject) => {
            this.exec({
                args: [{
                        targetId: this.id,
                    }],
                context: this,
                methodName: "reference_remove",
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
    /**
     * Reference.set
     */
    set(value, onComplete) {
        return new Promise((resolve, reject) => {
            this.exec({
                args: [{
                        data: index_1.LZString.compressToBase64(JSON.stringify(value)),
                        targetId: this.id,
                    }],
                context: this,
                methodName: "reference_set",
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
    /**
     * Reference.setPriority
     */
    setPriority(priority, onComplete) {
        return new Promise((resolve, reject) => {
            this.exec({
                args: [{
                        priority,
                        targetId: this.id,
                    }],
                context: this,
                methodName: "reference_setPriority",
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
    /**
     * Reference.setWithPriority
     */
    setWithPriority(newVal, newPriority, onComplete) {
        return new Promise((resolve, reject) => {
            this.exec({
                args: [{
                        priority: newPriority,
                        targetId: this.id,
                        value: index_1.LZString.compressToBase64(JSON.stringify(newVal)),
                    }],
                context: this,
                methodName: "reference_setWithPriority",
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
    /**
     * Reference.transaction
     */
    transaction(transactionUpdate, onComplete, applyLocally) {
        const transactionId = Math.floor(Date.now() * Math.random()) + "_transaction";
        const eventName = this.pluginName + "-" + this.id + "-" + transactionId;
        const nativeParams = {
            applyLocally,
            eventName,
            hashCode: this.hashCode,
            pluginName: this.pluginName,
            targetId: this.id,
            transactionId,
        };
        if (cordova.platformId === "browser") {
            // ------------------------
            //       Browser
            // ------------------------
            nativeParams.transactionUpdate = transactionUpdate;
        }
        else {
            // ------------------------
            //    Android, iOS
            // ------------------------
            const onNativeCallback = (...args) => {
                const newValue = transactionUpdate.call(this, JSON.parse(index_1.LZString.decompressFromBase64(args[0])));
                cordova_1.exec(null, null, this.pluginName, "reference_onTransactionCallback", [transactionId, index_1.LZString.compressToBase64(JSON.stringify(newValue))]);
            };
            document.addEventListener(eventName, onNativeCallback, {
                once: true,
            });
        }
        return new Promise((resolve, reject) => {
            this.exec({
                args: [nativeParams],
                context: this,
                execOptions: {
                    sync: true,
                },
                methodName: "reference_transaction",
                pluginName: this.pluginName,
            })
                .then((results) => {
                const snapshotStr = index_1.LZString.decompressFromBase64(results.snapshot);
                const snapshotValues = JSON.parse(snapshotStr);
                const snapshot = new DataSnapshot(this, snapshotValues);
                resolve({
                    committed: results.committed,
                    snapshot,
                });
                if (typeof onComplete === "function") {
                    onComplete(null, results.committed, snapshot);
                }
            })
                .catch((error) => {
                reject(error);
                if (typeof onComplete === "function") {
                    onComplete(error, false);
                }
            });
        });
    }
    /**
     * Reference.update
     */
    update(values, onComplete) {
        if (!values || typeof values !== "object") {
            throw new Error("values must contain key-value");
        }
        return new Promise((resolve, reject) => {
            this.exec({
                args: [{
                        data: index_1.LZString.compressToBase64(JSON.stringify(values)),
                        targetId: this.id,
                    }],
                context: this,
                methodName: "reference_update",
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
}
exports.Reference = Reference;
class ThenableReference extends Reference {
    constructor(params, _opts) {
        super(params, _opts);
        this._isReady = true;
    }
    then(onResolve, onReject) {
        return (new Promise((_resolve, _reject) => {
            this.resolve = (result) => {
                _resolve.call(self, result);
            };
            this.reject = (error) => {
                _reject.call(self, error);
            };
        }))
            .then((...result) => {
            if (typeof onResolve === "function") {
                onResolve.apply(this, result);
            }
            return Promise.resolve(result[0]);
        })
            .catch((error) => {
            if (typeof onReject === "function") {
                onReject.call(this, error);
            }
            return Promise.reject(error);
        });
    }
}
exports.ThenableReference = ThenableReference;
class DataSnapshot {
    constructor(ref, nativeResults) {
        this._ref = ref;
        this._nativeResults = nativeResults;
        this._key = nativeResults.key;
    }
    get ref() {
        return this._ref;
    }
    get key() {
        return this._key;
    }
    forEach(action) {
        const values = JSON.parse(this._nativeResults.val);
        const keys = (Object.keys(values)).sort();
        const sortedValues = keys.map((key) => {
            return values[key];
        });
        sortedValues.forEach(action);
    }
    getPriority() {
        return this._nativeResults.getPriority;
    }
    hasChild(path) {
        const values = JSON.parse(this._nativeResults.val);
        return path in values;
    }
    numChildren() {
        return this._nativeResults.numChildren;
    }
    exportVal() {
        return JSON.parse(index_1.LZString.decompressFromBase64(this._nativeResults.exportVal));
    }
    val() {
        return JSON.parse(index_1.LZString.decompressFromBase64(this._nativeResults.val));
    }
    toJSON() {
        throw new Error("This method is not implemented");
    }
}
exports.DataSnapshot = DataSnapshot;
