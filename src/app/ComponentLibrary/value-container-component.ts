import { Input, InputDecorator } from "@angular/core";

export interface ValueContainerComponent{
    getValue():any;
    valueHasChanged():boolean;
    save():void;
    reset():void;
}