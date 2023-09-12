import { Component, Input } from "@angular/core";

@Component({
    selector: 'string-attribute',
    templateUrl: './string-attribute.component.html',
//    styleUrls: ['../style/.css'],
    providers: []
})

export class StringAttribute{
    _data:any = null;
    _p:any = null;
    _content:string = "";

    @Input()
    public set data(d: any) {
      this._data = d;
    }

    @Input()
    public set parent(p: any) {
      this._p = p;
      this._p.addChild(this);
    }


    getValue():string{
        return this._content;
     }
 
     getAttribute():string{
        if(this._data === null) return "";
        return this._data.attributeName;
     }
 
}