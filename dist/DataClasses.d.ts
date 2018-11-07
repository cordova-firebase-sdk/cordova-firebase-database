import { PluginBase } from "cordova-firebase-core/index";
import { IExecCmdParams } from "./CommandQueue";
import { OnDisconnect } from "./OnDisconnect";
interface IQueryParams {
    key?: string;
    url: string;
    ref: Reference;
    parent?: Reference;
    pluginName: string;
}
export declare type CANCEL_CALLBACK = (error: any) => void;
export declare type ON_CALLBACK = (snapshot: DataSnapshot, key: string) => void;
export declare class Query extends PluginBase {
    private _url;
    private _queue;
    private _listeners;
    private _pluginName;
    private _ref;
    constructor(params: IQueryParams);
    readonly pluginName: string;
    readonly ref: Reference;
    readonly url: string;
    /**
     * @hidden
     * Internal methods. Don't use it from your code
     */
    _privateInit(): void;
    /**
     * Query.endAt
     */
    endAt(value: any, key?: string): Query;
    /**
     * Query.equalTo
     */
    equalTo(value: any, key: string): Query;
    /**
     * Query.isEqual
     */
    isEqual(other: Query): boolean;
    /**
     * Query.limitToFirst
     */
    limitToFirst(value: any, key: string): Query;
    /**
     * Query.limitToLast
     */
    limitToLast(value: any, key: string): Query;
    /**
     * Query.off
     */
    off(eventType?: string, callback?: (snapshot: DataSnapshot, key: string) => void, context?: any): void;
    /**
     * Query.on
     */
    on(eventType: string, callback: ON_CALLBACK, cancelCallbackOrContext?: object | CANCEL_CALLBACK, context?: any): ON_CALLBACK;
    /**
     * Query.once
     */
    once(eventType: string, callback: ON_CALLBACK, failureCallbackOrContext?: object | CANCEL_CALLBACK, context?: any): Promise<void>;
    /**
     * Query.orderByChild
     */
    orderByChild(path: string): Query;
    /**
     * Query.orderByKey
     */
    orderByKey(path: string): Query;
    /**
     * Query.orderByPriority
     */
    orderByPriority(path: string): Query;
    /**
     * Query.orderByValue
     */
    orderByValue(path: string): Query;
    /**
     * Query.startAt
     */
    startAt(value: any, key?: string): Query;
    /**
     * Query.toJSON
     */
    toJSON(): void;
    /**
     * Query.toString
     */
    toString(): string;
    protected exec(params: IExecCmdParams): Promise<any>;
    protected _forceRefUpdate(ref: Reference): void;
}
export declare class Reference extends Query {
    private _parent;
    private _key;
    constructor(params: IQueryParams);
    readonly parent: Reference;
    readonly key: string;
    /**
     * Reference.child
     */
    child(path: string): Reference;
    /**
     * Reference.onDisconnect
     */
    onDisconnect(): OnDisconnect;
    /**
     * Reference.push
     */
    push(value?: any, onComplete?: (error?: any) => void): ThenableReference;
    /**
     * Reference.remove
     */
    remove(onComplete?: (error?: any) => void): Promise<void>;
    /**
     * Reference.set
     */
    set(value: any, onComplete?: (error?: any) => void): Promise<void>;
    /**
     * Reference.setPriority
     */
    setPriority(priority: any, onComplete?: (error?: any) => void): Promise<void>;
    /**
     * Reference.setWithPriority
     */
    setWithPriority(newVal: any, newPriority: any, onComplete?: (error?: any) => void): Promise<void>;
    /**
     * Reference.transaction
     */
    transaction(transactionUpdate: (currentValue: any) => any, onComplete?: (error: any, committed: boolean, snapshot?: DataSnapshot) => void, applyLocally?: boolean): Promise<void>;
    /**
     * Reference.update
     */
    update(values: any, onComplete?: (error?: any) => void): Promise<void>;
}
export declare class ThenableReference extends Reference {
    resolve: any;
    reject: any;
    constructor(params: IQueryParams);
    then(onResolve?: (value?: any) => any, onReject?: (error: any) => any): Promise<any>;
}
declare class DataSnapshot {
    _nativeResults: any;
    private _ref;
    private _key;
    constructor(ref: Reference, nativeResults: any);
    readonly ref: Reference;
    readonly key: string;
    forEach(action: (snapshot: DataSnapshot) => void): void;
    getPriority(): string | number;
    hasChild(path: string): boolean;
    numChildren(): number;
    exportVal(): any;
    val(): any;
    toJSON(): any;
}
export {};
