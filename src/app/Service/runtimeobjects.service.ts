import { Injectable } from "@angular/core";

@Injectable({
    providedIn:"root"
})
export class RuntimeObjectsService{
    private data:any = {};
    private cbs:any = {};
    private values:any = {};
    private forgotten:any = {};

    constructor(){
    }

    storeRuntimeObject(key:string,data:any){
        this.data[key] = data;
    }

    getRuntimeObject(key:string):any{
        if(key in this.data){
            return this.data[key];
        }
        return {};
    }

    storeCallback(key:string, cb:Function){
        this.cbs[key] = cb;
    }

    storeValue(key:string, value:any){
        this.values[key] = value;
    }

    storeValueIfNotForgotten(key:string, value:any){
        if(this.forgotten[key] === 1){
            return;
        }
        this.values[key] = value;
    }
    

/*    storeValueIfConditionIsTrue(key:string, variableKey:string,value:any){
        alert(this.values[variableKey]);
        if(this.values[variableKey] === undefined) return;
        if(!this.values[variableKey]) return;
        this.values[key] = value;
    }*/

    triggerAndForget(key:string){
        //alert("trigger and forget");
        if(this.cbs[key] !== undefined && typeof this.cbs[key] === 'function' && this.values[key] !== undefined){
            this.cbs[key](this.values[key]);
            delete this.cbs[key];
            //console.log("triggered and forgotten");
        }
    }

    triggerAndForgetForever(key:string){
        if(this.forgotten[key] !== undefined){
            return;
        }
        
        if(this.cbs[key] !== undefined && typeof this.cbs[key] === 'function' && this.values[key] !== undefined){
         //   console.log("actually called "+key);
            this.cbs[key](this.values[key]);
            delete this.cbs[key];
            this.forgotten[key] = 1;
            //console.log("triggered and forgotten forever");
        }
    }

    trigger():void{
        for (let key in this.values) {
            let value = this.values[key];
            if(this.forgotten[key] !== undefined){
                continue;
            }
            if(this.cbs[key] !== undefined && typeof this.cbs[key] === 'function'){
                //console.log("trigger");
                this.cbs[key](value);
            }
        }
    }

    removeCallback(key:string){
        if(this.cbs[key] !== undefined){
            delete this.cbs[key];
        }
    }

    getValue(key:string):any{
         if(this.values[key] === undefined){
             return null;
         }
         return this.values[key];
    }
}