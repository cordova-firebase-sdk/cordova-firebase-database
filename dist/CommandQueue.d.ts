import { PluginBase } from "cordova-firebase-core/index";
/**
 * Parameters for execCmd function
 */
export interface IExecCmdParams {
    /**
     * parameters for native side
     */
    args?: Array<any>;
    /**
     * Plugin's context
     */
    context: PluginBase;
    /**
     * Plugin's name in native side.
     */
    pluginName: string;
    /**
     * Execute method name
     */
    methodName: string;
    /**
     * synchronize options
     */
    execOptions?: {
        sync?: boolean;
        remove?: boolean;
    };
}
export declare const execCmd: (params: IExecCmdParams) => Promise<any>;
