import { App } from "cordova-firebase-core/index";
import { Database } from "../Database";
import { Query, Reference } from "../DataClasses";
import { INativeEventParams } from "../INativeEventParams";
import { exec } from "../__mocks__/cordova";
import { execCmd } from "../__mocks__/CommandQueue";

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
  });
});
