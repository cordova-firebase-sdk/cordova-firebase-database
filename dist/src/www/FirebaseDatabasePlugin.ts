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

  public hello(onSuccess) {
    console.log("--->nativeSide: hello");
    onSuccess("world");
  }

}
