import { App, LZString } from "cordova-firebase-core/index";
import { Database } from "../Database";
import { DataSnapshot, Query, Reference } from "../DataClasses";
import { INativeEventParams } from "../INativeEventParams";
import { exec } from "../__mocks__/cordova";
import { execCmd } from "../__mocks__/CommandQueue";
const proxy = require("cordova/exec/proxy");

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
    it("should involve native side with correct parameters", (done) => {
      const ref: Reference = commonDb.ref("");
      const value: any = {
        hello: "world",
      };
      const query: Query = ref.endAt(value, "key");
      setTimeout(() => {
        expect(execCmd.mock.calls[0][0].methodName).toBe("database_ref");
        expect(execCmd.mock.calls[0][0].pluginName).toBe(ref.pluginName);
        expect(execCmd.mock.calls[1][0].pluginName).toBe(query.pluginName);
        expect(ref.pluginName).toBe(query.pluginName);
        expect(execCmd.mock.calls[1][0].methodName).toBe("query_endAt");
        expect(execCmd.mock.calls[1][0].args[0].targetId).toBe(ref.id);
        expect(execCmd.mock.calls[1][0].args[0].key).toBe("key");
        expect(execCmd.mock.calls[1][0].args[0].value).toBe(LZString.compressToBase64(JSON.stringify(value)));
        done();
      }, 5);
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
        setTimeout(done, 0);
      });
      ref.root._trigger("nativeEvent", {
        args: ["0", "1"],
        eventType: "eventType",
        listenerId: "listenerId",
      });
    });
  });
  describe("equalTo", () => {
    it("should involve native side with correct parameters", (done) => {
      const ref: Reference = commonDb.ref("");
      const value: any = {
        hello: "world",
      };
      const query: Query = ref.equalTo(value, "key");

      setTimeout(() => {
        expect(execCmd.mock.calls[0][0].methodName).toBe("database_ref");
        expect(execCmd.mock.calls[1][0].methodName).toBe("query_equalTo");
        expect(execCmd.mock.calls[1][0].args[0].key).toEqual("key");
        expect(execCmd.mock.calls[1][0].args[0].queryId).toBe(query.id);
        expect(execCmd.mock.calls[1][0].args[0].targetId).toBe(ref.id);
        expect(execCmd.mock.calls[1][0].args[0].value).toBe(LZString.compressToBase64(JSON.stringify(value)));
        done();
      }, 5);
    });
  });
  describe("limitToFirst", () => {
    it("should involve native side with correct parameters", (done) => {
      const ref: Reference = commonDb.ref("");
      const value: any = {
        hello: "world",
      };
      const query: Query = ref.limitToFirst(3);
      setTimeout(() => {
        expect(execCmd.mock.calls[0][0].methodName).toBe("database_ref");
        expect(execCmd.mock.calls[1][0].methodName).toBe("query_limitToFirst");
        expect(execCmd.mock.calls[1][0].args[0].limit).toEqual(3);
        expect(execCmd.mock.calls[1][0].args[0].queryId).toBe(query.id);
        expect(execCmd.mock.calls[1][0].args[0].targetId).toBe(ref.id);
        done();
      }, 5);
    });
  });
  describe("limitToLast", () => {
    it("should involve native side with correct parameters", (done) => {
      const ref: Reference = commonDb.ref("");
      const value: any = {
        hello: "world",
      };
      const query: Query = ref.limitToLast(3);
      setTimeout(() => {
        expect(execCmd.mock.calls[0][0].methodName).toBe("database_ref");
        expect(execCmd.mock.calls[1][0].methodName).toBe("query_limitToLast");
        expect(execCmd.mock.calls[1][0].args[0].limit).toEqual(3);
        expect(execCmd.mock.calls[1][0].args[0].queryId).toBe(query.id);
        expect(execCmd.mock.calls[1][0].args[0].targetId).toBe(ref.id);
        done();
      }, 5);
    });
  });
  describe("on()", () => {
    it("should work correctly", (done) => {
      const ref: Reference = commonDb.ref("");
      const value: any = { hello: "world" };
      const query: Query = ref.limitToLast(3);
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
      const query: Query = ref.limitToLast(3);
      const _onSpy = jest.spyOn(query, "_on");

      query.once("value", (snapshot: DataSnapshot): void => {
        expect(snapshot.key).toEqual("key1");
        expect(snapshot.getPriority()).toEqual("high");
        setTimeout(done, 0);
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
    it("should involve native side with correct parameters", (done) => {
      const ref: Reference = commonDb.ref("");
      const query: Query = ref.orderByChild("children");
      setTimeout(() => {
        expect(execCmd.mock.calls[0][0].methodName).toBe("database_ref");
        expect(execCmd.mock.calls[1][0].methodName).toBe("query_orderByChild");
        expect(execCmd.mock.calls[1][0].args[0].path).toEqual("children");
        expect(execCmd.mock.calls[1][0].args[0].queryId).toBe(query.id);
        expect(execCmd.mock.calls[1][0].args[0].targetId).toBe(ref.id);
        done();
      }, 5);
    });
  });
  describe("orderByKey()", () => {
    it("should involve native side with correct parameters", (done) => {
      const ref: Reference = commonDb.ref("");
      const query: Query = ref.orderByKey();
      setTimeout(() => {
        expect(execCmd.mock.calls[0][0].methodName).toBe("database_ref");
        expect(execCmd.mock.calls[1][0].methodName).toBe("query_orderByKey");
        expect(execCmd.mock.calls[1][0].args[0].queryId).toBe(query.id);
        expect(execCmd.mock.calls[1][0].args[0].targetId).toBe(ref.id);
        done();
      }, 5);
    });
  });
  describe("orderByPriority()", () => {
    it("should involve native side with correct parameters", (done) => {
      const ref: Reference = commonDb.ref("");
      const query: Query = ref.orderByPriority();
      setTimeout(() => {
        expect(execCmd.mock.calls[0][0].methodName).toBe("database_ref");
        expect(execCmd.mock.calls[1][0].methodName).toBe("query_orderByPriority");
        expect(execCmd.mock.calls[1][0].args[0].queryId).toBe(query.id);
        expect(execCmd.mock.calls[1][0].args[0].targetId).toBe(ref.id);
        done();
      }, 5);
    });
  });
  describe("orderByValue()", () => {
    it("should involve native side with correct parameters", (done) => {
      const ref: Reference = commonDb.ref("");
      const query: Query = ref.orderByValue();
      setTimeout(() => {
        expect(execCmd.mock.calls[0][0].methodName).toBe("database_ref");
        expect(execCmd.mock.calls[1][0].methodName).toBe("query_orderByValue");
        expect(execCmd.mock.calls[1][0].args[0].queryId).toBe(query.id);
        expect(execCmd.mock.calls[1][0].args[0].targetId).toBe(ref.id);
        done();
      }, 5);
    });
  });
  describe("startAt()", () => {
    it("should involve native side with correct parameters", (done) => {
      const ref: Reference = commonDb.ref("");
      const query: Query = ref.startAt(3);
      setTimeout(() => {
        expect(execCmd.mock.calls[0][0].methodName).toBe("database_ref");
        expect(execCmd.mock.calls[1][0].methodName).toBe("query_startAt");
        expect(execCmd.mock.calls[1][0].args[0].queryId).toBe(query.id);
        expect(execCmd.mock.calls[1][0].args[0].targetId).toBe(ref.id);
        expect(execCmd.mock.calls[1][0].args[0].value).toBe(LZString.compressToBase64(JSON.stringify(3)));
        done();
      }, 5);
    });
  });
});
