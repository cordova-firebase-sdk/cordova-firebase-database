import { BaseClass } from "cordova-firebase-core/index";
export declare class FirebaseDatabasePlugin extends BaseClass {
    private _database;
    private _id;
    constructor(id: string, database: any);
    readonly id: string;
    readonly database: any;
    hello(onSuccess: any): void;
}
