import { BaseClass } from "cordova-firebase-core/index";
/**
 * This is implementation of the code for browser native side.
 * Don't use this in user code.
 * @hidden
 */
export declare class FirebaseDatabasePlugin extends BaseClass {
    private _database;
    private _id;
    constructor(id: string, database: any);
    readonly id: string;
    readonly database: any;
    database_goOffline(onSuccess: () => void, onError: (error: Error) => void): void;
    database_goOnline(onSuccess: () => void, onError: (error: Error) => void): void;
    database_ref(onSuccess: () => void, onError: (error: Error) => void, args: Array<any>): void;
    onDisconnect_cancel(onSuccess: () => void, onError: (error: Error) => void, args: Array<any>): void;
    onDisconnect_remove(onSuccess: () => void, onError: (error: Error) => void, args: Array<any>): void;
    onDisconnect_set(onSuccess: () => void, onError: (error: Error) => void, args: Array<any>): void;
    onDisconnect_setWithPriority(onSuccess: () => void, onError: (error: Error) => void, args: Array<any>): void;
    onDisconnect_update(onSuccess: () => void, onError: (error: Error) => void, args: Array<any>): void;
    reference_child(onSuccess: (results: {
        key: string;
        url: string;
    }) => void, onError: (error: Error) => void, args: Array<any>): void;
    reference_onDisconnect(onSuccess: () => void, onError: (error: Error) => void, args: Array<any>): void;
    reference_push(onSuccess: () => void, onError: (error: Error) => void, args: Array<any>): void;
    reference_remove(onSuccess: () => void, onError: (error: Error) => void, args: Array<any>): void;
    reference_set(onSuccess: () => void, onError: (error: Error) => void, args: Array<any>): void;
    reference_setPriority(onSuccess: () => void, onError: (error: Error) => void, args: Array<any>): void;
    reference_setWithPriority(onSuccess: () => void, onError: (error: Error) => void, args: Array<any>): void;
    reference_transaction(onSuccess: (result: any) => void, onError: (error: Error) => void, args: Array<any>): void;
    reference_update(onSuccess: () => void, onError: (error: Error) => void, args: Array<any>): void;
    query_endAt(onSuccess: () => void, onError: (error: Error) => void, args: Array<any>): void;
    query_equalTo(onSuccess: () => void, onError: (error: Error) => void, args: Array<any>): void;
    query_limitToFirst(onSuccess: () => void, onError: (error: Error) => void, args: Array<any>): void;
    query_limitToLast(onSuccess: () => void, onError: (error: Error) => void, args: Array<any>): void;
    query_off(onSuccess: () => void, onError: (error: Error) => void, args: Array<any>): void;
    query_on(onSuccess: () => void, onError: (error: Error) => void, args: Array<any>): void;
    query_orderByChild(onSuccess: () => void, onError: (error: Error) => void, args: Array<any>): void;
    query_orderByKey(onSuccess: () => void, onError: (error: Error) => void, args: Array<any>): void;
    query_orderByPriority(onSuccess: () => void, onError: (error: Error) => void, args: Array<any>): void;
    query_orderByValue(onSuccess: () => void, onError: (error: Error) => void, args: Array<any>): void;
    query_startAt(onSuccess: () => void, onError: (error: Error) => void, args: Array<any>): void;
}
