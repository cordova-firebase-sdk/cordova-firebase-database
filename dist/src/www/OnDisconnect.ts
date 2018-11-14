import { BaseArrayClass, LZString, PluginBase } from "cordova-firebase-core/index";
import { execCmd, IExecCmdParams } from "./CommandQueue";

export class OnDisconnect extends PluginBase {

  private _queue: BaseArrayClass = new BaseArrayClass();

  private _pluginName: string;

  constructor(pluginName: string) {
    super("OnDisconnect");




    this._pluginName = pluginName;

    this._queue._on("insert_at", (): void => {
      if (!this._isReady) {
        return;
      }
      if (this._queue._getLength() > 0) {
        const cmd: any = this._queue._removeAt(0, true);
        if (cmd && cmd.context && cmd.methodName) {
          execCmd(cmd).then(cmd.resolve).catch(cmd.reject);
        }
      }
      if (this._queue._getLength() > 0) {
        this._queue._trigger("insert_at");
      }
    });

  }

  public get pluginName(): string {
    return this._pluginName;
  }

  /**
   * Internal use only. Don't execute this method.
   * @hidden
   */
  public _privateInit(): void {
    if (!this._isReady) {
      this._isReady = true;
      this._queue._trigger("insert_at");
    }
  }

  public cancel(onComplete?: (error?: any) => void): Promise<void> {

    return new Promise((resolve: () => void, reject: (error: any) => void): void => {
      this.exec({
        args: [{
          targetId: this.id,
        }],
        context: this,
        methodName: "onDisconnect_cancel",
        pluginName: this.pluginName,
      })
      .then((): void => {
        resolve();
        if (typeof onComplete === "function") {
          onComplete();
        }
      })
      .catch((error: any) => {
        reject(error);
        if (typeof onComplete === "function") {
          onComplete(error);
        }
      });
    });
  }

  public remove(onComplete?: (error?: any) => void): Promise<void> {

    return new Promise((resolve: () => void, reject: (error: any) => void): void => {
      this.exec({
        args: [{
          targetId: this.id,
        }],
        context: this,
        methodName: "onDisconnect_remove",
        pluginName: this.pluginName,
      })
      .then((): void => {
        resolve();
        if (typeof onComplete === "function") {
          onComplete();
        }
      })
      .catch((error: any) => {
        reject(error);
        if (typeof onComplete === "function") {
          onComplete(error);
        }
      });
    });
  }

  public set(value: any, onComplete?: (error?: any) => void): Promise<void> {

    return new Promise((resolve: () => void, reject: (error: any) => void): void => {
      this.exec({
        args: [{
          targetId: this.id,
          value: LZString.compressToBase64(JSON.stringify(value)),
        }],
        context: this,
        methodName: "onDisconnect_set",
        pluginName: this.pluginName,
      })
      .then((): void => {
        resolve();
        if (typeof onComplete === "function") {
          onComplete();
        }
      })
      .catch((error: any) => {
        reject(error);
        if (typeof onComplete === "function") {
          onComplete(error);
        }
      });
    });
  }

  public setWithPriority(value: any, property: string | number, onComplete?: (error?: any) => void): Promise<void> {

    return new Promise((resolve: () => void, reject: (error: any) => void): void => {
      this.exec({
        args: [{
          priority: LZString.compressToBase64(JSON.stringify(property)),
          targetId: this.id,
          value: LZString.compressToBase64(JSON.stringify(value)),
        }],
        context: this,
        methodName: "onDisconnect_setWithPriority",
        pluginName: this.pluginName,
      })
      .then((): void => {
        resolve();
        if (typeof onComplete === "function") {
          onComplete();
        }
      })
      .catch((error: any) => {
        reject(error);
        if (typeof onComplete === "function") {
          onComplete(error);
        }
      });
    });
  }

  public update(values: any, onComplete?: (error?: any) => void): Promise<void> {

    if (!values || typeof values !== "object" || Array.isArray(values)) {
      throw new Error("values must be key-value object");
    }

    return new Promise((resolve: () => void, reject: (error: any) => void): void => {
      this.exec({
        args: [{
          targetId: this.id,
          values: LZString.compressToBase64(JSON.stringify(values)),
        }],
        context: this,
        methodName: "onDisconnect_update",
        pluginName: this.pluginName,
      })
      .then((): void => {
        resolve();
        if (typeof onComplete === "function") {
          onComplete.call(this);
        }
      })
      .catch((error: any): void => {
        reject(error);
        if (typeof onComplete === "function") {
          onComplete.call(this, error);
        }
      });
    });
  }

  private exec(params: IExecCmdParams): Promise<any> {
    return new Promise((resolve: (result: any) => void, reject: (error: any) => void) => {
      this._queue._push({
        args: params.args,
        context: params.context,
        execOptions: params.execOptions,
        methodName: params.methodName,
        pluginName: params.pluginName,
        reject,
        resolve,
      });
    });
  }

}
