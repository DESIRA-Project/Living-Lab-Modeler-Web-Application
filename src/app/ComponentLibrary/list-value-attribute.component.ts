import { Component, ElementRef, Input, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { setConstantValue } from "typescript";
import { BackendService } from "../backend.service";
import { ResolutionAwareComponent } from "./resolutionaware.component";
import { ValueContainerComponent } from "./value-container-component";

@Component({
    selector: 'list-value-attribute',
    templateUrl: './list-value-attribute.component.html',
    providers: []
})

export class ListValueAttributeComponent extends ResolutionAwareComponent{
    value:any = null;
    parent:any = null;
    initialValue:any = null;
    isReadonly:boolean = true;
    @Input() data:any = null;

    @Input() set setParent(p:any){
        this.parent = p;
        if(!this.isReadonly){
            this.parent.addChild(this);
        }
   }

   @Input() set setReadonly(isReadonly:boolean){
    this.isReadonly = true;
   }

   @Input() set setData(data:any){
        this.data = data;
        if(this.data.data.data !== null){
            this.value = this.data.data.data;
            this.initialValue = this.data.data.data;
         //   console.log(this.initialValue)
        }
    }

    ngAfterViewInit() {
        this.setValue();
    }

    private setValue():void{

        for(let i = 0;i<this.value.length;i++){
            let el = document.getElementById(this.data.data.attribute+"_"+i);
            if(el === null) continue;
            (<HTMLInputElement>el).value = this.value[i];
        }
    }
}