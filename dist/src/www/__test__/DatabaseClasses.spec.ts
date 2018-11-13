import { App, LZString } from "cordova-firebase-core/index";
import { Database } from "../Database";
import { DataSnapshot, Query, Reference, ThenableReference } from "../DataClasses";
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
    it ("should create child reference", () => {

      const ref: Reference = commonDb.ref("parent");
      const child: Reference = ref.child("child");
      expect(child.toString()).toBe("https://dummy.firebaseio.com/parent/child");
    });
    it ("should receive 'nativeEvent'", (done) => {

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
    it ("should create collect onDisconnect", () => {
      const ref: Reference = commonDb.ref("");
      expect(ref.onDisconnect().id.split("_")[1]).toBe("OnDisconnect");
    });
  });
  describe(".push()", () => {
    it ("should create ThenableReference", () => {
      const ref: Reference = commonDb.ref("");
      const thenableRef: ThenableReference = ref.push();
      thenableRef.then((result: any) => {
        expect(ref.id.split("_")[1]).toBe("Reference");
      });
    });
    it ("should involve native side with correct parameters", () => {
      const ref: Reference = commonDb.ref("");
      const thenableRef: ThenableReference = ref.push("value");
      expect(exec).toHaveBeenCalled();
      expect(exec.mock.calls[0][4][0].newId).toBe(thenableRef.id);
    });
  });
  describe(".remove()", () => {
    it ("should involve native side with correct parameters", (done) => {
      const ref: Reference = commonDb.ref("");
      ref.remove().then(() => {
        expect(execCmd).toHaveBeenCalled();
        expect(execCmd.mock.calls[0][0].args[0].targetId).toBe(ref.id);
        done();
      });
    });
  });
  describe(".set()", () => {
    it ("should involve native side with correct parameters", (done) => {
      const ref: Reference = commonDb.ref("");
      ref.set("value").then(() => {
        expect(execCmd).toHaveBeenCalled();
        expect(execCmd.mock.calls[0][0].args[0].targetId).toBe(ref.id);
        expect(execCmd.mock.calls[0][0].args[0].data).toBe(LZString.compressToBase64(JSON.stringify("value")));
        done();
      });
    });
  });
  describe(".setPriority()", () => {
    it ("should involve native side with correct parameters", (done) => {
      const ref: Reference = commonDb.ref("");
      ref.setPriority("high").then(() => {
        expect(execCmd).toHaveBeenCalled();
        expect(execCmd.mock.calls[0][0].args[0].targetId).toBe(ref.id);
        expect(execCmd.mock.calls[0][0].args[0].priority).toBe("high");
        done();
      });
    });
  });
  describe(".setWithPriority()", () => {
    it ("should involve native side with correct parameters", (done) => {
      const ref: Reference = commonDb.ref("");
      ref.setWithPriority("dummyValue", "high").then(() => {
        expect(execCmd).toHaveBeenCalled();
        expect(execCmd.mock.calls[0][0].args[0].targetId).toBe(ref.id);
        expect(execCmd.mock.calls[0][0].args[0].value).toBe(LZString.compressToBase64(JSON.stringify("dummyValue")));
        expect(execCmd.mock.calls[0][0].args[0].priority).toBe("high");
        done();
      });
    });
  });
  // describe(".transaction()", () => {
  //   it ("should involve `transactionUpdate` correctly", (done) => {
  //
  //     const ref: Reference = commonDb.ref("");
  //     console.log("dbId", commonDb.id);
  //     proxy.add(commonDb.id, commonDb);
  //     cordova.platformId = "browser";
  //     commonDb._set(ref.id, {
  //       transaction: jest.fn((jsTransactionUpdate: any): Promise<any> => {
  //         const result: any = jsTransactionUpdate({
  //           "hello": null,
  //         });
  //         return Promise.resolve({
  //           exists: () => { return true; },
  //           exportVal: () => { return result; },
  //           getPriority: () => { return "high"; },
  //           key: () => { return null; },
  //           numChildren: () => { return 0; },
  //           val: () => { return result; },
  //         });
  //       }),
  //     });
  //
  //     const transactionUpdate = jest.fn((currentValue: any): any => {
  //       currentValue.hello = "world";
  //       return currentValue;
  //     });
  //     ref.transaction(transactionUpdate).then((snapshot) => {
  //       expect(transactionUpdate).toHaveBeenCalled();
  //       done();
  //     });
  //   });
  // });
  describe(".update()", () => {
    it ("should involve native side with correct parameters", (done) => {
      const ref: Reference = commonDb.ref("");
      const values: any = {
        hello: "world",
      };
      ref.update(values).then(() => {
        expect(execCmd).toHaveBeenCalled();
        expect(execCmd.mock.calls[0][0].args[0].targetId).toBe(ref.id);
        expect(execCmd.mock.calls[0][0].args[0].data).toBe(LZString.compressToBase64(JSON.stringify(values)));
        done();
      });
    });
  });
});

