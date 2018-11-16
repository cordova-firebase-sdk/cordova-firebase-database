import { BaseClass, LZString } from "cordova-firebase-core/index";

declare let window: any;

const STUB_SUCCESS = (...params: Array<any>): void => { return; };
const STUB_ERROR = (e: any): void => { console.error(e); };

/**
 * This is implementation of the code for browser native side.
 * Don't use this in user code.
 * @hidden
 */
export class FirebaseDatabasePlugin extends BaseClass {

  private _database: any;
  private _id: string;

  constructor(id: string, database: any) {
    super();
    this._id = id;
    this._database = database;
  }

  get id(): string {
    return this._id;
  }

  get database(): any {
    return this._database;
  }

  public database_goOffline(onSuccess: () => void, onError: (error: Error) => void): void {
    onSuccess = onSuccess || STUB_SUCCESS;
    onError = onError || STUB_ERROR;
    try {
      this.database.goOffline();
      onSuccess();
    } catch (e) {
      onError(e);
    }
  }

  public database_goOnline(onSuccess: () => void, onError: (error: Error) => void): void {
    onSuccess = onSuccess || STUB_SUCCESS;
    onError = onError || STUB_ERROR;
    try {
      this.database.goOnline();
      onSuccess();
    } catch (e) {
      onError(e);
    }
  }

  public database_ref(onSuccess: () => void, onError: (error: Error) => void, args: Array<any>): void {
    onSuccess = onSuccess || STUB_SUCCESS;
    onError = onError || STUB_ERROR;
    try {
      const options: any = args[0];
      const ref: any = this.database.ref(options.path);
      this._set(options.id, ref);
      onSuccess();
    } catch (e) {
      onError(e);
    }
  }

  public onDisconnect_cancel(onSuccess: () => void, onError: (error: Error) => void, args: Array<any>): void {
    onSuccess = onSuccess || STUB_SUCCESS;
    onError = onError || STUB_ERROR;
    try {
      const options: any = args[0];
      const onDisconnect: any = this._get(options.targetId);
      onDisconnect.cancel().then(onSuccess).catch(onError);
    } catch (e) {
      onError(e);
    }
  }

  public onDisconnect_remove(onSuccess: () => void, onError: (error: Error) => void, args: Array<any>): void {
    onSuccess = onSuccess || STUB_SUCCESS;
    onError = onError || STUB_ERROR;
    try {
      const options: any = args[0];
      const onDisconnect: any = this._get(options.targetId);
      onDisconnect.remove().then(onSuccess).catch(onError);
    } catch (e) {
      onError(e);
    }
  }

  public onDisconnect_set(onSuccess: () => void, onError: (error: Error) => void, args: Array<any>): void {
    onSuccess = onSuccess || STUB_SUCCESS;
    onError = onError || STUB_ERROR;
    try {
      const options: any = args[0];
      const onDisconnect: any = this._get(options.targetId);
      const value: any = JSON.parse(LZString.decompressFromBase64(options.value));
      onDisconnect.set(value).then(onSuccess).catch(onError);
    } catch (e) {
      onError(e);
    }
  }

  public onDisconnect_setWithPriority(onSuccess: () => void, onError: (error: Error) => void, args: Array<any>): void {
    onSuccess = onSuccess || STUB_SUCCESS;
    onError = onError || STUB_ERROR;
    try {
      const options: any = args[0];
      const onDisconnect: any = this._get(options.targetId);
      const value: any = JSON.parse(LZString.decompressFromBase64(options.value));
      const priority: any = options.priority;
      onDisconnect.setWithPriority(value, priority).then(onSuccess).catch(onError);
    } catch (e) {
      onError(e);
    }
  }

  public onDisconnect_update(onSuccess: () => void, onError: (error: Error) => void, args: Array<any>): void {
    onSuccess = onSuccess || STUB_SUCCESS;
    onError = onError || STUB_ERROR;
    try {
      const options: any = args[0];
      const onDisconnect: any = this._get(options.targetId);
      const value: any = JSON.parse(LZString.decompressFromBase64(options.value));
      onDisconnect.update(value).then(onSuccess).catch(onError);
    } catch (e) {
      onError(e);
    }
  }

