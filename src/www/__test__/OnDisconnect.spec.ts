import { LZString } from "cordova-firebase-core/index";
import { OnDisconnect } from "../OnDisconnect";
import { execCmd } from "../__mocks__/CommandQueue";

describe("[OnDisconnect]", () => {
  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods:
    execCmd.mockClear();
  });

  it("should have correct properties.", () => {
    const _: OnDisconnect = new OnDisconnect("pluginName");
    expect(_.id.includes("_OnDisconnect")).toBe(true);
    expect(_.pluginName).toEqual("pluginName");
  });

  it("cancel() should involve native code with correct parameters.", (done) => {
    const _: OnDisconnect = new OnDisconnect("dummyPluginName");
    _._privateInit();

    const args = [{
      targetId: _.id,
    }];

    _.cancel().then(() => {
      expect(_.id.includes("_OnDisconnect")).toBe(true);
      const params: any = execCmd.mock.calls[0][0];
      expect(params.pluginName).toEqual("dummyPluginName");
      expect(params.methodName).toEqual("onDisconnect_cancel");
      expect(params.args).toEqual(args);
      done();
    })
  });

  it("remove() should involve native code with correct parameters.", (done) => {
    const _: OnDisconnect = new OnDisconnect("dummyPluginName");
    _._privateInit();

    const args = [{
      targetId: _.id,
    }];

    _.remove().then(() => {
      expect(_.id.includes("_OnDisconnect")).toBe(true);
      const params: any = execCmd.mock.calls[0][0];
      expect(params.methodName).toEqual("onDisconnect_remove");
      expect(params.args).toEqual(args);
      done();
    })
  });

  it("set() should involve native code with correct parameters.", (done) => {
    const _: OnDisconnect = new OnDisconnect("dummyPluginName");
    _._privateInit();

    const value: string = "hello world";

    const args = [{
      targetId: _.id,
      value: LZString.compressToBase64(JSON.stringify(value)),
    }];

    _.set(value).then(() => {
      expect(_.id.includes("_OnDisconnect")).toBe(true);
      const params: any = execCmd.mock.calls[0][0];
      expect(params.methodName).toEqual("onDisconnect_set");
      expect(params.args).toEqual(args);
      done();
    })
  });

  it("setWithPriority() should involve native code with correct parameters.", (done) => {
    const _: OnDisconnect = new OnDisconnect("dummyPluginName");
    _._privateInit();

    const value: string = "hello world";
    const priority: string = "normal";

    const args = [{
      targetId: _.id,
      priority: LZString.compressToBase64(JSON.stringify(priority)),
      value: LZString.compressToBase64(JSON.stringify(value)),
    }];

    _.setWithPriority(value, priority).then(() => {
      expect(_.id.includes("_OnDisconnect")).toBe(true);
      const params: any = execCmd.mock.calls[0][0];
      expect(params.methodName).toEqual("onDisconnect_setWithPriority");
      expect(params.args).toEqual(args);
      done();
    })
  });

  it("update() should involve native code with correct parameters.", (done) => {
    const _: OnDisconnect = new OnDisconnect("dummyPluginName");
    _._privateInit();

    const value: object = {
      hello: "world",
    };

    const args = [{
      targetId: _.id,
      values: LZString.compressToBase64(JSON.stringify(value)),
    }];

    _.update(value).then(() => {
      expect(_.id.includes("_OnDisconnect")).toBe(true);
      const params: any = execCmd.mock.calls[0][0];
      expect(params.methodName).toEqual("onDisconnect_update");
      expect(params.args).toEqual(args);
      done();
    })
  });
});
