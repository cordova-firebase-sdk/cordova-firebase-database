import { App, IAppInitializeOptions, PluginBase } from "cordova-firebase-core/index";
export declare class Database extends PluginBase {
    private _app;
    constructor(app: App, options: IAppInitializeOptions);
    /**
     * The app associated with the Database service instance.
     *
     * @link https://firebase.google.com/docs/reference/js/firebase.database.Database#app
     */
    readonly app: App;
    hello(): string;
}
