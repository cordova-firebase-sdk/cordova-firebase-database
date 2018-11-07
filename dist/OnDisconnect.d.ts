import { PluginBase } from "cordova-firebase-core/index";
export declare class OnDisconnect extends PluginBase {
    private _queue;
    private _pluginName;
    constructor(pluginName: string);
    readonly pluginName: string;
    /**
     * Internal use only. Don't execute this method.
     * @hidden
     */
    _privateInit(): void;
    cancel(onComplete?: (error?: any) => void): Promise<void>;
    remove(onComplete?: (error?: any) => void): Promise<void>;
    set(value: any, onComplete?: (error?: any) => void): Promise<void>;
    setWithPriority(value: any, property: string | number, onComplete?: (error?: any) => void): Promise<void>;
    update(values: any, onComplete?: (error?: any) => void): Promise<void>;
    private exec;
}