  public reference_child(
      onSuccess: (results: {key: string, url: string}) => void,
      onError: (error: Error) => void,
      args: Array<any>): void {
    onSuccess = onSuccess || STUB_SUCCESS;
    onError = onError || STUB_ERROR;
    try {
      const options: any = args[0];
      const ref: any = this._get(options.targetId);
      const childRef: any = ref.child(options.path);
      this._set(options.childId, childRef);
      onSuccess({
        key: childRef.key,
        url: childRef.toString(),
      });
    } catch (e) {
      onError(e);
    }
  }

  public reference_onDisconnect(onSuccess: () => void, onError: (error: Error) => void, args: Array<any>): void {
    onSuccess = onSuccess || STUB_SUCCESS;
    onError = onError || STUB_ERROR;
    try {
      const options: any = args[0];
      const ref: any = this._get(options.targetId);
      const onDisconnect: any = ref.onDisconnect();
      this._set(options.onDisconnectId, onDisconnect);
      onSuccess();
    } catch (e) {
      onError(e);
    }
  }

  public reference_push(onSuccess: () => void, onError: (error: Error) => void, args: Array<any>): void {
    onSuccess = onSuccess || STUB_SUCCESS;
    onError = onError || STUB_ERROR;
    try {
      const options: any = args[0];
      const ref: any = this._get(options.targetId);
      const thenableRef = (options.value) ?
        ref.push(JSON.parse(LZString.decompressFromBase64(options.value))) : ref.push();

      this._set(options.newId, thenableRef);
      thenableRef.then((): void => {
        onSuccess();
        // onSuccess({
        //   key: thenableRef.key,
        //   url: thenableRef.toString(),
        // });
      }).catch(onError);
    } catch (e) {
      onError(e);
    }
  }

  public reference_remove(onSuccess: () => void, onError: (error: Error) => void, args: Array<any>): void {
    onSuccess = onSuccess || STUB_SUCCESS;
    onError = onError || STUB_ERROR;
    try {
      const options: any = args[0];
      const ref: any = this._get(options.targetId);
      ref.remove().then((): void => {
        this._delete(options.targetId);
        onSuccess();
      }).catch(onError);
    } catch (e) {
      onError(e);
    }
  }

  public reference_set(onSuccess: () => void, onError: (error: Error) => void, args: Array<any>): void {
    onSuccess = onSuccess || STUB_SUCCESS;
    onError = onError || STUB_ERROR;
    try {
      const options: any = args[0];
      const ref: any = this._get(options.targetId);
      ref.set(JSON.parse(LZString.decompressFromBase64(options.data)))
          .then(onSuccess).catch(onError);
    } catch (e) {
      onError(e);
    }
  }

  public reference_setPriority(onSuccess: () => void, onError: (error: Error) => void, args: Array<any>): void {
    onSuccess = onSuccess || STUB_SUCCESS;
    onError = onError || STUB_ERROR;
    try {
      const options: any = args[0];
      const ref: any = this._get(options.targetId);
      ref.setPriority(options.priority)
          .then(onSuccess).catch(onError);
    } catch (e) {
      onError(e);
    }
  }

  public reference_setWithPriority(onSuccess: () => void, onError: (error: Error) => void, args: Array<any>): void {
    onSuccess = onSuccess || STUB_SUCCESS;
    onError = onError || STUB_ERROR;
    try {
      const options: any = args[0];
      const ref: any = this._get(options.targetId);
      const data: any = JSON.parse(LZString.decompressFromBase64(options.data));
      const priority: any = options.priority;
      ref.setWithPriority(data, priority)
          .then(onSuccess).catch(onError);
    } catch (e) {
      onError(e);
    }
  }

  public reference_transaction(onSuccess: (result: any) => void, onError: (error: Error) => void, args: Array<any>): void {
    onSuccess = onSuccess || STUB_SUCCESS;
    onError = onError || STUB_ERROR;
    try {
      const options: any = args[0];
      const ref: any = this._get(options.targetId);
      ref.transaction(options.transactionUpdate, (error: any, committed: boolean, snapshot: any): void => {
        if (error) {
          onError(error);
        } else {
          let snapshotStr: string = null;
          if (snapshot) {
            snapshotStr = LZString.compressToBase64(JSON.stringify({
              exists: snapshot.exists(),
              exportVal: LZString.compressToBase64(JSON.stringify(snapshot.exportVal())),
              getPriority: snapshot.getPriority(),
              key: snapshot.key,
              numChildren: snapshot.numChildren(),
              val: LZString.compressToBase64(JSON.stringify(snapshot.val())),
            }));
          }
          onSuccess({
            committed,
            snapshot: snapshotStr,
          });
        }
      }, options.applyLocally);

    } catch (e) {
      onError(e);
    }
  }

