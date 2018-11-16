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

  describe("constructor", () => {
    it("should reject if params is null", () => {
      expect(() => {
        new Query(null, {
          exec: null,
        });
      }).toThrowErrorMatchingSnapshot();
    });
    it("should reject if params.url is null", () => {
      expect(() => {
        new Query({
          url: null,
          pluginName: null,
        }, null);
      }).toThrowErrorMatchingSnapshot();
    });
    it("should reject if _opts is null", () => {
      expect(() => {
        new Query({
          url: "https://",
          pluginName: "",
        }, null);
      }).toThrowErrorMatchingSnapshot();
    });

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
  describe("isEqual", () => {
    it("should be true", () => {
      const ref1: Reference = commonDb.ref("users");
      const ref2: Reference = commonDb.ref("users");
      expect(ref1.isEqual(ref2)).toBe(true);
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

  describe("off()", () => {
    it("should work correctly", (done) => {
      const ref: Reference = commonDb.ref("");
      const value: any = { hello: "world" };
      const query: Query = ref.limitToLast(3);
      const _onSpy = jest.spyOn(query, "_on");
      let triggerred: boolean = false;

      const listener = query.on("value", (snapshot: DataSnapshot): void => {
        triggerred = true;
      });
      query.off("value", listener);

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
        eventType: "value",
        listenerId: _onSpy.mock.calls[0][0],
      });
      setTimeout(() => {
        expect(triggerred).toBe(false);
        done();
      }, 5);
    });
    it("should work correctly when context is specified", (done) => {
      const ref: Reference = commonDb.ref("");
      const value: any = { hello: "world" };
      const query: Query = ref.limitToLast(3);
      const _onSpy = jest.spyOn(query, "_on");
      let triggerred: boolean = false;

      const listener = query.on("value", (snapshot: DataSnapshot): void => {
        triggerred = true;
      });
      query.off("value", listener, query);

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
        eventType: "value",
        listenerId: _onSpy.mock.calls[0][0],
      });
      setTimeout(() => {
        expect(triggerred).toBe(false);
        done();
      }, 5);
    });
    it("should work correctly even if listener is omitted", (done) => {
      const ref: Reference = commonDb.ref("");
      const value: any = { hello: "world" };
      const query: Query = ref.limitToLast(3);
      const _onSpy = jest.spyOn(query, "_on");
      let triggerred: boolean = false;

      const listener = query.on("value", (snapshot: DataSnapshot): void => {
        triggerred = true;
      });
      query.off("value");

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
        eventType: "value",
        listenerId: _onSpy.mock.calls[0][0],
      });
      setTimeout(() => {
        expect(triggerred).toBe(false);
        done();
      }, 5);
    });
    it("should work correctly even if eventType and listener are omitted", (done) => {
      const ref: Reference = commonDb.ref("");
      const value: any = { hello: "world" };
      const query: Query = ref.limitToLast(3);
      const _onSpy = jest.spyOn(query, "_on");
      let triggerred: boolean = false;

      const listener = query.on("value", (snapshot: DataSnapshot): void => {
        triggerred = true;
      });
      query.off();

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
        eventType: "value",
        listenerId: _onSpy.mock.calls[0][0],
      });
      setTimeout(() => {
        expect(triggerred).toBe(false);
        done();
      }, 5);
    });
    it("should throw Error if eventType is invalid", () => {
      const ref: Reference = commonDb.ref("");
      const query: Query = ref.limitToLast(3);
      let triggerred: boolean = false;

      const listener = query.on("value", (snapshot: DataSnapshot): void => {
        triggerred = true;
      });
      expect(() => {
        query.off("invalidEvent", listener);
      }).toThrowErrorMatchingSnapshot();

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
        eventType: "value",
        listenerId: _onSpy.mock.calls[0][0],
      });
    });
    it.only("should work correctly when cancelCallback is provided", (done) => {
      const ref: Reference = commonDb.ref("");
      const value: any = { hello: "world" };
      const query: Query = ref.limitToLast(3);
      const _onSpy = jest.spyOn(query, "_on");
      let triggerred: boolean = false;

      execCmd.mockImplementationOnce((params) => {
        if (params.methodName !== "query_on") {
          return Promise.resolve(params);
        }
        const _nativeCallback = (window as any).plugin.firebase.database._nativeCallback;

        //_nativeCallback(query.id, params.args[0].id);
        console.log(params);

        return Promise.resolve(params);
      });

      query.on("value", (snapshot: DataSnapshot) => {
        triggerred = true;
      }, (error?: any) => {
        expect(error).toThrowErrorMatchingSnapshot();
        done();
      }, query);
    });
  });
  describe("once()", () => {
    it("should work correctly", (done) => {

      const ref: Reference = commonDb.ref("");
      const value: any = { hello: "world" };
      const query: Query = ref.limitToLast(3);
      const _onSpy = jest.spyOn(query, "_one");

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
        eventType: "value",
        listenerId: _onSpy.mock.calls[0][0],
      });
      ref.root._trigger("nativeEvent", {
        args: [LZString.compressToBase64(dummySnapshot2)],
        eventType: "value",
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
