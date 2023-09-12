import { ViewContainerRef } from "@angular/core";
//import { DynamicContentService } from "./dynamic-content.service";
import { DynamicHTMLContentService } from "./dynamic-html-content.service";
import { DynamicItem } from "./dynamic-item.components";

export interface ModalController{
    openModal():void;
    onModalClose(): Function;
    setContent(content: DynamicItem):void;
  //  getContentService():DynamicContentService;
    setDynamicHTMLContentService(serv:DynamicHTMLContentService):void;
    getDynamicHTMLContentService():DynamicHTMLContentService;
    notifyUser(success:boolean, message:string):void;
    loadData():void;
/*    addView(view:ViewContainerRef):void;
    getView():ViewContainerRef;
*/
}