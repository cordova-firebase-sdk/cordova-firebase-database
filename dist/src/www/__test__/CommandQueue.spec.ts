import { execCmd, IExecCmdParams } from "../CommandQueue";
import { PluginBase } from "cordova-firebase-core/index";

describe("[commandQueue]", () => {

  class MockClass extends PluginBase {

    constructor() {
      super("mock_plugin");
      this._isReady = true;
    }

    public hoge(request): Promise<any> {
      const params: IExecCmdParams = {
        args: [
          request,
        ],
        context: this,
        methodName: "newInstance",
        pluginName: "mock_plugin",
      };

      return execCmd(params);
    }
  }

  it("should return the same number as request", () => {

    const instance: MockClass = new MockClass();
    const request: number = 1;
    expect(instance.hoge(request)).resolves.toEqual([request]);

  });
  it("should return the same array as request", (done) => {

    const instance: MockClass = new MockClass();
    const tasks: Array<any> = [];
    const answer: Array<any> = [];
    for (let i = 0; i < 20; i++) {
      answer.push([`request-${i}`]);
      tasks.push(instance.hoge(`request-${i}`));
    }
    Promise.all(tasks).then((results: string[]) => {
      expect(results).toEqual(answer);
      done();
    });
  });

});
