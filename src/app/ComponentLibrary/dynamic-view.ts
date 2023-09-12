import { ParentComponent } from "../User/Admin/LivingLabEntityManagement/parent-component";

export interface DynamicView{
    initialize(parent:ParentComponent):void;
}