  public reference_update(onSuccess: () => void, onError: (error: Error) => void, args: Array<any>): void {
    onSuccess = onSuccess || STUB_SUCCESS;
    onError = onError || STUB_ERROR;
    try {
      const options: any = args[0];
      const ref: any = this._get(options.targetId);
      ref.update(JSON.parse(LZString.decompressFromBase64(options.data)))
          .then(onSuccess).catch(onError);
    } catch (e) {
      onError(e);
    }
  }



  public query_endAt(onSuccess: () => void, onError: (error: Error) => void, args: Array<any>): void {
    onSuccess = onSuccess || STUB_SUCCESS;
    onError = onError || STUB_ERROR;
    try {
      const options: any = args[0];
      const ref: any = this._get(options.targetId);
      const value: any = JSON.parse(LZString.decompressFromBase64(options.value));
      const query: any = ref.endAt(value, options.key);
      this._set(options.queryId, query);
      onSuccess();
    } catch (e) {
      onError(e);
    }
  }



  public query_equalTo(onSuccess: () => void, onError: (error: Error) => void, args: Array<any>): void {
    onSuccess = onSuccess || STUB_SUCCESS;
    onError = onError || STUB_ERROR;
    try {
      const options: any = args[0];
      const ref: any = this._get(options.targetId);
      const value: any = JSON.parse(LZString.decompressFromBase64(options.value));
      const query: any = ref.equalTo(value, options.key);
      this._set(options.queryId, query);
      onSuccess();
    } catch (e) {
      onError(e);
    }
  }


  public query_limitToFirst(onSuccess: () => void, onError: (error: Error) => void, args: Array<any>): void {
    onSuccess = onSuccess || STUB_SUCCESS;
    onError = onError || STUB_ERROR;
    try {
      const options: any = args[0];
      const ref: any = this._get(options.targetId);
      const query: any = ref.limitToFirst(options.limit);
      this._set(options.queryId, query);
      onSuccess();
    } catch (e) {
      onError(e);
    }
  }



  public query_limitToLast(onSuccess: () => void, onError: (error: Error) => void, args: Array<any>): void {
    onSuccess = onSuccess || STUB_SUCCESS;
    onError = onError || STUB_ERROR;
    try {
      const options: any = args[0];
      const ref: any = this._get(options.targetId);
      const query: any = ref.limitToLast(options.limit);
      this._set(options.queryId, query);
      onSuccess();
    } catch (e) {
      onError(e);
    }
  }

  public query_off(onSuccess: () => void, onError: (error: Error) => void, args: Array<any>): void {
    onSuccess = onSuccess || STUB_SUCCESS;
    onError = onError || STUB_ERROR;
    try {
      const options: any = args[0];
      const refOrQuery: any = this._get(options.targetId);
      options.listenerIdSet.forEach((listenerId: string) => {
        refOrQuery.off(options.eventType, this._get(listenerId));
        this._delete(listenerId);
      });
      onSuccess();
    } catch (e) {
      onError(e);
    }
  }

  public query_on(onSuccess: () => void, onError: (error: Error) => void, args: Array<any>): void {
    onSuccess = onSuccess || STUB_SUCCESS;
    onError = onError || STUB_ERROR;
    try {
      const options: any = args[0];
      const refOrQuery: any = this._get(options.targetId);
      const callback = (snapshot: any, prevChildKey?: string): void => {
        const snapshotValues: any = {
          exists: snapshot.exists(),
          exportVal: LZString.compressToBase64(JSON.stringify(snapshot.exportVal())),
          getPriority: snapshot.getPriority(),
          key: snapshot.key,
          numChildren: snapshot.numChildren(),
          val: LZString.compressToBase64(JSON.stringify(snapshot.val())),
        };

        const snapshotStr = LZString.compressToBase64(JSON.stringify(snapshotValues));

        const args2 = [snapshotStr];
        if (prevChildKey) {
          args2.push(prevChildKey);
        }

        window.plugin.firebase.database._nativeCallback(this.id, options.listenerId, options.eventType, args2);
      };

      const cancelCallback = (error: Error): void => {

        const args2 = [
          LZString.compressToBase64(JSON.stringify(error.getMessage()))
        ];
        window.plugin.firebase.database._nativeCallback(this.id, options.listenerId, "cancelled", args2);
      };

      const listener: any = refOrQuery.on(options.eventType, callback, cancelCallback);

      this._set(options.listenerId, listener);

      onSuccess();
    } catch (e) {
      onError(e);
    }
  }

