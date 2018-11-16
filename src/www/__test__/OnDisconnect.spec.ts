import { LZString } from "cordova-firebase-core/index";
import { OnDisconnect } from "../OnDisconnect";
import { execCmd } from "../__mocks__/CommandQueue";

describe("[OnDisconnect]", () => {
  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods:
    execCmd.mockClear();
  });

  describe("internal tests", () => {
    it("should have correct properties.", () => {
      const _: OnDisconnect = new OnDisconnect("pluginName");
      expect(_.id.includes("_OnDisconnect")).toBe(true);
      expect(_.pluginName).toEqual("pluginName");
    });

    it("methods should work even if native side is not ready.", (done) => {
      const _: OnDisconnect = new OnDisconnect("dummyPluginName");

      const args1 = [{
        targetId: _.id,
        value: LZString.compressToBase64(JSON.stringify("test")),
      }];
      const args2 = [{
        targetId: _.id,
      }];

      _.set("test").then(() => {
        expect(_.id.includes("_OnDisconnect")).toBe(true);
        const params: any = execCmd.mock.calls[0][0];
        expect(params.methodName).toEqual("onDisconnect_set");
        expect(params.args).toEqual(args1);
      });
      _.cancel().then(() => {
        expect(_.id.includes("_OnDisconnect")).toBe(true);
        const params: any = execCmd.mock.calls[1][0];
        expect(params.pluginName).toEqual("dummyPluginName");
        expect(params.methodName).toEqual("onDisconnect_cancel");
        expect(params.args).toEqual(args2);
        done();
      });

      setTimeout(() => {
        _._privateInit();
      }, 10);
    });
  });

  describe("cancel()", () => {
    it("should involve native code with correct parameters.", (done) => {
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
      });
    });

    it("should work with onComplete.", (done) => {
      const _: OnDisconnect = new OnDisconnect("dummyPluginName");
      _._privateInit();

      const args = [{
        targetId: _.id,
      }];

      _.cancel(() => {
        expect(_.id.includes("_OnDisconnect")).toBe(true);
        const params: any = execCmd.mock.calls[0][0];
        expect(params.pluginName).toEqual("dummyPluginName");
        expect(params.methodName).toEqual("onDisconnect_cancel");
        expect(params.args).toEqual(args);
        done();
      });
    });

    it("should catch error of native side.", (done) => {
      execCmd.mockImplementationOnce((params: any): Promise<any> => {
        return Promise.reject(new Error("Error!"));
      });
      const _: OnDisconnect = new OnDisconnect("dummyPluginName");
      _._privateInit();

      const args = [{
        targetId: _.id,
      }];

      _.cancel().catch((error: Error): void => {
        expect(_.id.includes("_OnDisconnect")).toBe(true);
        const params: any = execCmd.mock.calls[0][0];
        expect(params.pluginName).toEqual("dummyPluginName");
        expect(params.methodName).toEqual("onDisconnect_cancel");
        expect(error).toEqual(new Error("Error!"));
        done();
      });
    });

    it("should catch error of native side with onComplete.", (done) => {
      execCmd.mockImplementationOnce((params: any): Promise<any> => {
        return Promise.reject(new Error("Error!"));
      });
      const _: OnDisconnect = new OnDisconnect("dummyPluginName");
      _._privateInit();

      const args = [{
        targetId: _.id,
      }];

      try {
      _.cancel((error: Error): void => {
        expect(_.id.includes("_OnDisconnect")).toBe(true);
        const params: any = execCmd.mock.calls[0][0];
        expect(params.pluginName).toEqual("dummyPluginName");
        expect(params.methodName).toEqual("onDisconnect_cancel");
        expect(error).toEqual(new Error("Error!"));
        done();
      });
      } catch(e) {
        console.error(e);
      }
    });
  });

  describe("remove()", () => {
    it("should involve native code with correct parameters.", (done) => {
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
      });
    });
    it("should work with onComplete.", (done) => {
      const _: OnDisconnect = new OnDisconnect("dummyPluginName");
      _._privateInit();

      const args = [{
        targetId: _.id,
      }];

      _.remove(() => {
        expect(_.id.includes("_OnDisconnect")).toBe(true);
        const params: any = execCmd.mock.calls[0][0];
        expect(params.pluginName).toEqual("dummyPluginName");
        expect(params.methodName).toEqual("onDisconnect_remove");
        expect(params.args).toEqual(args);
        done();
      });
    });

    it("should catch error of native side.", (done) => {
      execCmd.mockImplementationOnce((params: any): Promise<any> => {
        return Promise.reject(new Error("Error!"));
      });
      const _: OnDisconnect = new OnDisconnect("dummyPluginName");
      _._privateInit();

      const args = [{
        targetId: _.id,
      }];

      _.remove().catch((error: Error): void => {
        expect(_.id.includes("_OnDisconnect")).toBe(true);
        const params: any = execCmd.mock.calls[0][0];
        expect(params.pluginName).toEqual("dummyPluginName");
        expect(params.methodName).toEqual("onDisconnect_remove");
        expect(error).toEqual(new Error("Error!"));
        done();
      });
    });

    it("should catch error of native side with onComplete.", (done) => {
      execCmd.mockImplementationOnce((params: any): Promise<any> => {
        return Promise.reject(new Error("Error!"));
      });
      const _: OnDisconnect = new OnDisconnect("dummyPluginName");
      _._privateInit();

      const args = [{
        targetId: _.id,
      }];

      _.remove((error: Error): void => {
        expect(_.id.includes("_OnDisconnect")).toBe(true);
        const params: any = execCmd.mock.calls[0][0];
        expect(params.pluginName).toEqual("dummyPluginName");
        expect(params.methodName).toEqual("onDisconnect_remove");
        expect(error).toEqual(new Error("Error!"));
        done();
      });
    });
  });

  describe("set()", () => {
    it("should involve native code with correct parameters.", (done) => {
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
      });
    });
    it("should work with onComplete.", (done) => {
      const _: OnDisconnect = new OnDisconnect("dummyPluginName");
      _._privateInit();

      const value: string = "hello world";

      const args = [{
        targetId: _.id,
        value: LZString.compressToBase64(JSON.stringify(value)),
      }];

      _.set(value, () => {
        expect(_.id.includes("_OnDisconnect")).toBe(true);
        const params: any = execCmd.mock.calls[0][0];
        expect(params.pluginName).toEqual("dummyPluginName");
        expect(params.methodName).toEqual("onDisconnect_set");
        expect(params.args).toEqual(args);
        done();
      });
    });

    it("should catch error of native side.", (done) => {
      execCmd.mockImplementationOnce((params: any): Promise<any> => {
        return Promise.reject(new Error("Error!"));
      });
      const _: OnDisconnect = new OnDisconnect("dummyPluginName");
      _._privateInit();

      const value: string = "hello world";

      const args = [{
        targetId: _.id,
        value: LZString.compressToBase64(JSON.stringify(value)),
      }];

      _.set(value).catch((error: Error): void => {
        expect(_.id.includes("_OnDisconnect")).toBe(true);
        const params: any = execCmd.mock.calls[0][0];
        expect(params.pluginName).toEqual("dummyPluginName");
        expect(params.methodName).toEqual("onDisconnect_set");
        expect(error).toEqual(new Error("Error!"));
        done();
      });
    });

    it("should catch error of native side with onComplete.", (done) => {
      execCmd.mockImplementationOnce((params: any): Promise<any> => {
        return Promise.reject(new Error("Error!"));
      });
      const _: OnDisconnect = new OnDisconnect("dummyPluginName");
      _._privateInit();

      const value: string = "hello world";

      const args = [{
        targetId: _.id,
        value: LZString.compressToBase64(JSON.stringify(value)),
      }];

      _.set(value, (error: Error): void => {
        expect(_.id.includes("_OnDisconnect")).toBe(true);
        const params: any = execCmd.mock.calls[0][0];
        expect(params.pluginName).toEqual("dummyPluginName");
        expect(params.methodName).toEqual("onDisconnect_set");
        expect(error).toEqual(new Error("Error!"));
        done();
      });
    });
  });

  describe("setWithPriority()", () => {
    it("should involve native code with correct parameters.", (done) => {
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
      });
    });
    it("should work with onComplete.", (done) => {
      const _: OnDisconnect = new OnDisconnect("dummyPluginName");
      _._privateInit();

      const value: string = "hello world";
      const priority: string = "normal";

      const args = [{
        targetId: _.id,
        priority: LZString.compressToBase64(JSON.stringify(priority)),
        value: LZString.compressToBase64(JSON.stringify(value)),
      }];

      _.setWithPriority(value, priority, () => {
        expect(_.id.includes("_OnDisconnect")).toBe(true);
        const params: any = execCmd.mock.calls[0][0];
        expect(params.pluginName).toEqual("dummyPluginName");
        expect(params.methodName).toEqual("onDisconnect_setWithPriority");
        expect(params.args).toEqual(args);
        done();
      });
    });

    it("should catch error of native side.", (done) => {
      execCmd.mockImplementationOnce((params: any): Promise<any> => {
        return Promise.reject(new Error("Error!"));
      });
      const _: OnDisconnect = new OnDisconnect("dummyPluginName");
      _._privateInit();

      const value: string = "hello world";
      const priority: string = "normal";

      const args = [{
        targetId: _.id,
        priority: LZString.compressToBase64(JSON.stringify(priority)),
        value: LZString.compressToBase64(JSON.stringify(value)),
      }];

      _.setWithPriority(value, priority).catch((error: Error): void => {
        expect(_.id.includes("_OnDisconnect")).toBe(true);
        const params: any = execCmd.mock.calls[0][0];
        expect(params.pluginName).toEqual("dummyPluginName");
        expect(params.methodName).toEqual("onDisconnect_setWithPriority");
        expect(error).toEqual(new Error("Error!"));
        done();
      });
    });

    it("should catch error of native side with onComplete.", (done) => {
      execCmd.mockImplementationOnce((params: any): Promise<any> => {
        return Promise.reject(new Error("Error!"));
      });
      const _: OnDisconnect = new OnDisconnect("dummyPluginName");
      _._privateInit();

      const value: string = "hello world";
      const priority: string = "normal";

      const args = [{
        targetId: _.id,
        priority: LZString.compressToBase64(JSON.stringify(priority)),
        value: LZString.compressToBase64(JSON.stringify(value)),
      }];

      _.setWithPriority(value, priority, (error: Error): void => {
        expect(_.id.includes("_OnDisconnect")).toBe(true);
        const params: any = execCmd.mock.calls[0][0];
        expect(params.pluginName).toEqual("dummyPluginName");
        expect(params.methodName).toEqual("onDisconnect_setWithPriority");
        expect(error).toEqual(new Error("Error!"));
        done();
      });
    });
  });

  describe("update()", () => {
    it("should involve native code with correct parameters.", (done) => {
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
      });
    });

    it("should work with onComplete.", (done) => {
      const _: OnDisconnect = new OnDisconnect("dummyPluginName");
      _._privateInit();

      const value: object = {
        hello: "world",
      };

      const args = [{
        targetId: _.id,
        values: LZString.compressToBase64(JSON.stringify(value)),
      }];

      _.update(value, () => {
        expect(_.id.includes("_OnDisconnect")).toBe(true);
        const params: any = execCmd.mock.calls[0][0];
        expect(params.pluginName).toEqual("dummyPluginName");
        expect(params.methodName).toEqual("onDisconnect_update");
        expect(params.args).toEqual(args);
        done();
      });
    });

    it("should catch error of native side.", (done) => {
      execCmd.mockImplementationOnce((params: any): Promise<any> => {
        return Promise.reject(new Error("Error!"));
      });
      const _: OnDisconnect = new OnDisconnect("dummyPluginName");
      _._privateInit();

      const value: object = {
        hello: "world",
      };

      const args = [{
        targetId: _.id,
        values: LZString.compressToBase64(JSON.stringify(value)),
      }];

      _.update(value).catch((error: Error): void => {
        expect(_.id.includes("_OnDisconnect")).toBe(true);
        const params: any = execCmd.mock.calls[0][0];
        expect(params.pluginName).toEqual("dummyPluginName");
        expect(params.methodName).toEqual("onDisconnect_update");
        expect(error).toEqual(new Error("Error!"));
        done();
      });
    });

    it("should catch error of native side with onComplete.", (done) => {
      execCmd.mockImplementationOnce((params: any): Promise<any> => {
        return Promise.reject(new Error("Error!"));
      });
      const _: OnDisconnect = new OnDisconnect("dummyPluginName");
      _._privateInit();

      const value: object = {
        hello: "world",
      };

      const args = [{
        targetId: _.id,
        values: LZString.compressToBase64(JSON.stringify(value)),
      }];

      _.update(value, (error: Error): void => {
        expect(_.id.includes("_OnDisconnect")).toBe(true);
        const params: any = execCmd.mock.calls[0][0];
        expect(params.pluginName).toEqual("dummyPluginName");
        expect(params.methodName).toEqual("onDisconnect_update");
        expect(error).toEqual(new Error("Error!"));
        done();
      });
    });
    it("should raise Error if value is not key-value paired object.", () => {
      execCmd.mockImplementationOnce((params: any): Promise<any> => {
        return Promise.reject(new Error("Error!"));
      });
      const _: OnDisconnect = new OnDisconnect("dummyPluginName");
      _._privateInit();

      const value: string = "hello world"

      const args = [{
        targetId: _.id,
        value: LZString.compressToBase64(JSON.stringify(value)),
      }];

      expect(() => {
        _.update(value);
      }).toThrowErrorMatchingSnapshot()
    });
  });
});
