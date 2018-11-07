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
/**
 * This is implementation of the code for browser native side.
 * Don't use this in user code.
 * @hidden
 */
var FirebaseDatabasePlugin = /** @class */ (function (_super) {
    __extends(FirebaseDatabasePlugin, _super);
    function FirebaseDatabasePlugin(id, database) {
        var _this = _super.call(this) || this;
        _this._id = id;
        _this._database = database;
        return _this;
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
    FirebaseDatabasePlugin.prototype.database_goOffline = function (onSuccess, onError) {
        try {
            this.database.goOffline();
            onSuccess();
        }
        catch (e) {
            onError(e);
        }
    };
    FirebaseDatabasePlugin.prototype.database_goOnline = function (onSuccess, onError) {
        try {
            this.database.goOnline();
            onSuccess();
        }
        catch (e) {
            onError(e);
        }
    };
    FirebaseDatabasePlugin.prototype.database_ref = function (onSuccess, onError, args) {
        try {
            var options = args[0];
            var ref = this.database.ref(options.path);
            this._set(options.id, ref);
            onSuccess();
        }
        catch (e) {
            onError(e);
        }
    };
    FirebaseDatabasePlugin.prototype.onDisconnect_cancel = function (onSuccess, onError, args) {
        try {
            var options = args[0];
            var onDisconnect = this._get(options.targetId);
            onDisconnect.cancel().then(onSuccess).catch(onError);
        }
        catch (e) {
            onError(e);
        }
    };
    FirebaseDatabasePlugin.prototype.onDisconnect_remove = function (onSuccess, onError, args) {
        try {
            var options = args[0];
            var onDisconnect = this._get(options.targetId);
            onDisconnect.remove().then(onSuccess).catch(onError);
        }
        catch (e) {
            onError(e);
        }
    };
    FirebaseDatabasePlugin.prototype.onDisconnect_set = function (onSuccess, onError, args) {
        try {
            var options = args[0];
            var onDisconnect = this._get(options.targetId);
            var value = JSON.parse(index_1.LZString.decompressFromBase64(options.value));
            onDisconnect.set(value).then(onSuccess).catch(onError);
        }
        catch (e) {
            onError(e);
        }
    };
    FirebaseDatabasePlugin.prototype.onDisconnect_setWithPriority = function (onSuccess, onError, args) {
        try {
            var options = args[0];
            var onDisconnect = this._get(options.targetId);
            var value = JSON.parse(index_1.LZString.decompressFromBase64(options.value));
            var priority = JSON.parse(index_1.LZString.decompressFromBase64(options.priority));
            onDisconnect.setWithPriority(value, priority).then(onSuccess).catch(onError);
        }
        catch (e) {
            onError(e);
        }
    };
    FirebaseDatabasePlugin.prototype.onDisconnect_update = function (onSuccess, onError, args) {
        try {
            var options = args[0];
            var onDisconnect = this._get(options.targetId);
            var value = JSON.parse(index_1.LZString.decompressFromBase64(options.value));
            onDisconnect.update(value).then(onSuccess).catch(onError);
        }
        catch (e) {
            onError(e);
        }
    };
    FirebaseDatabasePlugin.prototype.reference_child = function (onSuccess, onError, args) {
        try {
            var options = args[0];
            var ref = this._get(options.targetId);
            var childRef = ref.child(options.path);
            this._set(options.childId, childRef);
            onSuccess({
                key: childRef.key,
                url: childRef.toString(),
            });
        }
        catch (e) {
            onError(e);
        }
    };
    FirebaseDatabasePlugin.prototype.reference_onDisconnect = function (onSuccess, onError, args) {
        try {
            var options = args[0];
            var ref = this._get(options.targetId);
            var onDisconnect = ref.onDisconnect();
            this._set(options.onDisconnectId, onDisconnect);
            onSuccess();
        }
        catch (e) {
            onError(e);
        }
    };
    FirebaseDatabasePlugin.prototype.reference_push = function (onSuccess, onError, args) {
        try {
            var options = args[0];
            var ref = this._get(options.targetId);
            var thenableRef = (options.value) ?
                ref.push(JSON.parse(index_1.LZString.decompressFromBase64(options.value))) : ref.push();
            this._set(options.onDisconnectId, thenableRef);
            thenableRef.then(function () {
                onSuccess();
                // onSuccess({
                //   key: thenableRef.key,
                //   url: thenableRef.toString(),
                // });
            }).catch(onError);
        }
        catch (e) {
            onError(e);
        }
    };
    FirebaseDatabasePlugin.prototype.reference_remove = function (onSuccess, onError, args) {
        try {
            var options_1 = args[0];
            var ref = this._get(options_1.targetId);
            ref.remove().then(function () {
                this._delete(options_1.targetId);
                onSuccess();
            }).catch(onError);
        }
        catch (e) {
            onError(e);
        }
    };
    FirebaseDatabasePlugin.prototype.reference_set = function (onSuccess, onError, args) {
        try {
            var options = args[0];
            var ref = this._get(options.targetId);
            ref.set(JSON.parse(index_1.LZString.decompressFromBase64(options.data)))
                .then(onSuccess).catch(onError);
        }
        catch (e) {
            onError(e);
        }
    };
    FirebaseDatabasePlugin.prototype.reference_setPriority = function (onSuccess, onError, args) {
        try {
            var options = args[0];
            var ref = this._get(options.targetId);
            ref.setPriority(JSON.parse(index_1.LZString.decompressFromBase64(options.priority)))
                .then(onSuccess).catch(onError);
        }
        catch (e) {
            onError(e);
        }
    };
    FirebaseDatabasePlugin.prototype.reference_setWithPriority = function (onSuccess, onError, args) {
        try {
            var options = args[0];
            var ref = this._get(options.targetId);
            var data = JSON.parse(index_1.LZString.decompressFromBase64(options.data));
            var priority = JSON.parse(index_1.LZString.decompressFromBase64(options.priority));
            ref.setWithPriority(data, priority)
                .then(onSuccess).catch(onError);
        }
        catch (e) {
            onError(e);
        }
    };
    FirebaseDatabasePlugin.prototype.reference_update = function (onSuccess, onError, args) {
        try {
            var options = args[0];
            var ref = this._get(options.targetId);
            ref.update(JSON.parse(index_1.LZString.decompressFromBase64(options.data)))
                .then(onSuccess).catch(onError);
        }
        catch (e) {
            onError(e);
        }
    };
    FirebaseDatabasePlugin.prototype.query_endAt = function (onSuccess, onError, args) {
        try {
            var options = args[0];
            var ref = this._get(options.targetId);
            var value = JSON.parse(index_1.LZString.decompressFromBase64(options.value));
            var query = ref.endAt(value, options.key);
            this._set(options.queryId, query);
            onSuccess();
        }
        catch (e) {
            onError(e);
        }
    };
    FirebaseDatabasePlugin.prototype.query_equalTo = function (onSuccess, onError, args) {
        try {
            var options = args[0];
            var ref = this._get(options.targetId);
            var value = JSON.parse(index_1.LZString.decompressFromBase64(options.value));
            var query = ref.equalTo(value, options.key);
            this._set(options.queryId, query);
            onSuccess();
        }
        catch (e) {
            onError(e);
        }
    };
    FirebaseDatabasePlugin.prototype.query_limitToFirst = function (onSuccess, onError, args) {
        try {
            var options = args[0];
            var ref = this._get(options.targetId);
            var query = ref.limitToFirst(options.limit);
            this._set(options.queryId, query);
            onSuccess();
        }
        catch (e) {
            onError(e);
        }
    };
    FirebaseDatabasePlugin.prototype.query_limitToLast = function (onSuccess, onError, args) {
        try {
            var options = args[0];
            var ref = this._get(options.targetId);
            var query = ref.limitToLast(options.limit);
            this._set(options.queryId, query);
            onSuccess();
        }
        catch (e) {
            onError(e);
        }
    };
    FirebaseDatabasePlugin.prototype.query_off = function (onSuccess, onError, args) {
        var _this = this;
        try {
            var options_2 = args[0];
            var refOrQuery_1 = this._get(options_2.targetId);
            options_2.listenerIdSet.forEach(function (listenerId) {
                refOrQuery_1.off(options_2.eventType, _this._get(listenerId));
                _this._delete(listenerId);
            });
            onSuccess();
        }
        catch (e) {
            onError(e);
        }
    };
    FirebaseDatabasePlugin.prototype.query_on = function (onSuccess, onError, args) {
        var _this = this;
        try {
            var options_3 = args[0];
            var refOrQuery = this._get(options_3.targetId);
            var listener = refOrQuery.on(options_3.eventType, function (snapshot, prevChildKey) {
                var snapshotValues = {
                    exists: snapshot.exists(),
                    exportVal: index_1.LZString.compressToBase64(JSON.stringify(snapshot.exportVal())),
                    getPriority: snapshot.getPriority(),
                    key: snapshot.key,
                    numChildren: snapshot.numChildren(),
                    val: index_1.LZString.compressToBase64(JSON.stringify(snapshot.val())),
                };
                var snapshotStr = index_1.LZString.compressToBase64(JSON.stringify(snapshotValues));
                var args2 = [snapshotStr];
                if (prevChildKey) {
                    args2.push(prevChildKey);
                }
                window.plugin.firebase.database._nativeCallback(_this.id, options_3.listenerId, options_3.eventType, args2);
            });
            this._set(options_3.listenerId, listener);
            onSuccess();
        }
        catch (e) {
            onError(e);
        }
    };
    FirebaseDatabasePlugin.prototype.query_orderByChild = function (onSuccess, onError, args) {
        try {
            var options = args[0];
            var refOrQuery = this._get(options.targetId);
            var query = refOrQuery.orderByChild(options.path);
            this._set(options.listenerId, query);
            onSuccess();
        }
        catch (e) {
            onError(e);
        }
    };
    FirebaseDatabasePlugin.prototype.query_orderByKey = function (onSuccess, onError, args) {
        try {
            var options = args[0];
            var refOrQuery = this._get(options.targetId);
            var query = refOrQuery.orderByKey();
            this._set(options.listenerId, query);
            onSuccess();
        }
        catch (e) {
            onError(e);
        }
    };
    FirebaseDatabasePlugin.prototype.query_orderByPriority = function (onSuccess, onError, args) {
        try {
            var options = args[0];
            var refOrQuery = this._get(options.targetId);
            var query = refOrQuery.orderByPriority();
            this._set(options.listenerId, query);
            onSuccess();
        }
        catch (e) {
            onError(e);
        }
    };
    FirebaseDatabasePlugin.prototype.query_orderByValue = function (onSuccess, onError, args) {
        try {
            var options = args[0];
            var refOrQuery = this._get(options.targetId);
            var query = refOrQuery.orderByValue();
            this._set(options.listenerId, query);
            onSuccess();
        }
        catch (e) {
            onError(e);
        }
    };
    FirebaseDatabasePlugin.prototype.query_startAt = function (onSuccess, onError, args) {
        try {
            var options = args[0];
            var ref = this._get(options.targetId);
            var value = JSON.parse(index_1.LZString.decompressFromBase64(options.value));
            var query = ref.startAt(value, options.key);
            this._set(options.listenerId, query);
            onSuccess();
        }
        catch (e) {
            onError(e);
        }
    };
    return FirebaseDatabasePlugin;
}(index_1.BaseClass));
exports.FirebaseDatabasePlugin = FirebaseDatabasePlugin;
