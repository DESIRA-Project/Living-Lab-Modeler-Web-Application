import { DynamicItem } from "./dynamic-item.components";
import { DynamicModalContainer } from "./dynamic-modal-container";
import {DynamicContentParent} from "./dynamic-content-parent";

export interface DynamicContent{
    data:any;
    initialize(parent:DynamicModalContainer):void;
    getUserToken():string|null;
    initializeWithAuthData(userToken:string):void;
    setDependencies(dependencies:DynamicItem[]):void;
    setParent(parent: DynamicContentParent | undefined):void;
    isDirty?(): boolean;
}
