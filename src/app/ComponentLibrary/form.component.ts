import { Component, Input } from "@angular/core";

@Component({
    selector: 'tool-form',
    templateUrl: './form.component.html',
//    styleUrls: ['../style/.css'],
    providers: []
})

export class Form{
    _data:any = null;
    
    @Input()
    public set data(d: any) {
      this._data = d;
    }
}