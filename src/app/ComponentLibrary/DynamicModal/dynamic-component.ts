export interface DynamicComponent{
    open():void;
    attachToElement(el:HTMLElement):void;
    close():void;
}