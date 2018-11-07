import { FirebaseDatabasePlugin } from "../FirebaseDatabasePlugin";
import { LZString } from "cordova-firebase-core/index";

describe("[FirebaseDatabasePlugin(native side)]", () => {

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
    it("should execute onDisconnect.cancel() method", (done) => {
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
    it("should execute onDisconnect.remove() method", (done) => {
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
    it("should execute onDisconnect.set() method with value", (done) => {
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
    it("should execute onDisconnect.setWithPriority() method with value", (done) => {
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
    it("should execute onDisconnect.update() method with value", (done) => {
      const _: FirebaseDatabasePlugin = new FirebaseDatabasePlugin("id", null);
      const onDisconnect: any = {
        update: jest.fn(() => {
          return Promise.resolve();
        }),
      };
      _._set("targetId", onDisconnect);

      const dummyValue: any = {
        hello: "world",
      };

      _.onDisconnect_update(() => {
        expect(onDisconnect.update.mock.calls.length).toBe(1);
        expect(onDisconnect.update.mock.calls[0][0]).toEqual(dummyValue);
        done();
      }, null, [{
        targetId: "targetId",
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
            toString: (): string => {
              return "childRefUrl";
            },
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

  describe("reference_onDisconnect", () => {
    it("should create a new onDisconnect", (done) => {
      const _: FirebaseDatabasePlugin = new FirebaseDatabasePlugin("id", null);
      const ref: any = {
        onDisconnect: jest.fn((): string => {
          return "dummyOnDisconnect";
        }),
      };
      _._set("targetId", ref);

      _.reference_onDisconnect(() => {
        expect(ref.onDisconnect.mock.calls.length).toBe(1);
        expect(_._get("onDisconnectId")).toEqual("dummyOnDisconnect");
        done();
      }, null, [{
        onDisconnectId: "onDisconnectId",
        targetId: "targetId",
      }]);
    });
  });

  describe("reference_push", () => {
    it("should create a thenableRef", (done) => {
      const dummyValue: any = {
        hello: "firebase",
      };
      const _: FirebaseDatabasePlugin = new FirebaseDatabasePlugin("id", null);
      const ref: any = {
        push: jest.fn((): string => {
          return Promise.resolve("OK");
        }),
      };
      _._set("targetId", ref);

      _.reference_push(() => {
        expect(ref.push.mock.calls.length).toBe(1);
        expect(ref.push.mock.calls[0][0]).toEqual(dummyValue);
        done();
      }, null, [{
        newId: "newId",
        targetId: "targetId",
        value: LZString.compressToBase64(JSON.stringify(dummyValue)),
      }]);
    });
  });

  describe("reference_remove", () => {
    it("should remove specified reference correctly", (done) => {
      const _: FirebaseDatabasePlugin = new FirebaseDatabasePlugin("id", null);
      const ref: any = {
        remove: jest.fn((): string => {
          return Promise.resolve();
        }),
      };
      _._set("targetId", ref);

      _.reference_remove(() => {
        expect(ref.remove.mock.calls.length).toBe(1);
        expect(_._get("targetId")).toBe(undefined);
        done();
      }, null, [{
        targetId: "targetId",
      }]);
    });
  });

  describe("reference_set", () => {
    it("should set specified value", (done) => {
      const dummyValue: any = {
        hello: "firebase",
      };
      const _: FirebaseDatabasePlugin = new FirebaseDatabasePlugin("id", null);
      const ref: any = {
        set: jest.fn((): string => {
          return Promise.resolve();
        }),
      };
      _._set("targetId", ref);

      _.reference_set(() => {
        expect(ref.set.mock.calls.length).toBe(1);
        expect(ref.set.mock.calls[0][0]).toEqual(dummyValue);
        done();
      }, null, [{
        targetId: "targetId",
        data: LZString.compressToBase64(JSON.stringify(dummyValue)),
      }]);
    });
  });

  describe("reference_setPriority", () => {
    it("should set specified property", (done) => {
      const _: FirebaseDatabasePlugin = new FirebaseDatabasePlugin("id", null);
      const ref: any = {
        setPriority: jest.fn((): string => {
          return Promise.resolve();
        }),
      };
      _._set("targetId", ref);

      _.reference_setPriority(() => {
        expect(ref.setPriority.mock.calls.length).toBe(1);
        expect(ref.setPriority.mock.calls[0][0]).toEqual("low");
        done();
      }, null, [{
        targetId: "targetId",
        priority: LZString.compressToBase64(JSON.stringify("low")),
      }]);
    });
  });

  describe("reference_setWithPriority", () => {
    it("should set specified property and values", (done) => {
      const dummyValue: any = {
        hello: "firebase",
      };
      const _: FirebaseDatabasePlugin = new FirebaseDatabasePlugin("id", null);
      const ref: any = {
        setWithPriority: jest.fn((): string => {
          return Promise.resolve();
        }),
      };
      _._set("targetId", ref);

      _.reference_setWithPriority(() => {
        expect(ref.setWithPriority.mock.calls.length).toBe(1);
        expect(ref.setWithPriority.mock.calls[0][0]).toEqual(dummyValue);
        expect(ref.setWithPriority.mock.calls[0][1]).toEqual("low");
        done();
      }, null, [{
        data: LZString.compressToBase64(JSON.stringify(dummyValue)),
        targetId: "targetId",
        priority: LZString.compressToBase64(JSON.stringify("low")),
      }]);
    });
  });

  describe("reference_update", () => {
    it("should update with specified data", (done) => {
      const dummyValue: any = {
        hello: "firebase",
        firebase: "database",
      };
      const _: FirebaseDatabasePlugin = new FirebaseDatabasePlugin("id", null);
      const ref: any = {
        update: jest.fn((): string => {
          return Promise.resolve();
        }),
      };
      _._set("targetId", ref);

      _.reference_update(() => {
        expect(ref.update.mock.calls.length).toBe(1);
        expect(ref.update.mock.calls[0][0]).toEqual(dummyValue);
        done();
      }, null, [{
        data: LZString.compressToBase64(JSON.stringify(dummyValue)),
        targetId: "targetId",
      }]);
    });
  });


  describe("query_endAt", () => {
    it("should execute endAt() with correct parameters", (done) => {
      const dummyValue: any = {
        hello: "firebase",
      };
      const _: FirebaseDatabasePlugin = new FirebaseDatabasePlugin("id", null);
      const ref: any = {
        endAt: jest.fn((): string => {
          return "query";
        }),
      };
      _._set("targetId", ref);

      _.query_endAt(() => {
        expect(ref.endAt.mock.calls.length).toBe(1);
        expect(ref.endAt.mock.calls[0][0]).toEqual(dummyValue);
        expect(ref.endAt.mock.calls[0][1]).toEqual("key");
        done();
      }, null, [{
        key: "key",
        value: LZString.compressToBase64(JSON.stringify(dummyValue)),
        targetId: "targetId",
      }]);
    });
  });

  describe("query_equalTo", () => {
    it("should execute equalTo() with correct parameters", (done) => {
      const dummyValue: any = {
        hello: "firebase",
      };
      const _: FirebaseDatabasePlugin = new FirebaseDatabasePlugin("id", null);
      const ref: any = {
        equalTo: jest.fn((): string => {
          return "query";
        }),
      };
      _._set("targetId", ref);

      _.query_equalTo(() => {
        expect(ref.equalTo.mock.calls.length).toBe(1);
        expect(ref.equalTo.mock.calls[0][0]).toEqual(dummyValue);
        expect(ref.equalTo.mock.calls[0][1]).toEqual("key");
        done();
      }, null, [{
        key: "key",
        value: LZString.compressToBase64(JSON.stringify(dummyValue)),
        targetId: "targetId",
      }]);
    });
  });

  describe("query_limitToFirst", () => {
    it("should execute limitToFirst() with correct parameters", (done) => {
      const _: FirebaseDatabasePlugin = new FirebaseDatabasePlugin("id", null);
      const ref: any = {
        limitToFirst: jest.fn((): string => {
          return "query";
        }),
      };
      _._set("targetId", ref);

      _.query_limitToFirst(() => {
        expect(ref.limitToFirst.mock.calls.length).toBe(1);
        expect(ref.limitToFirst.mock.calls[0][0]).toEqual("limit");
        done();
      }, null, [{
        limit: "limit",
        targetId: "targetId",
      }]);
    });
  });

  describe("query_limitToLast", () => {
    it("should execute limitToLast() with correct parameters", (done) => {
      const _: FirebaseDatabasePlugin = new FirebaseDatabasePlugin("id", null);
      const ref: any = {
        limitToLast: jest.fn((): string => {
          return "query";
        }),
      };
      _._set("targetId", ref);

      _.query_limitToLast(() => {
        expect(ref.limitToLast.mock.calls.length).toBe(1);
        expect(ref.limitToLast.mock.calls[0][0]).toEqual("limit");
        done();
      }, null, [{
        limit: "limit",
        targetId: "targetId",
      }]);
    });
  });

  describe("query_off", () => {
    it("should execute off() with correct parameters", (done) => {
      const _: FirebaseDatabasePlugin = new FirebaseDatabasePlugin("id", null);
      const ref: any = {
        off: jest.fn((): string => {
          return "query";
        }),
      };
      _._set("targetId", ref);

      const listener1 = () => { return; };
      const listener2 = () => { return; };
      const listener3 = () => { return; };
      _._set("listener1", listener1);
      _._set("listener2", listener2);
      _._set("listener3", listener3);

      _.query_off(() => {
        expect(ref.off.mock.calls.length).toBe(3);
        expect(ref.off.mock.calls[0][0]).toEqual("value");
        expect(ref.off.mock.calls[0][1]).toEqual(listener1);
        expect(ref.off.mock.calls[1][1]).toEqual(listener2);
        expect(ref.off.mock.calls[2][1]).toEqual(listener3);
        done();
      }, null, [{
        eventType: "value",
        listenerIdSet: ["listener1", "listener2", "listener3",],
        targetId: "targetId",
      }]);
    });
  });

  describe("query_on", () => {
    it("should execute on() with correct parameters", (done) => {
      const _: FirebaseDatabasePlugin = new FirebaseDatabasePlugin("id", null);
      const ref: any = {
        on: jest.fn((): string => {
          return "query_on";
        }),
      };
      _._set("targetId", ref);

      _.query_on(() => {
        expect(ref.on.mock.calls.length).toBe(1);
        expect(ref.on.mock.calls[0][0]).toEqual("value");
        done();
      }, null, [{
        eventType: "value",
        targetId: "targetId",
      }]);
    });
  });

  describe("query_orderByChild", () => {
    it("should execute orderByChild() with correct parameters", (done) => {
      const _: FirebaseDatabasePlugin = new FirebaseDatabasePlugin("id", null);
      const ref: any = {
        orderByChild: jest.fn((): string => {
          return "query";
        }),
      };
      _._set("targetId", ref);

      _.query_orderByChild(() => {
        expect(ref.orderByChild.mock.calls.length).toBe(1);
        expect(ref.orderByChild.mock.calls[0][0]).toEqual("path");
        done();
      }, null, [{
        targetId: "targetId",
        path: "path",
        queryId: "queryId",
      }]);
    });
  });

  describe("orderByChild", () => {
    it("should execute orderByKey() with correct parameters", (done) => {
      const _: FirebaseDatabasePlugin = new FirebaseDatabasePlugin("id", null);
      const ref: any = {
        orderByChild: jest.fn((): string => {
          return "query";
        }),
      };
      _._set("targetId", ref);

      _.query_orderByChild(() => {
        expect(ref.orderByChild.mock.calls.length).toBe(1);
        expect(ref.orderByChild.mock.calls[0][0]).toEqual("path");
        done();
      }, null, [{
        targetId: "targetId",
        path: "path",
        queryId: "queryId",
      }]);
    });
  });

  describe("query_orderByKey", () => {
    it("should execute orderByKey() with correct parameters", (done) => {
      const _: FirebaseDatabasePlugin = new FirebaseDatabasePlugin("id", null);
      const ref: any = {
        orderByKey: jest.fn((): string => {
          return "query";
        }),
      };
      _._set("targetId", ref);

      _.query_orderByKey(() => {
        expect(ref.orderByKey.mock.calls.length).toBe(1);
        done();
      }, null, [{
        targetId: "targetId",
        queryId: "queryId",
      }]);
    });
  });

  describe("query_orderByPriority", () => {
    it("should execute orderByPriority() with correct parameters", (done) => {
      const _: FirebaseDatabasePlugin = new FirebaseDatabasePlugin("id", null);
      const ref: any = {
        orderByPriority: jest.fn((): string => {
          return "query";
        }),
      };
      _._set("targetId", ref);

      _.query_orderByPriority(() => {
        expect(ref.orderByPriority.mock.calls.length).toBe(1);
        done();
      }, null, [{
        targetId: "targetId",
        queryId: "queryId",
      }]);
    });
  });

  describe("query_orderByValue", () => {
    it("should execute orderByValue() with correct parameters", (done) => {
      const _: FirebaseDatabasePlugin = new FirebaseDatabasePlugin("id", null);
      const ref: any = {
        orderByValue: jest.fn((): string => {
          return "query";
        }),
      };
      _._set("targetId", ref);

      _.query_orderByValue(() => {
        expect(ref.orderByValue.mock.calls.length).toBe(1);
        done();
      }, null, [{
        targetId: "targetId",
        queryId: "queryId",
      }]);
    });
  });

  describe("query_startAt", () => {
    it("should execute startAt() with correct parameters", (done) => {
      const dummyValue: any = {
        hello: "firebase",
      };
      const _: FirebaseDatabasePlugin = new FirebaseDatabasePlugin("id", null);
      const ref: any = {
        startAt: jest.fn((): string => {
          return "query";
        }),
      };
      _._set("targetId", ref);

      _.query_startAt(() => {
        expect(ref.startAt.mock.calls.length).toBe(1);
        expect(ref.startAt.mock.calls[0][0]).toEqual(dummyValue);
        done();
      }, null, [{
        key: "key",
        value: LZString.compressToBase64(JSON.stringify(dummyValue)),
        targetId: "targetId",
      }]);
    });
  });

});
