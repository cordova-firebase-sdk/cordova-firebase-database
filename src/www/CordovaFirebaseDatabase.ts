import { BaseClass, loadJsPromise } from "cordova-firebase-core/index";
import { FirebaseDatabasePlugin } from "./FirebaseDatabasePlugin";

declare let window: any;

export class CordovaFirebaseDatabase extends BaseClass {

  constructor() {
    super();
  }

  public newInstance(resolve, reject, args: Array<any>): void {
    loadJsPromise({
      package: "firebase.database",
      url: "https://www.gstatic.com/firebasejs/5.5.0/firebase-database.js",
    })
    .then(() => {
      // args[0]
      // {
      //   id: this.id,
      //   appName: app.name,
      //   options: options,
      // }
      const options: any = args[0] || {};
      console.log(options);

      // Get the application instance
      let apps: Array<any> = window.firebase.apps.slice(0);
      apps = apps.filter((app: any) => {
        return app.name === options.appName;
      });

      // Get the Database service for a specific app
      const database: any = window.firebase.database(apps[0]);
      // console.log("--->[browser] CordovaFirebaseDatabase.newInstance() : " + options.id);

      // Create Database plugin instance
      const instance: FirebaseDatabasePlugin = new FirebaseDatabasePlugin(options.id, database);
      const dummyObj: any = {};
      const keys: Array<string> = Object.getOwnPropertyNames(FirebaseDatabasePlugin.prototype).filter((p: string) => {
        return typeof FirebaseDatabasePlugin.prototype[p] === "function";
      });
      keys.forEach((key: string) => {
        dummyObj[key] = instance[key].bind(instance);
      });
      const proxy: any = require("cordova/exec/proxy");
      proxy.add(options.id, dummyObj);

      resolve();
    })
    .catch(reject);
  }
}


// Register this plugin
if ((window as any).cordova && (window as any).cordova.version) {
  (() => {
    const instance: any = new CordovaFirebaseDatabase();
    const dummyObj = {};
    const keys: Array<string> = Object.getOwnPropertyNames(CordovaFirebaseDatabase.prototype).filter((p: string) => {
      return typeof CordovaFirebaseDatabase.prototype[p] === "function";
    });
    keys.forEach((key: string) => {
      dummyObj[key] = instance[key].bind(instance);
    });

    const proxy: any = require("cordova/exec/proxy");
    proxy.add("CordovaFirebaseDatabase", dummyObj);
  })();
}
