import { BaseClass } from "cordova-firebase-core/index";

export class FirebaseDatabasePlugin extends BaseClass {

  private _database: any;
  private _id: string;

  constructor(id: string, database: any) {
    super();


  }

  get id(): string {
    return this._id;
  }

  get database(): any {
    return this._database;
  }

  public database_goOffline(onSuccess: () => void, onError: (error: Error) => void): void {
    try {
      thid.database.goOffline();
      onSuccess();
    } catch(e: Error) {
      onError(e);
    }
  }

  public database_goOnline(onSuccess: () => void, onError: (error: Error) => void): void {
    try {
      thid.database.goOnline();
      onSuccess();
    } catch(e: Error) {
      onError(e);
    }
  }

  public database_ref(onSuccess: () => void, onError: (error: Error) => void, args: Array<any>): void {
    try {
      const options: any = args[0];
      const ref: any = this.database.ref(options.path);
      this._set(options.id, ref);
      onSuccess();
    } catch(e: Error) {
      onError(e);
    }
  }

  public onDisconnect_cancel(onSuccess: () => void, onError: (error: Error) => void, args: Array<any>): void {
    try {
      const options: any = args[0];
      const onDisconnect: any = this._get(options.targetId);
      onDisconnect.cancel().then(onSuccess).catch(onError);
    } catch(e: Error) {
      onError(e);
    }
  }

  public onDisconnect_remove(onSuccess: () => void, onError: (error: Error) => void, args: Array<any>): void {
    try {
      const options: any = args[0];
      const onDisconnect: any = this._get(options.targetId);
      onDisconnect.remove().then(onSuccess).catch(onError);
    } catch(e: Error) {
      onError(e);
    }
  }

  public onDisconnect_set(onSuccess: () => void, onError: (error: Error) => void, args: Array<any>): void {
    try {
      const options: any = args[0];
      const onDisconnect: any = this._get(options.targetId);
      const value: any = JSON.parse(LZString.decompressFromBase64(options.value));
      onDisconnect.set(value).then(onSuccess).catch(onError);
    } catch(e: Error) {
      onError(e);
    }
  }

  public onDisconnect_setWithPriority(onSuccess: () => void, onError: (error: Error) => void, args: Array<any>): void {
    try {
      const options: any = args[0];
      const onDisconnect: any = this._get(options.targetId);
      const value: any = JSON.parse(LZString.decompressFromBase64(options.value));
      const priority: any = JSON.parse(LZString.decompressFromBase64(options.priority));
      onDisconnect.setWithPriority(value, priority).then(onSuccess).catch(onError);
    } catch(e: Error) {
      onError(e);
    }
  }

  public onDisconnect_update(onSuccess: () => void, onError: (error: Error) => void, args: Array<any>): void {
    try {
      const options: any = args[0];
      const onDisconnect: any = this._get(options.targetId);
      const value: any = JSON.parse(LZString.decompressFromBase64(options.value));
      onDisconnect.update(value).then(onSuccess).catch(onError);
    } catch(e: Error) {
      onError(e);
    }
  }

  public reference_child(onSuccess: () => void, onError: (error: Error) => void, args: Array<any>): void {
    try {
      const options: any = args[0];
      const ref: any = this._get(options.targetId);
      const childRef: any = ref.child(options.path);
      this._set(options.childId, childRef);
      onSuccess({
        key: childRef.key,
        url: childRef.toString(),
      });
    } catch(e: Error) {
      onError(e);
    }
  }

  public reference_onDisconnect(onSuccess: () => void, onError: (error: Error) => void, args: Array<any>): void {
    try {
      const options: any = args[0];
      const ref: any = this._get(options.targetId);
      const onDisconnect: any = ref.onDisconnect();
      this._set(options.onDisconnectId, onDisconnect);
      onSuccess();
    } catch(e: Error) {
      onError(e);
    }
  }
}
