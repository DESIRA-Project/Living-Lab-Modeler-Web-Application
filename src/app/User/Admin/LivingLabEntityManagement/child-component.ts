import { DirtyView } from "src/app/Models/DirtyView";

export interface ChildComponent extends DirtyView{
    setDisability(isDisabled:boolean):void;
}