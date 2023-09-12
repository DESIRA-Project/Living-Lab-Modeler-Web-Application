import { ActivatedItem } from "./activated-item";
import { UserFunctionContentComponent } from "./user-function-content.component";
import { UserFunctionListComponent } from "./user-function-list.component";
import {DynamicContentParent} from "../DynamicModal/dynamic-content-parent";

export interface UserListManager extends ActivatedItem, DynamicContentParent{
    setFunctionList(u:UserFunctionListComponent):void;
    setFunctionContentComponent(c:UserFunctionContentComponent):void;
}
