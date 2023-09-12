import { Observable } from "rxjs";

export interface InjectablePlugin{
    isInitialized():Observable<boolean>;
    injectPluginScript():void;
    isInjected():Observable<boolean>;
    removePluginScript():void;

}