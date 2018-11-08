import { Database } from "../Database";
import { App } from "cordova-firebase-core/index";
import { exec } from "../__mocks__/cordova";
import { execCmd } from "../__mocks__/CommandQueue";


describe("[Database]", () => {


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
  });

  describe("constructor", () => {
    it ("should create a new instance in native side", (done) => {

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
  });

  describe(".goOffline", () => {
    it ("should involve native code with correct parameters.", (done) => {

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
    it ("should involve native code with correct parameters.", (done) => {

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
    it ("should involve native code with correct parameters.", (done) => {

      const ref = commonDb.ref("users");
      setTimeout(() => {
        expect(execCmd).toHaveBeenCalledTimes(1);
        const params: any = execCmd.mock.calls[0][0];
        expect(params.methodName).toEqual("database_ref");
        expect(params.args[0].path).toEqual("users");
        expect(ref.toString()).toEqual("https://dummy.firebaseio.com/users");
        done();
      }, 5);
    });
  });
});
