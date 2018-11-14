import { App, LZString } from "cordova-firebase-core/index";
import { Database } from "../Database";
import { DataSnapshot, Reference, ThenableReference } from "../DataClasses";
import { INativeEventParams } from "../INativeEventParams";
import { exec } from "../__mocks__/cordova";
import { execCmd } from "../__mocks__/CommandQueue";
const proxy = require("cordova/exec/proxy");

describe("[Reference]", () => {

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

  it("should create correct reference", () => {
    const ref: Reference = commonDb.ref("/vehicle/car");
    expect(ref.toString()).toBe("https://dummy.firebaseio.com/vehicle/car");
    expect(ref.parent.toString()).toBe("https://dummy.firebaseio.com/vehicle");
    expect(ref.parent.parent.toString()).toBe("https://dummy.firebaseio.com/");
  });
  it("should receive 'nativeEvent'", (done) => {

    const ref: Reference = commonDb.ref("/vehicle/car");
    ref._one("listenerId", (data: INativeEventParams): void => {
      expect(data).toEqual({
        args: ["0", "1"],
        eventType: "eventType",
        listenerId: "listenerId",
      });
      done();
    });
    ref.root._trigger("nativeEvent", {
      args: ["0", "1"],
      eventType: "eventType",
      listenerId: "listenerId",
    });
  });

  describe(".child()", () => {
    it("should create child reference", () => {

      const ref: Reference = commonDb.ref("parent");
      const child: Reference = ref.child("child");
      expect(child.toString()).toBe("https://dummy.firebaseio.com/parent/child");
    });
    it("should receive 'nativeEvent'", (done) => {

      const ref: Reference = commonDb.ref("parent");
      const child: Reference = ref.child("child");

      child._one("listenerId", (data: INativeEventParams): void => {
        expect(data).toEqual({
          args: ["0", "1"],
          eventType: "eventType",
          listenerId: "listenerId",
        });
        done();
      });
      ref.root._trigger("nativeEvent", {
        args: ["0", "1"],
        eventType: "eventType",
        listenerId: "listenerId",
      });
    });

    it("should reject empty string", () => {
      expect(() => {
        const ref: Reference = commonDb.ref("parent");
        ref.child("");
      }).toThrowErrorMatchingSnapshot();
    });

    it("should reject invalid path", () => {
      expect(() => {
        const ref: Reference = commonDb.ref("parent");
        ref.child("users/../test");
      }).toThrowErrorMatchingSnapshot();
    });
  });
  describe(".onDisconnect()", () => {
    it("should create collect onDisconnect", () => {
      const ref: Reference = commonDb.ref("");
      expect(ref.onDisconnect().id.split("_")[1]).toBe("OnDisconnect");
    });
  });
  describe(".push()", () => {
    it("should create ThenableReference", (done) => {
      const ref: Reference = commonDb.ref("");
      const thenableRef: ThenableReference = ref.push();
      thenableRef.then((result: any) => {
        expect(ref.id.split("_")[1]).toBe("queryOrReference");
        done();
      });
    });
    it("should involve native side with correct parameters", () => {
      const ref: Reference = commonDb.ref("");
      const thenableRef: ThenableReference = ref.push("value");
      expect(exec).toHaveBeenCalled();
      expect(exec.mock.calls[0][4][0].newId).toBe(thenableRef.id);
    });
  });
  describe(".remove()", () => {
    it("should involve native side with correct parameters", (done) => {
      const ref: Reference = commonDb.ref("");
      ref.remove().then(() => {
        expect(execCmd).toHaveBeenCalled();
        expect(execCmd.mock.calls[0][0].methodName).toBe("database_ref");
        expect(execCmd.mock.calls[1][0].methodName).toBe("reference_remove");
        expect(execCmd.mock.calls[1][0].args[0].targetId).toBe(ref.id);
        done();
      });
    });
  });
  describe(".set()", () => {
    it("should involve native side with correct parameters", (done) => {
      const ref: Reference = commonDb.ref("");
      ref.set("value").then(() => {
        expect(execCmd).toHaveBeenCalled();
        expect(execCmd.mock.calls[0][0].methodName).toBe("database_ref");
        expect(execCmd.mock.calls[1][0].methodName).toBe("reference_set");
        expect(execCmd.mock.calls[1][0].args[0].targetId).toBe(ref.id);
        expect(execCmd.mock.calls[1][0].args[0].data).toBe(LZString.compressToBase64(JSON.stringify("value")));
        done();
      });
    });
  });
  describe(".setPriority()", () => {
    it("should involve native side with correct parameters", (done) => {
      const ref: Reference = commonDb.ref("");
      ref.setPriority("high").then(() => {
        expect(execCmd).toHaveBeenCalled();
        expect(execCmd.mock.calls[0][0].methodName).toBe("database_ref");
        expect(execCmd.mock.calls[1][0].methodName).toBe("reference_setPriority");
        expect(execCmd.mock.calls[1][0].args[0].targetId).toBe(ref.id);
        expect(execCmd.mock.calls[1][0].args[0].priority).toBe("high");
        done();
      });
    });
  });
  describe(".setWithPriority()", () => {
    it("should involve native side with correct parameters", (done) => {
      const ref: Reference = commonDb.ref("");
      ref.setWithPriority("dummyValue", "high").then(() => {
        expect(execCmd).toHaveBeenCalled();
        expect(execCmd.mock.calls[0][0].methodName).toBe("database_ref");
        expect(execCmd.mock.calls[1][0].methodName).toBe("reference_setWithPriority");
        expect(execCmd.mock.calls[1][0].args[0].targetId).toBe(ref.id);
        expect(execCmd.mock.calls[1][0].args[0].priority).toBe("high");
        expect(execCmd.mock.calls[1][0].args[0].value).toBe(LZString.compressToBase64(JSON.stringify("dummyValue")));
        done();
      });
    });
  });
  describe(".transcation()", () => {
    it("should work correctly", (done) => {
      const ref: Reference = commonDb.ref("");
      execCmd.mockImplementation((params: any): Promise<any> => {
        if (params.methodName === "reference_transaction") {
          return (new Promise((resolve) => {
            const result: string = params.args[0].transactionUpdate("Hello");
            const snapshotStr: string = LZString.compressToBase64(JSON.stringify({
              exists: true,
              exportVal: LZString.compressToBase64(JSON.stringify(result)),
              getPriority: undefined,
              key: "",
              numChildren: 0,
              val: LZString.compressToBase64(JSON.stringify(result)),
            }));
            resolve({
              committed: true,
              snapshot: snapshotStr,
            });
          }));
        } else {
          return Promise.resolve(params);
        }
      });
      ref.transaction((currentValue: string): string => {
        return currentValue + " World!";
      }).then((results: any) => {
        expect(execCmd).toHaveBeenCalled();
        expect(execCmd.mock.calls[0][0].methodName).toBe("database_ref");
        expect(execCmd.mock.calls[1][0].methodName).toBe("reference_transaction");
        expect(execCmd.mock.calls[1][0].args[0].targetId).toBe(ref.id);
        expect(results.committed).toBe(true);
        expect(results.snapshot.val()).toBe("Hello World!");
        done();
      });
    });
  });

  describe(".update()", () => {
    it("should involve native side with correct parameters", (done) => {
      const ref: Reference = commonDb.ref("");
      const values: any = {
        hello: "world",
      };
      ref.update(values).then(() => {
        expect(execCmd).toHaveBeenCalled();
        expect(execCmd.mock.calls[0][0].methodName).toBe("database_ref");
        expect(execCmd.mock.calls[1][0].methodName).toBe("reference_update");
        expect(execCmd.mock.calls[1][0].args[0].targetId).toBe(ref.id);
        expect(execCmd.mock.calls[1][0].args[0].data).toBe(LZString.compressToBase64(JSON.stringify(values)));
        done();
      });
    });
  });
});
