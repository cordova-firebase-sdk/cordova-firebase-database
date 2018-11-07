import { FirebaseDatabasePlugin } from "../FirebaseDatabasePlugin";
import { LZString } from "cordova-firebase-core/index";

declare const Promise: any;

describe("[FirebaseDatabasePlugin]", () => {

  it("should return the same id and same database with init parameters", () => {
    const _: FirebaseDatabasePlugin = new FirebaseDatabasePlugin("id", "db");
    expect(_.id).toEqual("id");
    expect(_.database).toEqual("db");
  });

  describe("database_goOffline", () => {
    it("should execute database.goOffline() method", (done) => {
      const db: any = {
        goOffline: jest.fn(),
      };
      const _: FirebaseDatabasePlugin = new FirebaseDatabasePlugin("id", db);
      _.database_goOffline(() => {
        expect(db.goOffline.mock.calls.length).toBe(1);
        done();
      }, null);
    });
  });

  describe("database_goOnline", () => {
    it("should execute database.goOnline() method", (done) => {
      const db: any = {
        goOnline: jest.fn(),
      };
      const _: FirebaseDatabasePlugin = new FirebaseDatabasePlugin("id", db);
      _.database_goOnline(() => {
        expect(db.goOnline.mock.calls.length).toBe(1);
        done();
      }, null);
    });
  });

  describe("database_ref", () => {
    it("should execute database.ref() method with correct parameter", (done) => {
      const db: any = {
        ref: jest.fn(),
      };
      const _: FirebaseDatabasePlugin = new FirebaseDatabasePlugin("id", db);
      _.database_ref(() => {
        expect(db.ref.mock.calls.length).toBe(1);
        expect(db.ref.mock.calls[0][0]).toEqual("path");
        done();
      }, null, [{
        path: "path",
      }]);
    });
  });

  describe("onDisconnect_cancel", () => {
    it("should execute ref.cancel() method", (done) => {
      const _: FirebaseDatabasePlugin = new FirebaseDatabasePlugin("id", null);
      const ref: any = {
        cancel: jest.fn(() => {
          return Promise.resolve();
        }),
      };
      _._set("targetId", ref);
      _.onDisconnect_cancel(() => {
        expect(ref.cancel.mock.calls.length).toBe(1);
        done();
      }, null, [{
        targetId: "targetId",
      }]);
    });
  });

  describe("onDisconnect_remove", () => {
    it("should execute ref.remove() method", (done) => {
      const _: FirebaseDatabasePlugin = new FirebaseDatabasePlugin("id", null);
      const ref: any = {
        remove: jest.fn(() => {
          return Promise.resolve();
        }),
      };
      _._set("targetId", ref);
      _.onDisconnect_remove(() => {
        expect(ref.remove.mock.calls.length).toBe(1);
        done();
      }, null, [{
        targetId: "targetId",
      }]);
    });
  });

  describe("onDisconnect_set", () => {
    it("should execute ref.set() method with value", (done) => {
      const _: FirebaseDatabasePlugin = new FirebaseDatabasePlugin("id", null);
      const onDisconnect: any = {
        set: jest.fn(() => {
          return Promise.resolve();
        }),
      };
      _._set("targetId", onDisconnect);

      const dummyValue: any = {
        hello: "world",
      };
      _.onDisconnect_set(() => {
        expect(onDisconnect.set.mock.calls.length).toBe(1);
        expect(onDisconnect.set.mock.calls[0][0]).toEqual(dummyValue);
        done();
      }, null, [{
        targetId: "targetId",
        value: LZString.compressToBase64(JSON.stringify(dummyValue)),
      }]);
    });
  });

  describe("onDisconnect_setWithPriority", () => {
    it("should execute ref.setWithPriority() method with value", (done) => {
      const _: FirebaseDatabasePlugin = new FirebaseDatabasePlugin("id", null);
      const onDisconnect: any = {
        setWithPriority: jest.fn(() => {
          return Promise.resolve();
        }),
      };
      _._set("targetId", onDisconnect);

      const dummyValue: any = {
        hello: "world",
      };
      const dummyPriority: string = "high";

      _.onDisconnect_setWithPriority(() => {
        expect(onDisconnect.setWithPriority.mock.calls.length).toBe(1);
        expect(onDisconnect.setWithPriority.mock.calls[0][0]).toEqual(dummyValue);
        expect(onDisconnect.setWithPriority.mock.calls[0][1]).toEqual(dummyPriority);
        done();
      }, null, [{
        targetId: "targetId",
        priority: LZString.compressToBase64(JSON.stringify(dummyPriority)),
        value: LZString.compressToBase64(JSON.stringify(dummyValue)),
      }]);
    });
  });

  describe("onDisconnect_update", () => {
    it("should execute ref.setWithPriority() method with value", (done) => {
      const _: FirebaseDatabasePlugin = new FirebaseDatabasePlugin("id", null);
      const onDisconnect: any = {
        setWithPriority: jest.fn(() => {
          return Promise.resolve();
        }),
      };
      _._set("targetId", onDisconnect);

      const dummyValue: any = {
        hello: "world",
      };
      const dummyPriority: string = "high";

      _.onDisconnect_update(() => {
        expect(onDisconnect.setWithPriority.mock.calls.length).toBe(1);
        expect(onDisconnect.setWithPriority.mock.calls[0][0]).toEqual(dummyValue);
        expect(onDisconnect.setWithPriority.mock.calls[0][1]).toEqual(dummyPriority);
        done();
      }, null, [{
        targetId: "targetId",
        priority: LZString.compressToBase64(JSON.stringify(dummyPriority)),
        value: LZString.compressToBase64(JSON.stringify(dummyValue)),
      }]);
    });
  });


  describe("reference_child", () => {
    it("should create a new reference", (done) => {
      const _: FirebaseDatabasePlugin = new FirebaseDatabasePlugin("id", null);
      const ref: any = {
        child: jest.fn(() => {
          return {
            key: "childRefKey",
            url: "childRefUrl",
          };
        }),
      };
      _._set("targetId", ref);

      _.reference_child((results: any) => {
        expect(ref.child.mock.calls.length).toBe(1);
        expect(ref.child.mock.calls[0][0]).toEqual("path");
        expect(results.key).toEqual("childRefKey");
        expect(results.url).toEqual("childRefUrl");
        done();
      }, null, [{
        childId: "childId",
        path: "path",
        targetId: "targetId",
      }]);
    });
  });

});
