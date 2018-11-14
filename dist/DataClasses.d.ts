import { PluginBase } from "cordova-firebase-core/index";
import { IExecCmdParams } from "./CommandQueue";
import { OnDisconnect } from "./OnDisconnect";
interface IQueryParams {
    key?: string;
    url: string;
    parent?: Reference;
    pluginName: string;
    ref?: Reference;
}
interface IReferenceParams {
    key?: string;
    url: string;
    parent?: Reference;
    pluginName: string;
}
interface InternalOpts {
    exec: (params: IExecCmdParams) => Promise<any>;
    noInit?: boolean;
    root?: Reference;
}
export declare type CANCEL_CALLBACK = (error: any) => void;
export declare type ON_CALLBACK = (snapshot: DataSnapshot, key: string) => void;
export declare class Query extends PluginBase {
    protected _ref: Reference;
    private _url;
    private _queue;
    private _listeners;
    private _pluginName;
    constructor(params: IQueryParams, _opts: InternalOpts);
    readonly pluginName: string;
    readonly ref: Reference;
    readonly url: string;
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
    limitToFirst(limit: number): Query;
    /**
     * Query.limitToLast
     */
    limitToLast(limit: number): Query;
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
    orderByKey(): Query;
    /**
     * Query.orderByPriority
     */
    orderByPriority(): Query;
    /**
     * Query.orderByValue
     */
    orderByValue(): Query;
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
}
export declare class Reference extends Query {
    private _key;
    private _parent;
    private _rootRef;
    constructor(params: IReferenceParams, _opts?: InternalOpts);
    readonly root: Reference;
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
    update(values: object, onComplete?: (error?: any) => void): Promise<void>;
}
export declare class ThenableReference extends Reference {
    resolve: any;
    reject: any;
    constructor(params: IQueryParams, _opts: InternalOpts);
    then(onResolve?: (value?: any) => any, onReject?: (error: any) => any): Promise<any>;
}
export declare class DataSnapshot {
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
