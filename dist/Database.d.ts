import { App, BaseArrayClass, IAppInitializeOptions, PluginBase } from "cordova-firebase-core/index";
import { Reference } from "./DataClasses";
export declare class Database extends PluginBase {
    protected _queue: BaseArrayClass;
    private _app;
    private _options;
    private _url;
    private _rootRef;
    constructor(app: App, options: IAppInitializeOptions);
    readonly app: App;
    readonly url: string;
    /**
     * @hidden
     * This method is for `Reference.transcation` implementation
     */
    getSelf(): Database;
    /**
     * Database.goOffline
     */
    goOffline(): void;
    /**
     * Database.goOnline
     */
    goOnline(): void;
    /**
     * Database.ref
     * @param [path] - Optional path representing the location the returned Reference will point.
     * If not provided, the returned Reference will point to the root of the Database.
     * @returns Reference
     */
    ref(path?: string): Reference;
    /**
     * Database.refFromURL
     * https://firebase.google.com/docs/reference/js/firebase.database.Database#refFromURL
     */
    refFromURL(url: string): Reference;
    private exec;
}
