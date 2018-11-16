import { FirebaseDatabasePlugin } from "../FirebaseDatabasePlugin";
import { LZString } from "cordova-firebase-core/index";

describe("[FirebaseDatabasePlugin(native side)]", () => {

  (window as any).plugin = {
    firebase: {
      database: {
        _nativeCallback: jest.fn(),
      },
    },
  };
  const _nativeCallback = (window as any).plugin.firebase.database._nativeCallback;


  beforeEach(() => {
    _nativeCallback.mockClear();
  });


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
    it("should catch error", (done) => {
      const db: any = {
        goOffline: jest.fn(() => {
          throw new Error("Something happends!");
        }),
      };
      const _: FirebaseDatabasePlugin = new FirebaseDatabasePlugin("id", db);
      _.database_goOffline(null, (error: Error): void => {
        expect(db.goOffline.mock.calls.length).toBe(1);
        expect(error).toEqual(new Error("Something happends!"));
        done();
      });
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
    it("should catch error", (done) => {
      const db: any = {
        goOnline: jest.fn(() => {
          throw new Error("Something happends!");
        }),
      };
      const _: FirebaseDatabasePlugin = new FirebaseDatabasePlugin("id", db);
      _.database_goOnline(null, (error: Error): void => {
        expect(db.goOnline.mock.calls.length).toBe(1);
        expect(error).toEqual(new Error("Something happends!"));
        done();
      });
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
    it("should catch error", (done) => {
      const db: any = {
        ref: jest.fn(() => {
          throw new Error("Something happends!");
        }),
      };
      const _: FirebaseDatabasePlugin = new FirebaseDatabasePlugin("id", db);
      _.database_ref(null, (error: Error): void => {
        expect(db.ref.mock.calls.length).toBe(1);
        expect(error).toEqual(new Error("Something happends!"));
        done();
      }, [{
        path: undefined,
      }]);
    });
  });

  describe("onDisconnect_cancel", () => {
    it("should execute onDisconnect.cancel() method", (done) => {
      const _: FirebaseDatabasePlugin = new FirebaseDatabasePlugin("id", null);
      const onDisconnect: any = {
        cancel: jest.fn(() => {
          return Promise.resolve();
        }),
      };
      _._set("targetId", onDisconnect);
      _.onDisconnect_cancel(() => {
        expect(onDisconnect.cancel.mock.calls.length).toBe(1);
        done();
      }, null, [{
        targetId: "targetId",
      }]);
    });
    it("should catch error", (done) => {
      const _: FirebaseDatabasePlugin = new FirebaseDatabasePlugin("id", null);
      const onDisconnect: any = {
        cancel: jest.fn(() => {
          throw new Error("Something happends!");
        }),
      };
      _._set("targetId", onDisconnect);
      _.onDisconnect_cancel(null, (error: Error): void => {
        expect(onDisconnect.cancel.mock.calls.length).toBe(1);
        expect(error).toEqual(new Error("Something happends!"));
        done();
      }, [{
        targetId: "targetId",
      }]);
    });
  });

  describe("onDisconnect_remove", () => {
    it("should execute onDisconnect.remove() method", (done) => {
      const _: FirebaseDatabasePlugin = new FirebaseDatabasePlugin("id", null);
      const onDisconnect: any = {
        remove: jest.fn(() => {
          return Promise.resolve();
        }),
      };
      _._set("targetId", onDisconnect);
      _.onDisconnect_remove(() => {
        expect(onDisconnect.remove.mock.calls.length).toBe(1);
        done();
      }, null, [{
        targetId: "targetId",
      }]);
    });
    it("should catch error", (done) => {
      const _: FirebaseDatabasePlugin = new FirebaseDatabasePlugin("id", null);
      const onDisconnect: any = {
        remove: jest.fn(() => {
          throw new Error("Something happends!");
        }),
      };
      _._set("targetId", onDisconnect);
      _.onDisconnect_remove(null, (error: Error): void => {
        expect(onDisconnect.remove.mock.calls.length).toBe(1);
        expect(error).toEqual(new Error("Something happends!"));
        done();
      }, [{
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
    it("should catch error", (done) => {
      const _: FirebaseDatabasePlugin = new FirebaseDatabasePlugin("id", null);
      const onDisconnect: any = {
        set: jest.fn(() => {
          throw new Error("Something happends!");
        }),
      };
      const dummyValue: any = {
        hello: "world",
      };
      _._set("targetId", onDisconnect);
      _.onDisconnect_set(null, (error: Error): void => {
        expect(onDisconnect.set.mock.calls.length).toBe(1);
        expect(onDisconnect.set.mock.calls[0][0]).toEqual(dummyValue);
        expect(error).toEqual(new Error("Something happends!"));
        done();
      }, [{
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

      _.onDisconnect_setWithPriority(() => {
        expect(onDisconnect.setWithPriority.mock.calls.length).toBe(1);
        expect(onDisconnect.setWithPriority.mock.calls[0][0]).toEqual(dummyValue);
        expect(onDisconnect.setWithPriority.mock.calls[0][1]).toEqual("high");
        done();
      }, null, [{
        targetId: "targetId",
        priority: "high",
        value: LZString.compressToBase64(JSON.stringify(dummyValue)),
      }]);
    });
    it("should catch error", (done) => {
      const _: FirebaseDatabasePlugin = new FirebaseDatabasePlugin("id", null);
      const onDisconnect: any = {
        setWithPriority: jest.fn(() => {
          throw new Error("Something happends!");
        }),
      };
      const dummyValue: any = {
        hello: "world",
      };
      _._set("targetId", onDisconnect);
      _.onDisconnect_setWithPriority(null, (error: Error): void => {
        expect(onDisconnect.setWithPriority.mock.calls.length).toBe(1);
        expect(onDisconnect.setWithPriority.mock.calls[0][0]).toEqual(dummyValue);
        expect(onDisconnect.setWithPriority.mock.calls[0][1]).toEqual("high");
        expect(error).toEqual(new Error("Something happends!"));
        done();
      }, [{
        targetId: "targetId",
        priority: "high",
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
    it("should catch error", (done) => {
      const _: FirebaseDatabasePlugin = new FirebaseDatabasePlugin("id", null);
      const onDisconnect: any = {
        update: jest.fn(() => {
          throw new Error("Something happends!");
        }),
      };
      const dummyValue: any = {
        hello: "world",
      };
      _._set("targetId", onDisconnect);
      _.onDisconnect_update(null, (error: Error): void => {
        expect(onDisconnect.update.mock.calls.length).toBe(1);
        expect(onDisconnect.update.mock.calls[0][0]).toEqual(dummyValue);
        expect(error).toEqual(new Error("Something happends!"));
        done();
      }, [{
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
    it("should catch error", (done) => {
      const _: FirebaseDatabasePlugin = new FirebaseDatabasePlugin("id", null);
      const ref: any = {
        child: jest.fn(() => {
          throw new Error("Something happends!");
        }),
      };

      _._set("targetId", ref);
      _.reference_child(null, (error: Error): void => {
        expect(ref.child.mock.calls.length).toBe(1);
        expect(ref.child.mock.calls[0][0]).toEqual("path");
        expect(error).toEqual(new Error("Something happends!"));
        done();
      }, [{
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

    it("should catch error", (done) => {
      const _: FirebaseDatabasePlugin = new FirebaseDatabasePlugin("id", null);
      const ref: any = {
        onDisconnect: jest.fn(() => {
          throw new Error("Something happends!");
        }),
      };

      _._set("targetId", ref);
      _.reference_onDisconnect(null, (error: Error): void => {
        expect(ref.onDisconnect.mock.calls.length).toBe(1);
        expect(error).toEqual(new Error("Something happends!"));
        done();
      }, [{
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
        push: jest.fn((): Promise<void> => {
          return Promise.resolve();
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

    it("should catch error", (done) => {
      const _: FirebaseDatabasePlugin = new FirebaseDatabasePlugin("id", null);
      const ref: any = {
        push: jest.fn(() => {
          throw new Error("Something happends!");
        }),
      };

      _._set("targetId", ref);
      _.reference_push(null, (error: Error): void => {
        expect(ref.push.mock.calls.length).toBe(1);
        expect(error).toEqual(new Error("Something happends!"));
        done();
      }, [{
        newId: "newId",
        targetId: "targetId",
      }]);
    });
  });

  describe("reference_remove", () => {
    it("should remove specified reference correctly", (done) => {
      const _: FirebaseDatabasePlugin = new FirebaseDatabasePlugin("id", null);
      const ref: any = {
        remove: jest.fn((): Promise<void> => {
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

    it("should catch error", (done) => {
      const _: FirebaseDatabasePlugin = new FirebaseDatabasePlugin("id", null);
      const ref: any = {
        remove: jest.fn(() => {
          throw new Error("Something happends!");
        }),
      };

      _._set("targetId", ref);
      _.reference_remove(null, (error: Error): void => {
        expect(ref.remove.mock.calls.length).toBe(1);
        expect(error).toEqual(new Error("Something happends!"));
        done();
      }, [{
        newId: "newId",
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
        set: jest.fn((): Promise<void> => {
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

    it("should catch error", (done) => {
      const dummyValue: any = {
        hello: "firebase",
      };
      const _: FirebaseDatabasePlugin = new FirebaseDatabasePlugin("id", null);
      const ref: any = {
        set: jest.fn(() => {
          throw new Error("Something happends!");
        }),
      };

      _._set("targetId", ref);
      _.reference_set(null, (error: Error): void => {
        expect(ref.set.mock.calls.length).toBe(1);
        expect(ref.set.mock.calls[0][0]).toEqual(dummyValue);
        expect(error).toEqual(new Error("Something happends!"));
        done();
      }, [{
        targetId: "targetId",
        data: LZString.compressToBase64(JSON.stringify(dummyValue)),
      }]);
    });
  });

  describe("reference_setPriority", () => {
    it("should set specified property", (done) => {
      const _: FirebaseDatabasePlugin = new FirebaseDatabasePlugin("id", null);
      const ref: any = {
        setPriority: jest.fn((): Promise<void> => {
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
        priority: "low",
      }]);
    });
    it("should catch error", (done) => {
      const _: FirebaseDatabasePlugin = new FirebaseDatabasePlugin("id", null);
      const ref: any = {
        setPriority: jest.fn(() => {
          throw new Error("Something happends!");
        }),
      };

      _._set("targetId", ref);
      _.reference_setPriority(null, (error: Error): void => {
        expect(ref.setPriority.mock.calls.length).toBe(1);
        expect(ref.setPriority.mock.calls[0][0]).toEqual("low");
        expect(error).toEqual(new Error("Something happends!"));
        done();
      }, [{
        targetId: "targetId",
        priority: "low",
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
        setWithPriority: jest.fn((): Promise<void> => {
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
        priority: "low",
      }]);
    });
    it("should catch error", (done) => {
      const dummyValue: any = {
        hello: "firebase",
      };
      const _: FirebaseDatabasePlugin = new FirebaseDatabasePlugin("id", null);
      const ref: any = {
        setWithPriority: jest.fn(() => {
          throw new Error("Something happends!");
        }),
      };

      _._set("targetId", ref);
      _.reference_setWithPriority(null, (error: Error): void => {
        expect(ref.setWithPriority.mock.calls.length).toBe(1);
        expect(ref.setWithPriority.mock.calls[0][0]).toEqual(dummyValue);
        expect(ref.setWithPriority.mock.calls[0][1]).toEqual("low");
        expect(error).toEqual(new Error("Something happends!"));
        done();
      }, [{
        data: LZString.compressToBase64(JSON.stringify(dummyValue)),
        targetId: "targetId",
        priority: "low",
      }]);
    });
  });

  describe("reference_transaction", () => {
    it("should work correctly", (done) => {
      const _: FirebaseDatabasePlugin = new FirebaseDatabasePlugin("id", null);
      const ref: any = {
        transaction: jest.fn((transactionUpdate, callback, applyLocally) => {
          const result = transactionUpdate({
            count: 0,
          });
          callback(null, true, {
            exists: () => { return true; },
            exportVal: () => { return result; },
            getPriority: () => { return "normal"; },
            key: "somewhere",
            numChildren: () => { return 0; },
            val: () => { return result; },
          });
        }),
      };
      _._set("targetId", ref);

      _.reference_transaction(() => {
        expect(ref.transaction.mock.calls.length).toBe(1);
        done();
      }, null, [{
        applyLocally: true,
        targetId: "targetId",
        transactionUpdate: (currentValue) => {
          currentValue.count++;
          return currentValue;
        },
      }]);
    });
    it("should catch error", (done) => {
      const _: FirebaseDatabasePlugin = new FirebaseDatabasePlugin("id", null);
      const ref: any = {
        transaction: jest.fn((transactionUpdate, callback, applyLocally) => {
          throw new Error("Something happends!");
        }),
      };
      _._set("targetId", ref);

      _.reference_transaction(null, (error: Error): void => {
        expect(ref.transaction.mock.calls.length).toBe(1);
        expect(error).toEqual(new Error("Something happends!"));
        done();
      }, [{
        applyLocally: true,
        targetId: "targetId",
        transactionUpdate: (currentValue) => {
          currentValue.count++;
          return currentValue;
        },
      }]);
    });
    it("should catch error", (done) => {
      const _: FirebaseDatabasePlugin = new FirebaseDatabasePlugin("id", null);
      const ref: any = {
        transaction: jest.fn((transactionUpdate, callback, applyLocally) => {
          const result = transactionUpdate({
            count: 0,
          });
          callback(new Error("Something happends!"));
        }),
      };
      _._set("targetId", ref);

      _.reference_transaction(null, (error: Error): void => {
        expect(ref.transaction.mock.calls.length).toBe(1);
        expect(error).toEqual(new Error("Something happends!"));
        done();
      }, [{
        applyLocally: true,
        targetId: "targetId",
        transactionUpdate: (currentValue) => {
          currentValue.count++;
          return currentValue;
        },
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
        update: jest.fn((): Promise<void> => {
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
    it("should catch error", (done) => {
      const dummyValue: any = {
        hello: "firebase",
        firebase: "database",
      };
      const _: FirebaseDatabasePlugin = new FirebaseDatabasePlugin("id", null);
      const ref: any = {
        update: jest.fn(() => {
          throw new Error("Something happends!");
        }),
      };

      _._set("targetId", ref);
      _.reference_update(null, (error: Error): void => {
        expect(ref.update.mock.calls.length).toBe(1);
        expect(ref.update.mock.calls[0][0]).toEqual(dummyValue);
        expect(error).toEqual(new Error("Something happends!"));
        done();
      }, [{
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
      const query: any = {
        endAt: jest.fn((): string => {
          return "query";
        }),
      };
      _._set("targetId", query);

      _.query_endAt(() => {
        expect(query.endAt.mock.calls.length).toBe(1);
        expect(query.endAt.mock.calls[0][0]).toEqual(dummyValue);
        expect(query.endAt.mock.calls[0][1]).toEqual("key");
        done();
      }, null, [{
        key: "key",
        value: LZString.compressToBase64(JSON.stringify(dummyValue)),
        targetId: "targetId",
      }]);
    });
    it("should catch error", (done) => {
      const dummyValue: any = {
        hello: "firebase",
        firebase: "database",
      };
      const _: FirebaseDatabasePlugin = new FirebaseDatabasePlugin("id", null);
      const query: any = {
        endAt: jest.fn(() => {
          throw new Error("Something happends!");
        }),
      };

      _._set("targetId", query);
      _.query_endAt(null, (error: Error): void => {
        expect(query.endAt.mock.calls.length).toBe(1);
        expect(query.endAt.mock.calls[0][0]).toEqual(dummyValue);
        expect(query.endAt.mock.calls[0][1]).toEqual("key");
        expect(error).toEqual(new Error("Something happends!"));
        done();
      }, [{
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
      const query: any = {
        equalTo: jest.fn((): string => {
          return "query";
        }),
      };
      _._set("targetId", query);

      _.query_equalTo(() => {
        expect(query.equalTo.mock.calls.length).toBe(1);
        expect(query.equalTo.mock.calls[0][0]).toEqual(dummyValue);
        expect(query.equalTo.mock.calls[0][1]).toEqual("key");
        done();
      }, null, [{
        key: "key",
        value: LZString.compressToBase64(JSON.stringify(dummyValue)),
        targetId: "targetId",
      }]);
    });
    it("should catch error", (done) => {
      const dummyValue: any = {
        hello: "firebase",
        firebase: "database",
      };
      const _: FirebaseDatabasePlugin = new FirebaseDatabasePlugin("id", null);
      const query: any = {
        equalTo: jest.fn(() => {
          throw new Error("Something happends!");
        }),
      };

      _._set("targetId", query);
      _.query_equalTo(null, (error: Error): void => {
        expect(query.equalTo.mock.calls.length).toBe(1);
        expect(query.equalTo.mock.calls[0][0]).toEqual(dummyValue);
        expect(query.equalTo.mock.calls[0][1]).toEqual("key");
        expect(error).toEqual(new Error("Something happends!"));
        done();
      }, [{
        key: "key",
        value: LZString.compressToBase64(JSON.stringify(dummyValue)),
        targetId: "targetId",
      }]);
    });
  });

  describe("query_limitToFirst", () => {
    it("should execute limitToFirst() with correct parameters", (done) => {
      const _: FirebaseDatabasePlugin = new FirebaseDatabasePlugin("id", null);
      const query: any = {
        limitToFirst: jest.fn((): string => {
          return "query";
        }),
      };
      _._set("targetId", query);

      _.query_limitToFirst(() => {
        expect(query.limitToFirst.mock.calls.length).toBe(1);
        expect(query.limitToFirst.mock.calls[0][0]).toEqual(3);
        done();
      }, null, [{
        limit: 3,
        targetId: "targetId",
      }]);
    });
    it("should catch error", (done) => {
      const dummyValue: any = {
        hello: "firebase",
        firebase: "database",
      };
      const _: FirebaseDatabasePlugin = new FirebaseDatabasePlugin("id", null);
      const query: any = {
        limitToFirst: jest.fn(() => {
          throw new Error("Something happends!");
        }),
      };

      _._set("targetId", query);
      _.query_limitToFirst(null, (error: Error): void => {
        expect(query.limitToFirst.mock.calls.length).toBe(1);
        expect(query.limitToFirst.mock.calls[0][0]).toEqual(3);
        expect(error).toEqual(new Error("Something happends!"));
        done();
      }, [{
        limit: 3,
        targetId: "targetId",
      }]);
    });
  });

  describe("query_limitToLast", () => {
    it("should execute limitToLast() with correct parameters", (done) => {
      const _: FirebaseDatabasePlugin = new FirebaseDatabasePlugin("id", null);
      const query: any = {
        limitToLast: jest.fn((): string => {
          return "query";
        }),
      };
      _._set("targetId", query);

      _.query_limitToLast(() => {
        expect(query.limitToLast.mock.calls.length).toBe(1);
        expect(query.limitToLast.mock.calls[0][0]).toEqual(3);
        done();
      }, null, [{
        limit: 3,
        targetId: "targetId",
      }]);
    });

    it("should catch error", (done) => {
      const dummyValue: any = {
        hello: "firebase",
        firebase: "database",
      };
      const _: FirebaseDatabasePlugin = new FirebaseDatabasePlugin("id", null);
      const query: any = {
        limitToLast: jest.fn(() => {
          throw new Error("Something happends!");
        }),
      };

      _._set("targetId", query);
      _.query_limitToLast(null, (error: Error): void => {
        expect(query.limitToLast.mock.calls.length).toBe(1);
        expect(query.limitToLast.mock.calls[0][0]).toEqual(3);
        expect(error).toEqual(new Error("Something happends!"));
        done();
      }, [{
        limit: 3,
        targetId: "targetId",
      }]);
    });
  });

  describe("query_off", () => {
    it("should execute off() with correct parameters", (done) => {
      const _: FirebaseDatabasePlugin = new FirebaseDatabasePlugin("id", null);
      const query: any = {
        off: jest.fn((): string => {
          return "query";
        }),
      };
      _._set("targetId", query);

      const listener1 = () => { return; };
      const listener2 = () => { return; };
      const listener3 = () => { return; };
      _._set("listener1", listener1);
      _._set("listener2", listener2);
      _._set("listener3", listener3);

      _.query_off(() => {
        expect(query.off.mock.calls.length).toBe(3);
        expect(query.off.mock.calls[0][0]).toEqual("value");
        expect(query.off.mock.calls[0][1]).toEqual(listener1);
        expect(query.off.mock.calls[1][1]).toEqual(listener2);
        expect(query.off.mock.calls[2][1]).toEqual(listener3);
        done();
      }, null, [{
        eventType: "value",
        listenerIdSet: ["listener1", "listener2", "listener3",],
        targetId: "targetId",
      }]);
    });
    it("should catch error", (done) => {
      const _: FirebaseDatabasePlugin = new FirebaseDatabasePlugin("id", null);
      const query: any = {
        off: jest.fn(() => {
          throw new Error("Something happends!");
        }),
      };

      const listener1 = () => { return; };
      _._set("listener1", listener1);

      _._set("targetId", query);
      _.query_off(null, (error: Error): void => {
        expect(query.off.mock.calls.length).toBe(1);
        expect(query.off.mock.calls[0][0]).toEqual("value");
        expect(error).toEqual(new Error("Something happends!"));
        done();
      }, [{
        eventType: "value",
        listenerIdSet: ["listener1",],
        targetId: "targetId",
      }]);
    });
  });

  describe("query_on", () => {

    it("should execute on() with correct parameters", (done) => {
      const _: FirebaseDatabasePlugin = new FirebaseDatabasePlugin("id", null);
      const ref: any = {
        on: jest.fn((eventType, callback) => {
          const dummyValue = {
            hello: "world",
          };
          callback({
            exists: () => { return true; },
            exportVal: () => { return dummyValue; },
            getPriority: () => { return "normal"; },
            key: "somewhere",
            numChildren: () => { return 0; },
            val: () => { return dummyValue; },
          }, "prevChildKey");
        }),
      };
      _._set("targetId", ref);

      _.query_on(() => {
        expect(ref.on.mock.calls.length).toBe(1);
        expect(ref.on.mock.calls[0][0]).toEqual("value");
        expect(_nativeCallback).toHaveBeenCalled();
        expect(_nativeCallback.mock.calls[0][0]).toBe("id");
        expect(_nativeCallback.mock.calls[0][1]).toBe("listenerId");
        expect(_nativeCallback.mock.calls[0][2]).toBe("value");
        const snapshotStr = LZString.decompressFromBase64(_nativeCallback.mock.calls[0][3][0]);
        const snapshot = JSON.parse(snapshotStr);
        expect(snapshot.exists).toBe(true);
        expect(JSON.parse(LZString.decompressFromBase64(snapshot.exportVal))).toEqual({
          hello: "world",
        });
        expect(snapshot.getPriority).toBe("normal");
        expect(snapshot.key).toBe("somewhere");
        expect(snapshot.numChildren).toBe(0);
        expect(JSON.parse(LZString.decompressFromBase64(snapshot.val))).toEqual({
          hello: "world",
        });
        expect(_nativeCallback.mock.calls[0][3][1]).toBe("prevChildKey");
        done();
      }, null, [{
        eventType: "value",
        targetId: "targetId",
        listenerId: "listenerId",
      }]);
    });
    it("should catch error", (done) => {
      const _: FirebaseDatabasePlugin = new FirebaseDatabasePlugin("id", null);
      const query: any = {
        on: jest.fn((eventType, callback) => {
          throw new Error("Something happends!");
        }),
      };

      const listener1 = () => { return; };
      _._set("listener1", listener1);

      _._set("targetId", query);
      _.query_on(null, (error: Error): void => {
        expect(query.on.mock.calls.length).toBe(1);
        expect(query.on.mock.calls[0][0]).toEqual("value");
        expect(error).toEqual(new Error("Something happends!"));
        done();
      }, [{
        eventType: "value",
        listenerId: "listenerId",
        targetId: "targetId",
      }]);
    });
  });

  describe("query_once", () => {
    it("should involve native side with correct parameters", (done) => {
      const _: FirebaseDatabasePlugin = new FirebaseDatabasePlugin("id", null);
      const ref: any = {
        once: jest.fn((eventType, callback) => {
          const dummyValue = {
            hello: "world",
          };
          callback({
            exists: () => { return true; },
            exportVal: () => { return dummyValue; },
            getPriority: () => { return "normal"; },
            key: "somewhere",
            numChildren: () => { return 0; },
            val: () => { return dummyValue; },
          }, "prevChildKey");
        }),
      };
      _._set("targetId", ref);

      _.query_once(() => {
        expect(ref.once.mock.calls.length).toBe(1);
        expect(ref.once.mock.calls[0][0]).toEqual("value");
        expect(_nativeCallback).toHaveBeenCalled();
        expect(_nativeCallback.mock.calls[0][0]).toBe("id");
        expect(_nativeCallback.mock.calls[0][1]).toBe("listenerId");
        expect(_nativeCallback.mock.calls[0][2]).toBe("value");
        const snapshotStr = LZString.decompressFromBase64(_nativeCallback.mock.calls[0][3][0]);
        const snapshot = JSON.parse(snapshotStr);
        expect(snapshot.exists).toBe(true);
        expect(JSON.parse(LZString.decompressFromBase64(snapshot.exportVal))).toEqual({
          hello: "world",
        });
        expect(snapshot.getPriority).toBe("normal");
        expect(snapshot.key).toBe("somewhere");
        expect(snapshot.numChildren).toBe(0);
        expect(JSON.parse(LZString.decompressFromBase64(snapshot.val))).toEqual({
          hello: "world",
        });
        expect(_nativeCallback.mock.calls[0][3][1]).toBe("prevChildKey");
        done();
        done();
      }, null, [{
        eventType: "value",
        listenerId: "listenerId",
        targetId: "targetId",
      }]);
    });
    it("should catch error", (done) => {
      const _: FirebaseDatabasePlugin = new FirebaseDatabasePlugin("id", null);
      const query: any = {
        once: jest.fn(() => {
          throw new Error("Something happends!");
        }),
      };

      const listener1 = () => { return; };
      _._set("listener1", listener1);

      _._set("targetId", query);
      _.query_once(null, (error: Error): void => {
        expect(query.once.mock.calls.length).toBe(1);
        expect(query.once.mock.calls[0][0]).toEqual("value");
        expect(error).toEqual(new Error("Something happends!"));
        done();
      }, [{
        eventType: "value",
        listenerId: "listenerId",
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
      const query: any = {
        orderByChild: jest.fn((): string => {
          return "query";
        }),
      };
      _._set("targetId", query);

      _.query_orderByChild(() => {
        expect(query.orderByChild.mock.calls.length).toBe(1);
        expect(query.orderByChild.mock.calls[0][0]).toEqual("path");
        done();
      }, null, [{
        targetId: "targetId",
        path: "path",
        queryId: "queryId",
      }]);
    });
    it("should catch error", (done) => {
      const _: FirebaseDatabasePlugin = new FirebaseDatabasePlugin("id", null);
      const query: any = {
        orderByChild: jest.fn(() => {
          throw new Error("Something happends!");
        }),
      };

      _._set("targetId", query);
      _.query_orderByChild(null, (error: Error): void => {
        expect(query.orderByChild.mock.calls.length).toBe(1);
        expect(query.orderByChild.mock.calls[0][0]).toEqual("path");
        expect(error).toEqual(new Error("Something happends!"));
        done();
      }, [{
        targetId: "targetId",
        path: "path",
        queryId: "queryId",
      }]);
    });
  });

  describe("query_orderByKey", () => {
    it("should execute orderByKey() with correct parameters", (done) => {
      const _: FirebaseDatabasePlugin = new FirebaseDatabasePlugin("id", null);
      const query: any = {
        orderByKey: jest.fn((): string => {
          return "query";
        }),
      };
      _._set("targetId", query);

      _.query_orderByKey(() => {
        expect(query.orderByKey.mock.calls.length).toBe(1);
        done();
      }, null, [{
        targetId: "targetId",
        queryId: "queryId",
      }]);
    });
    it("should catch error", (done) => {
      const _: FirebaseDatabasePlugin = new FirebaseDatabasePlugin("id", null);
      const query: any = {
        orderByKey: jest.fn(() => {
          throw new Error("Something happends!");
        }),
      };

      _._set("targetId", query);
      _.query_orderByKey(null, (error: Error): void => {
        expect(query.orderByKey.mock.calls.length).toBe(1);
        expect(error).toEqual(new Error("Something happends!"));
        done();
      }, [{
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
    it("should catch error", (done) => {
      const _: FirebaseDatabasePlugin = new FirebaseDatabasePlugin("id", null);
      const query: any = {
        orderByPriority: jest.fn(() => {
          throw new Error("Something happends!");
        }),
      };

      _._set("targetId", query);
      _.query_orderByPriority(null, (error: Error): void => {
        expect(query.orderByPriority.mock.calls.length).toBe(1);
        expect(error).toEqual(new Error("Something happends!"));
        done();
      }, [{
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
    it("should catch error", (done) => {
      const _: FirebaseDatabasePlugin = new FirebaseDatabasePlugin("id", null);
      const query: any = {
        orderByValue: jest.fn(() => {
          throw new Error("Something happends!");
        }),
      };

      _._set("targetId", query);
      _.query_orderByValue(null, (error: Error): void => {
        expect(query.orderByValue.mock.calls.length).toBe(1);
        expect(error).toEqual(new Error("Something happends!"));
        done();
      }, [{
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
      const query: any = {
        startAt: jest.fn((): string => {
          return "query";
        }),
      };
      _._set("targetId", query);

      _.query_startAt(() => {
        expect(query.startAt.mock.calls.length).toBe(1);
        expect(query.startAt.mock.calls[0][0]).toEqual(dummyValue);
        done();
      }, null, [{
        queryId: "queryId",
        targetId: "targetId",
        value: LZString.compressToBase64(JSON.stringify(dummyValue)),
      }]);
    });
    it("should catch error", (done) => {
      const dummyValue: any = {
        hello: "firebase",
      };
      const _: FirebaseDatabasePlugin = new FirebaseDatabasePlugin("id", null);
      const query: any = {
        startAt: jest.fn(() => {
          throw new Error("Something happends!");
        }),
      };

      _._set("targetId", query);
      _.query_startAt(null, (error: Error): void => {
        expect(query.startAt.mock.calls.length).toBe(1);
        expect(query.startAt.mock.calls[0][0]).toEqual(dummyValue);
        expect(error).toEqual(new Error("Something happends!"));
        done();
      }, [{
        queryId: "queryId",
        targetId: "targetId",
        value: LZString.compressToBase64(JSON.stringify(dummyValue)),
      }]);
    });
  });

});
