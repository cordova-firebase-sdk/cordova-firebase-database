import { PluginBase } from "cordova-firebase-core/index";
import { IExecCmdParams } from "../CommandQueue";
import { execCmd } from "../__mocks__/CommandQueue";

describe("[commandQueue]", () => {

  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods:
    execCmd.mockClear();
  });

  class MockClass extends PluginBase {

    private _pluginName: string;

    constructor(pluginName: string) {
      super(pluginName);
      this._isReady = true;
      this._pluginName = pluginName;
    }

    public hoge(request): Promise<any> {
      const params: IExecCmdParams = {
        args: [
          request,
        ],
        context: this,
        methodName: "newInstance",
        pluginName: this._pluginName,
      };

      return execCmd(params);
    }
  }

  it("should return the same number as request", (done) => {

    const instance: MockClass = new MockClass("mock_plugin");
    const request: number = 1;
    instance.hoge(request).then(() => {
      expect(execCmd).toHaveBeenCalled();
      const params: any = execCmd.mock.calls[0][0];
      expect(params.pluginName).toBe("mock_plugin");
      expect(params.methodName).toBe("newInstance");
      expect(params.args).toEqual([1]);
      done();
    });

  });
  it("should keep the execution order as requested", (done) => {

    const instanceA: MockClass = new MockClass("A");
    const instanceB: MockClass = new MockClass("B");
    const instanceC: MockClass = new MockClass("C");
    const tasks: Array<Promise<any>> = [];
    tasks.push(instanceA.hoge("aaa"));
    tasks.push(instanceB.hoge("bbb"));
    tasks.push(instanceC.hoge("ccc"));
    tasks.push(instanceB.hoge("bbb"));
    tasks.push(instanceA.hoge("aaa"));
    tasks.push(instanceC.hoge("ccc"));

    Promise.all(tasks).then((results: Array<string>) => {
      expect(execCmd).toHaveBeenCalledTimes(6);
      expect(execCmd.mock.calls[0][0].args[0]).toBe("aaa");
      expect(execCmd.mock.calls[1][0].args[0]).toBe("bbb");
      expect(execCmd.mock.calls[2][0].args[0]).toBe("ccc");
      expect(execCmd.mock.calls[3][0].args[0]).toBe("bbb");
      expect(execCmd.mock.calls[4][0].args[0]).toBe("aaa");
      expect(execCmd.mock.calls[5][0].args[0]).toBe("ccc");
      expect(execCmd.mock.calls[0][0].pluginName).toBe("A");
      expect(execCmd.mock.calls[1][0].pluginName).toBe("B");
      expect(execCmd.mock.calls[2][0].pluginName).toBe("C");
      expect(execCmd.mock.calls[3][0].pluginName).toBe("B");
      expect(execCmd.mock.calls[4][0].pluginName).toBe("A");
      expect(execCmd.mock.calls[5][0].pluginName).toBe("C");
      done();
    });
  });

});
