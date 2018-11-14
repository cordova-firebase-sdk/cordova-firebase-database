import { loadJsPromise } from "cordova-firebase-core/index";
import { FirebaseDatabasePlugin } from "./FirebaseDatabasePlugin";

export class CordovaFirebaseDatabase {

  public newInstance(resolve: () => void, reject: (error: any) => void, args: Array<any>): void {
    loadJsPromise({
      package: "firebase.database",
      url: "https://www.gstatic.com/firebasejs/5.5.0/firebase-database.js",
    })
    .then((): void => {
      // args[0]
      // {
      //   id: this.id,
      //   appName: app.name,
      //   options: options,
      // }
      const options: any = args[0] || {};

      // Get the application instance
      let apps: Array<any> = (window as any).firebase.apps.slice(0);
      apps = apps.filter((app: any): boolean => {
        return app.name === options.appName;
      });

      // Get the Database service for a specific app
      const database: any = (window as any).firebase.database(apps[0]);
      // console.log("--->[browser] CordovaFirebaseDatabase.newInstance() : " + options.id);

      // Create Database plugin instance
      const instance: FirebaseDatabasePlugin = new FirebaseDatabasePlugin(options.id, database);

      // Register as browser plugin
      const dummyObj: any = {};
      const keys: Array<string> = Object.getOwnPropertyNames(FirebaseDatabasePlugin.prototype)
                                        .filter((p: string): boolean => {
        return typeof FirebaseDatabasePlugin.prototype[p] === "function";
      });
      keys.forEach((key: string): void => {
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
    const keys: Array<string> = Object.getOwnPropertyNames(CordovaFirebaseDatabase.prototype)
                                      .filter((p: string): boolean => {
      return typeof CordovaFirebaseDatabase.prototype[p] === "function";
    });
    keys.forEach((key: string): void => {
      dummyObj[key] = instance[key].bind(instance);
    });

    const proxy: any = require("cordova/exec/proxy");
    proxy.add("CordovaFirebaseDatabase", dummyObj);
  })();
}
