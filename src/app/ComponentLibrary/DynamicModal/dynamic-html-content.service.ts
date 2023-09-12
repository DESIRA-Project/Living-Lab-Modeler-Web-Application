export interface DynamicHTMLContentService{
    setRootViewContainerRef(viewContainerRef: any):void;
    addDynamicComponent():void;
    getDynamicComponent():any;
}