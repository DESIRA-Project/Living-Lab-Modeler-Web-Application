import { BreadcrumbComponent } from "./breadcrumb.component";

export interface BreadcrumbController{
    setLabel(label:string):void;
    setBreadcrumb(inst:BreadcrumbComponent):void;
}