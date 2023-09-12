import { BackendService } from "../backend.service";
import { ValueContainerComponent } from "./value-container-component";

export interface SingleValueContainerComponent extends ValueContainerComponent{
     toggleValue():void;
     setValue():void;
     getType():string;
     updateValue():void;     
     isEmpty():boolean;
     isValidValue():boolean;
     getErrorMessage():string;
     isReady():boolean;
}