import { Type } from '@angular/core';
import { BackendService } from '../../backend.service';
export class DynamicItem {
    public data:any;
    public onSubmit:Function = ()=>{};
    public dependencies:DynamicItem[] = [];
    constructor(public component: Type<any>, public backend:BackendService) {}

    public setData(_data:any){
       this.data = _data;
    }

    public setDependencies(dependencies:DynamicItem[]){
         this.dependencies = dependencies;
    }

    public hasDependencies(){
        return this.dependencies.length > 0;
    }
}