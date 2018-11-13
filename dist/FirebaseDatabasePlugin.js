"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("cordova-firebase-core/index");
const STUB_SUCCESS = (...params) => { return; };
const STUB_ERROR = (e) => { console.error(e); };
/**
 * This is implementation of the code for browser native side.
 * Don't use this in user code.
 * @hidden
 */
class FirebaseDatabasePlugin extends index_1.BaseClass {
    constructor(id, database) {
        super();
        this._id = id;
        this._database = database;
    }
    get id() {
        return this._id;
    }
    get database() {
        return this._database;
    }
    database_goOffline(onSuccess, onError) {
        onSuccess = onSuccess || STUB_SUCCESS;
        onError = onError || STUB_ERROR;
        try {
            this.database.goOffline();
            onSuccess();
        }
        catch (e) {
            onError(e);
        }
    }
    database_goOnline(onSuccess, onError) {
        onSuccess = onSuccess || STUB_SUCCESS;
        onError = onError || STUB_ERROR;
        try {
            this.database.goOnline();
            onSuccess();
        }
        catch (e) {
            onError(e);
        }
    }
    database_ref(onSuccess, onError, args) {
        onSuccess = onSuccess || STUB_SUCCESS;
        onError = onError || STUB_ERROR;
        try {
            const options = args[0];
            const ref = this.database.ref(options.path);
            this._set(options.id, ref);
            onSuccess();
        }
        catch (e) {
            onError(e);
        }
    }
    onDisconnect_cancel(onSuccess, onError, args) {
        onSuccess = onSuccess || STUB_SUCCESS;
        onError = onError || STUB_ERROR;
        try {
            const options = args[0];
            const onDisconnect = this._get(options.targetId);
            onDisconnect.cancel().then(onSuccess).catch(onError);
        }
        catch (e) {
            onError(e);
        }
    }
    onDisconnect_remove(onSuccess, onError, args) {
        onSuccess = onSuccess || STUB_SUCCESS;
        onError = onError || STUB_ERROR;
        try {
            const options = args[0];
            const onDisconnect = this._get(options.targetId);
            onDisconnect.remove().then(onSuccess).catch(onError);
        }
        catch (e) {
            onError(e);
        }
    }
    onDisconnect_set(onSuccess, onError, args) {
        onSuccess = onSuccess || STUB_SUCCESS;
        onError = onError || STUB_ERROR;
        try {
            const options = args[0];
            const onDisconnect = this._get(options.targetId);
            const value = JSON.parse(index_1.LZString.decompressFromBase64(options.value));
            onDisconnect.set(value).then(onSuccess).catch(onError);
        }
        catch (e) {
            onError(e);
        }
    }
    onDisconnect_setWithPriority(onSuccess, onError, args) {
        onSuccess = onSuccess || STUB_SUCCESS;
        onError = onError || STUB_ERROR;
        try {
            const options = args[0];
            const onDisconnect = this._get(options.targetId);
            const value = JSON.parse(index_1.LZString.decompressFromBase64(options.value));
            const priority = JSON.parse(index_1.LZString.decompressFromBase64(options.priority));
            onDisconnect.setWithPriority(value, priority).then(onSuccess).catch(onError);
        }
        catch (e) {
            onError(e);
        }
    }
    onDisconnect_update(onSuccess, onError, args) {
        onSuccess = onSuccess || STUB_SUCCESS;
        onError = onError || STUB_ERROR;
        try {
            const options = args[0];
            const onDisconnect = this._get(options.targetId);
            const value = JSON.parse(index_1.LZString.decompressFromBase64(options.value));
            onDisconnect.update(value).then(onSuccess).catch(onError);
        }
        catch (e) {
            onError(e);
        }
    }
    reference_child(onSuccess, onError, args) {
        onSuccess = onSuccess || STUB_SUCCESS;
        onError = onError || STUB_ERROR;
        try {
            const options = args[0];
            const ref = this._get(options.targetId);
            const childRef = ref.child(options.path);
            this._set(options.childId, childRef);
            onSuccess({
                key: childRef.key,
                url: childRef.toString(),
            });
        }
        catch (e) {
            onError(e);
        }
    }
    reference_onDisconnect(onSuccess, onError, args) {
        onSuccess = onSuccess || STUB_SUCCESS;
        onError = onError || STUB_ERROR;
        try {
            const options = args[0];
            const ref = this._get(options.targetId);
            const onDisconnect = ref.onDisconnect();
            this._set(options.onDisconnectId, onDisconnect);
            onSuccess();
        }
        catch (e) {
            onError(e);
        }
    }
    reference_push(onSuccess, onError, args) {
        onSuccess = onSuccess || STUB_SUCCESS;
        onError = onError || STUB_ERROR;
        try {
            const options = args[0];
            const ref = this._get(options.targetId);
            const thenableRef = (options.value) ?
                ref.push(JSON.parse(index_1.LZString.decompressFromBase64(options.value))) : ref.push();
            this._set(options.newId, thenableRef);
            thenableRef.then(() => {
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
    }
    reference_remove(onSuccess, onError, args) {
        onSuccess = onSuccess || STUB_SUCCESS;
        onError = onError || STUB_ERROR;
        try {
            const options = args[0];
            const ref = this._get(options.targetId);
            ref.remove().then(() => {
                this._delete(options.targetId);
                onSuccess();
            }).catch(onError);
        }
        catch (e) {
            onError(e);
        }
    }
    reference_set(onSuccess, onError, args) {
        onSuccess = onSuccess || STUB_SUCCESS;
        onError = onError || STUB_ERROR;
        try {
            const options = args[0];
            const ref = this._get(options.targetId);
            ref.set(JSON.parse(index_1.LZString.decompressFromBase64(options.data)))
                .then(onSuccess).catch(onError);
        }
        catch (e) {
            onError(e);
        }
    }
    reference_setPriority(onSuccess, onError, args) {
        onSuccess = onSuccess || STUB_SUCCESS;
        onError = onError || STUB_ERROR;
        try {
            const options = args[0];
            const ref = this._get(options.targetId);
            ref.setPriority(JSON.parse(index_1.LZString.decompressFromBase64(options.priority)))
                .then(onSuccess).catch(onError);
        }
        catch (e) {
            onError(e);
        }
    }
    reference_setWithPriority(onSuccess, onError, args) {
        onSuccess = onSuccess || STUB_SUCCESS;
        onError = onError || STUB_ERROR;
        try {
            const options = args[0];
            const ref = this._get(options.targetId);
            const data = JSON.parse(index_1.LZString.decompressFromBase64(options.data));
            const priority = JSON.parse(index_1.LZString.decompressFromBase64(options.priority));
            ref.setWithPriority(data, priority)
                .then(onSuccess).catch(onError);
        }
        catch (e) {
            onError(e);
        }
    }
    reference_update(onSuccess, onError, args) {
        onSuccess = onSuccess || STUB_SUCCESS;
        onError = onError || STUB_ERROR;
        try {
            const options = args[0];
            const ref = this._get(options.targetId);
            ref.update(JSON.parse(index_1.LZString.decompressFromBase64(options.data)))
                .then(onSuccess).catch(onError);
        }
        catch (e) {
            onError(e);
        }
    }
    query_endAt(onSuccess, onError, args) {
        onSuccess = onSuccess || STUB_SUCCESS;
        onError = onError || STUB_ERROR;
        try {
            const options = args[0];
            const ref = this._get(options.targetId);
            const value = JSON.parse(index_1.LZString.decompressFromBase64(options.value));
            const query = ref.endAt(value, options.key);
            this._set(options.queryId, query);
            onSuccess();
        }
        catch (e) {
            onError(e);
        }
    }
    query_equalTo(onSuccess, onError, args) {
        onSuccess = onSuccess || STUB_SUCCESS;
        onError = onError || STUB_ERROR;
        try {
            const options = args[0];
            const ref = this._get(options.targetId);
            const value = JSON.parse(index_1.LZString.decompressFromBase64(options.value));
            const query = ref.equalTo(value, options.key);
            this._set(options.queryId, query);
            onSuccess();
        }
        catch (e) {
            onError(e);
        }
    }
    query_limitToFirst(onSuccess, onError, args) {
        onSuccess = onSuccess || STUB_SUCCESS;
        onError = onError || STUB_ERROR;
        try {
            const options = args[0];
            const ref = this._get(options.targetId);
            const query = ref.limitToFirst(options.limit);
            this._set(options.queryId, query);
            onSuccess();
        }
        catch (e) {
            onError(e);
        }
    }
    query_limitToLast(onSuccess, onError, args) {
        onSuccess = onSuccess || STUB_SUCCESS;
        onError = onError || STUB_ERROR;
        try {
            const options = args[0];
            const ref = this._get(options.targetId);
            const query = ref.limitToLast(options.limit);
            this._set(options.queryId, query);
            onSuccess();
        }
        catch (e) {
            onError(e);
        }
    }
    query_off(onSuccess, onError, args) {
        onSuccess = onSuccess || STUB_SUCCESS;
        onError = onError || STUB_ERROR;
        try {
            const options = args[0];
            const refOrQuery = this._get(options.targetId);
            options.listenerIdSet.forEach((listenerId) => {
                refOrQuery.off(options.eventType, this._get(listenerId));
                this._delete(listenerId);
            });
            onSuccess();
        }
        catch (e) {
            onError(e);
        }
    }
    query_on(onSuccess, onError, args) {
        onSuccess = onSuccess || STUB_SUCCESS;
        onError = onError || STUB_ERROR;
        try {
            const options = args[0];
            const refOrQuery = this._get(options.targetId);
            const listener = refOrQuery.on(options.eventType, (snapshot, prevChildKey) => {
                const snapshotValues = {
                    exists: snapshot.exists(),
                    exportVal: index_1.LZString.compressToBase64(JSON.stringify(snapshot.exportVal())),
                    getPriority: index_1.LZString.compressToBase64(JSON.stringify(snapshot.getPriority())),
                    key: snapshot.key,
                    numChildren: snapshot.numChildren(),
                    val: index_1.LZString.compressToBase64(JSON.stringify(snapshot.val())),
                };
                const snapshotStr = index_1.LZString.compressToBase64(JSON.stringify(snapshotValues));
                const args2 = [snapshotStr];
                if (prevChildKey) {
                    args2.push(prevChildKey);
                }
                window.plugin.firebase.database._nativeCallback(this.id, options.listenerId, options.eventType, args2);
            });
            this._set(options.listenerId, listener);
            onSuccess();
        }
        catch (e) {
            onError(e);
        }
    }
    query_orderByChild(onSuccess, onError, args) {
        onSuccess = onSuccess || STUB_SUCCESS;
        onError = onError || STUB_ERROR;
        try {
            const options = args[0];
            const refOrQuery = this._get(options.targetId);
            const query = refOrQuery.orderByChild(options.path);
            this._set(options.queryId, query);
            onSuccess();
        }
        catch (e) {
            onError(e);
        }
    }
    query_orderByKey(onSuccess, onError, args) {
        onSuccess = onSuccess || STUB_SUCCESS;
        onError = onError || STUB_ERROR;
        try {
            const options = args[0];
            const refOrQuery = this._get(options.targetId);
            const query = refOrQuery.orderByKey();
            this._set(options.queryId, query);
            onSuccess();
        }
        catch (e) {
            onError(e);
        }
    }
    query_orderByPriority(onSuccess, onError, args) {
        onSuccess = onSuccess || STUB_SUCCESS;
        onError = onError || STUB_ERROR;
        try {
            const options = args[0];
            const refOrQuery = this._get(options.targetId);
            const query = refOrQuery.orderByPriority();
            this._set(options.queryId, query);
            onSuccess();
        }
        catch (e) {
            onError(e);
        }
    }
    query_orderByValue(onSuccess, onError, args) {
        onSuccess = onSuccess || STUB_SUCCESS;
        onError = onError || STUB_ERROR;
        try {
            const options = args[0];
            const refOrQuery = this._get(options.targetId);
            const query = refOrQuery.orderByValue();
            this._set(options.queryId, query);
            onSuccess();
        }
        catch (e) {
            onError(e);
        }
    }
    query_startAt(onSuccess, onError, args) {
        onSuccess = onSuccess || STUB_SUCCESS;
        onError = onError || STUB_ERROR;
        try {
            const options = args[0];
            const ref = this._get(options.targetId);
            const value = JSON.parse(index_1.LZString.decompressFromBase64(options.value));
            const query = ref.startAt(value, options.key);
            this._set(options.queryId, query);
            onSuccess();
        }
        catch (e) {
            onError(e);
        }
    }
}
exports.FirebaseDatabasePlugin = FirebaseDatabasePlugin;