  public query_once(onSuccess: () => void, onError: (error: Error) => void, args: Array<any>): void {
    onSuccess = onSuccess || STUB_SUCCESS;
    onError = onError || STUB_ERROR;
    try {
      const options: any = args[0];
      const refOrQuery: any = this._get(options.targetId);
      const listener: any = refOrQuery.once(options.eventType, (snapshot: any, prevChildKey?: string): void => {
        const snapshotValues: any = {
          exists: snapshot.exists(),
          exportVal: LZString.compressToBase64(JSON.stringify(snapshot.exportVal())),
          getPriority: snapshot.getPriority(),
          key: snapshot.key,
          numChildren: snapshot.numChildren(),
          val: LZString.compressToBase64(JSON.stringify(snapshot.val())),
        };

        const snapshotStr = LZString.compressToBase64(JSON.stringify(snapshotValues));

        const args2 = [snapshotStr];
        if (prevChildKey) {
          args2.push(prevChildKey);
        }

        window.plugin.firebase.database._nativeCallback(this.id, options.listenerId, options.eventType, args2);
      }, onError);

      this._set(options.listenerId, listener);

      onSuccess();
    } catch (e) {
      onError(e);
    }
  }


  public query_orderByChild(onSuccess: () => void, onError: (error: Error) => void, args: Array<any>): void {
    onSuccess = onSuccess || STUB_SUCCESS;
    onError = onError || STUB_ERROR;
    try {
      const options: any = args[0];
      const refOrQuery: any = this._get(options.targetId);
      const query: any = refOrQuery.orderByChild(options.path);
      this._set(options.queryId, query);

      onSuccess();
    } catch (e) {
      onError(e);
    }
  }

  public query_orderByKey(onSuccess: () => void, onError: (error: Error) => void, args: Array<any>): void {
    onSuccess = onSuccess || STUB_SUCCESS;
    onError = onError || STUB_ERROR;
    try {
      const options: any = args[0];
      const refOrQuery: any = this._get(options.targetId);
      const query: any = refOrQuery.orderByKey();
      this._set(options.queryId, query);

      onSuccess();
    } catch (e) {
      onError(e);
    }
  }

  public query_orderByPriority(onSuccess: () => void, onError: (error: Error) => void, args: Array<any>): void {
    onSuccess = onSuccess || STUB_SUCCESS;
    onError = onError || STUB_ERROR;
    try {
      const options: any = args[0];
      const refOrQuery: any = this._get(options.targetId);
      const query: any = refOrQuery.orderByPriority();
      this._set(options.queryId, query);

      onSuccess();
    } catch (e) {
      onError(e);
    }
  }

  public query_orderByValue(onSuccess: () => void, onError: (error: Error) => void, args: Array<any>): void {
    onSuccess = onSuccess || STUB_SUCCESS;
    onError = onError || STUB_ERROR;
    try {
      const options: any = args[0];
      const refOrQuery: any = this._get(options.targetId);
      const query: any = refOrQuery.orderByValue();
      this._set(options.queryId, query);

      onSuccess();
    } catch (e) {
      onError(e);
    }
  }

  public query_startAt(onSuccess: () => void, onError: (error: Error) => void, args: Array<any>): void {
    onSuccess = onSuccess || STUB_SUCCESS;
    onError = onError || STUB_ERROR;
    try {
      const options: any = args[0];
      const ref: any = this._get(options.targetId);
      const value: any = JSON.parse(LZString.decompressFromBase64(options.value));

      const query: any = ref.startAt(value, options.key);
      this._set(options.queryId, query);

      onSuccess();
    } catch (e) {
      onError(e);
    }
  }
}
