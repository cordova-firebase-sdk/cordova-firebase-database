import { PluginBase } from "cordova-firebase-core/index";
/**
 * Parameters for execCmd function
 */
export interface IExecCmdParams {
    /**
     * Plugin's context
     */
    context: PluginBase;
    /**
     * Plugin's name in native side.
     * If omit this, context.id is used.
     */
    pluginName?: string;
    /**
     * Execute method name
     */
    methodName: string;
    /**
     * parameters for native side
     */
    args?: Array<any>;
    /**
     * synchronize options
     */
    execOptions?: {
        sync?: boolean;
        remove?: boolean;
    };
    [key: string]: any;
}
export declare const execCmd: (params: IExecCmdParams) => Promise<any>;
