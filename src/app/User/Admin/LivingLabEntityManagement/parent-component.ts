import { DirtyView } from "src/app/Models/DirtyView";
import { ObjectOfInterest } from "src/app/Models/ObjectOfInterest";
import { DataContainer } from "../../ll-update/data-container";
import { ChildComponent } from "./child-component";

export interface ParentComponent{
    setComponent(c:ChildComponent):void;
    getSharedData():any;
    isDirty():boolean;
    storeValue(key:string, value:any):void;
    clearValue(key:string):void;
    setChangeAwareChild(v:DirtyView):void;
    setObjectOfInterest(o:ObjectOfInterest):void;
    getSharedDataContainer():DataContainer;

}