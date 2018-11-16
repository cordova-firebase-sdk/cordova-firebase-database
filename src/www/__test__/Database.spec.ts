import { Database } from "../Database";
import { App } from "cordova-firebase-core/index";
import { exec } from "../__mocks__/cordova";
import { execCmd } from "../__mocks__/CommandQueue";
import { INativeEventParams } from "../INativeEventParams";

declare let cordova: any;

describe("[Database]", () => {

  cordova.require = jest.fn();
  cordova.define.moduleMap["cordova-firebase-database.Database"] = 1;

  const commonApp: App = new App("dummyApp", {
    hello: "world",
    databaseURL: "https://dummy.firebaseio.com/"
  });

  const commonDb: Database = new Database(commonApp, commonApp.options);
  commonDb._trigger("fireAppReady");

  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods:
    exec.mockClear();
    execCmd.mockClear();
    cordova.require.mockClear();
  });

  describe("constructor", () => {
    it("should create a new instance in native side", (done) => {

      const app: App = new App("hello", {
        hello: "world",
        databaseURL: "https://dummy.firebaseio.com/"
      });
      app._one("ready", () => {
        const db: Database = new Database(app, app.options);
        db._trigger("fireAppReady");

        db._one("ready", () => {
          expect(db.app).toBe(app);
          expect(exec).toHaveBeenCalledTimes(2);
          expect(exec.mock.calls[0][2]).toBe("CordovaFirebaseCore");
          expect(exec.mock.calls[0][3]).toBe("newInstance");
          expect(exec.mock.calls[0][4][0].name).toBe("hello");
          expect(exec.mock.calls[0][4][0].options.databaseURL).toEqual("https://dummy.firebaseio.com/");

          expect(exec.mock.calls[1][2]).toBe("CordovaFirebaseDatabase");
          expect(exec.mock.calls[1][3]).toBe("newInstance");
          expect(exec.mock.calls[1][4][0].appName).toBe("hello");
          expect(exec.mock.calls[1][4][0].id).toBe(db.id);
          expect(exec.mock.calls[1][4][0].options.databaseURL).toEqual("https://dummy.firebaseio.com/");

          done();
        });
      });
    });

    it("should catch Error if something happends in native side", () => {
      exec.mockImplementationOnce(() => {
        throw new Error("Something happends!");
      });
      expect(() => {
        const app: App = new App("hello", {
          hello: "world",
          databaseURL: "https://dummy.firebaseio.com/"
        });
        const database: Database = app.database();
      }).toThrowErrorMatchingSnapshot();
    });


    it("should throw Error if app is null", () => {
      expect(() => {
        new Database(null, null);
      }).toThrowErrorMatchingSnapshot();
    });

    it("should throw Error if option is null", () => {
      expect(() => {
        const app: App = new App("hello", {
          hello: "world",
          databaseURL: "https://dummy.firebaseio.com/"
        });
        new Database(app, null);
      }).toThrowErrorMatchingSnapshot();
    });

    it("should throw Error if option does not contain 'databaseURL'", () => {
      expect(() => {
        const app: App = new App("hello", {
          hello: "world",
          databaseURL: "https://dummy.firebaseio.com/"
        });
        new Database(app, {});
      }).toThrowErrorMatchingSnapshot();
    });

    it("should 'nativeEvent' on rootRef if database receives 'nativeEvent'", (done) => {
      const app: App = new App("hello", {
        hello: "world",
        databaseURL: "https://dummy.firebaseio.com/"
      });
      const database: Database = app.database();
      database.ref().root._one("nativeEvent", (params: INativeEventParams) => {
        expect(params.args[0]).toBe("Hello");
        expect(params.eventType).toBe("test");
        expect(params.listenerId).toBe("listenerId");
        done();
      });
      database._trigger("nativeEvent", {
        args: ["Hello"],
        eventType: "test",
        listenerId: "listenerId",
      });
    });
    //
    it("methods should work even if native side is not ready.", (done) => {

      const app: App = new App("hello", {
        hello: "world",
        databaseURL: "https://dummy.firebaseio.com/"
      });
      const database: Database = app.database();

      database.ref("users").set("myName").then(() => {
        expect(execCmd).toHaveBeenCalledTimes(2);
        expect(execCmd.mock.calls[0][0].methodName).toBe("database_ref");
        expect(execCmd.mock.calls[1][0].methodName).toBe("reference_set");
        done();
      });
      setTimeout(() => {
        app._trigger("ready");
      }, 10);
    });
    it("methods should work even if native side is not ready.", (done) => {

      const app: App = new App("hello", {
        hello: "world",
        databaseURL: "https://dummy.firebaseio.com/"
      });
      const database: Database = app.database();
      const ref1 = database.ref("users1");
      const ref2 = database.refFromURL("https://dummy.firebaseio.com/users2");

      ref1.set("value1");
      ref2.set("value2");

      app._trigger("ready");
      setTimeout(() => {
        expect(execCmd).toHaveBeenCalledTimes(4);
        expect(execCmd.mock.calls[0][0].methodName).toBe("database_ref");
        expect(execCmd.mock.calls[1][0].methodName).toBe("database_ref");
        expect(execCmd.mock.calls[2][0].methodName).toBe("reference_set");
        expect(execCmd.mock.calls[3][0].methodName).toBe("reference_set");
        expect(ref1.toString()).toBe("https://dummy.firebaseio.com/users1");
        expect(ref2.toString()).toBe("https://dummy.firebaseio.com/users2");
        done();
      }, 30);
    });

    it("window.plugin.firebase.database() should return the default database.", () => {
      const app: App = (window as any).plugin.firebase.initializeApp({
        databaseURL: "https://dummy.firebaseio.com/",
      });
      app._trigger("ready");

      const database: Database = (window as any).plugin.firebase.database();
      expect(database.app.name).toBe("[DEFAULT]");
    });
    it("should receive nativeEvent through _nativeCallback.", (done) => {

      const database: Database = (window as any).plugin.firebase.database();
      expect(database.app.name).toBe("[DEFAULT]");

      database.ref()._one("listenerId", (params: INativeEventParams) => {
        expect(params.eventType).toBe("testEvent");
        expect(params.args[0]).toBe("HELLO WORLD");
        done();
      });
      (window as any).plugin.firebase.database._nativeCallback(database.id, "listenerId", "testEvent", ["HELLO WORLD"]);
    });
    it("getSelf() should return the database itself", () => {
      const database: Database = (window as any).plugin.firebase.database();
      expect(database.getSelf()).toBe(database);
    });
  });

  describe(".goOffline", () => {
    it("should involve native code with correct parameters.", (done) => {

      commonDb.goOffline();
      setTimeout(() => {
        expect(execCmd).toHaveBeenCalledTimes(1);
        const params: any = execCmd.mock.calls[0][0];
        expect(params.methodName).toEqual("goOffline");
        done();
      }, 5);
    });
  });
  describe(".goOnline", () => {
    it("should involve native code with correct parameters.", (done) => {

      commonDb.goOnline();
      setTimeout(() => {
        expect(execCmd).toHaveBeenCalledTimes(1);
        const params: any = execCmd.mock.calls[0][0];
        expect(params.methodName).toEqual("goOnline");
        done();
      }, 5);
    });
  });
  describe(".ref", () => {
    it("should create correct references.", (done) => {

      const ref = commonDb.ref("users/user01");
      expect(ref.toString()).toEqual("https://dummy.firebaseio.com/users/user01");
      expect(ref.parent.toString()).toEqual("https://dummy.firebaseio.com/users");
      expect(ref.parent.parent.toString()).toEqual("https://dummy.firebaseio.com/");
      done();
    });

    it(".root.toString() should be the same as the current database", () => {
      expect(commonDb.ref().toString()).toBe("https://dummy.firebaseio.com/");
      expect(commonDb.ref().root.toString()).toBe("https://dummy.firebaseio.com/");
    });

    it(".root.key should be null", () => {
      expect(commonDb.ref().root.key).toBe(null);
    });

    it(".root.parent should be null", () => {
      expect(commonDb.ref().root.parent).toBe(null);
    });

    it("should reject invalid path", () => {
      expect(() => {
        commonDb.ref("hello/../world/");
      }).toThrowErrorMatchingSnapshot();
    });
  });
  describe(".refFromURL", () => {

    it("should create correct references.", () => {

      const ref = commonDb.refFromURL("https://dummy.firebaseio.com/users/test?awrewqar=www");
      expect(ref.toString()).toEqual("https://dummy.firebaseio.com/users/test");
      expect(ref.key).toEqual("test");
      expect(ref.parent.key).toEqual("users");
      expect(ref.parent.toString()).toEqual("https://dummy.firebaseio.com/users");
      expect(ref.parent.parent.toString()).toEqual("https://dummy.firebaseio.com/");
    });

    it("should reject empty string", () => {
      expect(() => {
        commonDb.refFromURL("");
      }).toThrowErrorMatchingSnapshot();
    });

    it("should reject invalid url", () => {
      expect(() => {
        commonDb.refFromURL("http://hello.com/users/../world/");
      }).toThrowErrorMatchingSnapshot();
    });
    it("should reject invalid url", () => {
      expect(() => {
        commonDb.refFromURL("https://dummy.firebaseio.com/users/#/world/");
      }).toThrowErrorMatchingSnapshot();
    });
    it("should reject if hostname does not match with the currend database", () => {
      expect(() => {
        commonDb.refFromURL("http://hello.com/users/../world/");
      }).toThrowErrorMatchingSnapshot();
    });
    it("should reject if url is null", () => {
      expect(() => {
        commonDb.refFromURL(null);
      }).toThrowErrorMatchingSnapshot();
    });
  });
});