describe("[Query]", () => {

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

  describe("endAt", () => {
    it("should involve native side with correct parameters", () => {
      const ref: Reference = commonDb.ref("");
      const value: any = {
        hello: "world",
      };
      const query: Query = ref.endAt(value, "key");
      expect(execCmd.mock.calls[0][0].args[0].key).toEqual("key");
      expect(execCmd.mock.calls[0][0].args[0].queryId).toBe(query.id);
      expect(execCmd.mock.calls[0][0].args[0].targetId).toBe(ref.id);
      expect(execCmd.mock.calls[0][0].args[0].value).toBe(LZString.compressToBase64(JSON.stringify(value)));
    });
    it("should fire `listenerId` event if query receive 'nativeEvent'", (done) => {
      const ref: Reference = commonDb.ref("");
      const value: any = {
        hello: "world",
      };
      const query: Query = ref.endAt(value, "key");

      query._one("listenerId", (data: INativeEventParams): void => {
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
  });
  describe("equalTo", () => {
    it("should involve native side with correct parameters", () => {
      const ref: Reference = commonDb.ref("");
      const value: any = {
        hello: "world",
      };
      const query: Query = ref.equalTo(value, "key");
      expect(execCmd.mock.calls[0][0].args[0].key).toEqual("key");
      expect(execCmd.mock.calls[0][0].args[0].queryId).toBe(query.id);
      expect(execCmd.mock.calls[0][0].args[0].targetId).toBe(ref.id);
      expect(execCmd.mock.calls[0][0].args[0].value).toBe(LZString.compressToBase64(JSON.stringify(value)));
    });
  });
  describe("limitToFirst", () => {
    it("should involve native side with correct parameters", () => {
      const ref: Reference = commonDb.ref("");
      const value: any = {
        hello: "world",
      };
      const query: Query = ref.limitToFirst(value, "key");
      expect(execCmd.mock.calls[0][0].args[0].key).toEqual("key");
      expect(execCmd.mock.calls[0][0].args[0].queryId).toBe(query.id);
      expect(execCmd.mock.calls[0][0].args[0].targetId).toBe(ref.id);
      expect(execCmd.mock.calls[0][0].args[0].value).toBe(LZString.compressToBase64(JSON.stringify(value)));
    });
  });
  describe("limitToLast", () => {
    it("should involve native side with correct parameters", () => {
      const ref: Reference = commonDb.ref("");
      const value: any = {
        hello: "world",
      };
      const query: Query = ref.limitToLast(value, "key");
      expect(execCmd.mock.calls[0][0].args[0].key).toEqual("key");
      expect(execCmd.mock.calls[0][0].args[0].queryId).toBe(query.id);
      expect(execCmd.mock.calls[0][0].args[0].targetId).toBe(ref.id);
      expect(execCmd.mock.calls[0][0].args[0].value).toBe(LZString.compressToBase64(JSON.stringify(value)));
    });
  });
  describe("on()", () => {
    it("should work correctly", (done) => {
      const ref: Reference = commonDb.ref("");
      const value: any = { hello: "world" };
      const query: Query = ref.limitToLast(value, "key");
      const _onSpy = jest.spyOn(query, "_on");

      query.on("value", (snapshot: DataSnapshot): void => {
        expect(snapshot.key).toEqual("key");
        expect(snapshot.getPriority()).toEqual("high");
        done();
      });

      const dummySnapshot: string = JSON.stringify({
        exists: true,
        exportVal: LZString.compressToBase64(JSON.stringify({ hello: "world" })),
        getPriority: "high",
        key: "key",
        numChildren: 0,
        val: LZString.compressToBase64(JSON.stringify({ hello: "world" })),
      });

      ref.root._trigger("nativeEvent", {
        args: [LZString.compressToBase64(dummySnapshot)],
        eventType: "values",
        listenerId: _onSpy.mock.calls[0][0],
      });
    });
  });
  describe("once()", () => {
    it("should work correctly", (done) => {
      //----------------------------------------------
      // Since once() uses on() and off() internally,
      // skip the test for off() method.
      //----------------------------------------------

      const ref: Reference = commonDb.ref("");
      const value: any = { hello: "world" };
      const query: Query = ref.limitToLast(value, "key");
      const _onSpy = jest.spyOn(query, "_on");

      query.once("value", (snapshot: DataSnapshot): void => {
        expect(snapshot.key).toEqual("key1");
        expect(snapshot.getPriority()).toEqual("high");
        done();
      });

      const dummySnapshot1: string = JSON.stringify({
        exists: true,
        exportVal: LZString.compressToBase64(JSON.stringify({ hello: "world" })),
        getPriority: "high",
        key: "key1",
        numChildren: 0,
        val: LZString.compressToBase64(JSON.stringify({ hello: "world" })),
      });

      const dummySnapshot2: string = JSON.stringify({
        exists: true,
        exportVal: LZString.compressToBase64(JSON.stringify({ hello: "world" })),
        getPriority: "normal",
        key: "key2",
        numChildren: 0,
        val: LZString.compressToBase64(JSON.stringify({ hello: "world" })),
      });

      ref.root._trigger("nativeEvent", {
        args: [LZString.compressToBase64(dummySnapshot1)],
        eventType: "values",
        listenerId: _onSpy.mock.calls[0][0],
      });
      ref.root._trigger("nativeEvent", {
        args: [LZString.compressToBase64(dummySnapshot2)],
        eventType: "values",
        listenerId: _onSpy.mock.calls[0][0],
      });
    });
  });
  describe("orderByChild()", () => {
    it("should involve native side with correct parameters", () => {
      const ref: Reference = commonDb.ref("");
      const query: Query = ref.orderByChild("children");
      expect(execCmd.mock.calls[0][0].args[0].path).toEqual("children");
      expect(execCmd.mock.calls[0][0].args[0].queryId).toBe(query.id);
      expect(execCmd.mock.calls[0][0].args[0].targetId).toBe(ref.id);
    });
  });
  describe("orderByKey()", () => {
    it("should involve native side with correct parameters", () => {
      const ref: Reference = commonDb.ref("");
      const query: Query = ref.orderByKey();
      expect(execCmd.mock.calls[0][0].args[0].queryId).toBe(query.id);
      expect(execCmd.mock.calls[0][0].args[0].targetId).toBe(ref.id);
    });
  });
  describe("orderByPriority()", () => {
    it("should involve native side with correct parameters", () => {
      const ref: Reference = commonDb.ref("");
      const query: Query = ref.orderByPriority();
      expect(execCmd.mock.calls[0][0].args[0].queryId).toBe(query.id);
      expect(execCmd.mock.calls[0][0].args[0].targetId).toBe(ref.id);
    });
  });
  describe("orderByValue()", () => {
    it("should involve native side with correct parameters", () => {
      const ref: Reference = commonDb.ref("");
      const query: Query = ref.orderByValue();
      expect(execCmd.mock.calls[0][0].args[0].queryId).toBe(query.id);
      expect(execCmd.mock.calls[0][0].args[0].targetId).toBe(ref.id);
    });
  });
  describe("startAt()", () => {
    it("should involve native side with correct parameters", () => {
      const ref: Reference = commonDb.ref("");
      const query: Query = ref.startAt(3);
      expect(execCmd.mock.calls[0][0].args[0].queryId).toBe(query.id);
      expect(execCmd.mock.calls[0][0].args[0].targetId).toBe(ref.id);
      expect(execCmd.mock.calls[0][0].args[0].value).toBe(LZString.compressToBase64(JSON.stringify(3)));
    });
  });
});
