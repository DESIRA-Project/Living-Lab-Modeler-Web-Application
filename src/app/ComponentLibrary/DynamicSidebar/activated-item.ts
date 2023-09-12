import {DynamicContentParent} from "../DynamicModal/dynamic-content-parent";

export interface ActivatedItem{
    setActiveItem(i:number, dynamicContentParent?: DynamicContentParent):void;
    setActiveChild(indices:number[]):void;
}
