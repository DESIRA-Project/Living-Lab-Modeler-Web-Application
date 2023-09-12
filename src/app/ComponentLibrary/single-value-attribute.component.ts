import { Component, Input } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { BackendService } from "../backend.service";
import { ResolutionAwareComponent } from "../ToolFilterPage/resolutionaware.component";

@Component({
    selector: 'single-value-attribute',
    templateUrl: './single-value-attribute.component.html',
    styleUrls: ['../style/tool-detailed-view.css'],
    providers: []
})

export class SingleValueAttributeComponent extends ResolutionAwareComponent{
    @Input() data:any = null;
    constructor(private service:BackendService){
        super();
    }

    ngOnInit(){
/*        this.service.getData().subscribe((value)=>{
             if(value !== null){
                 console.log(value);
                 this.data = value;
             }
        });*/
    }

    disableClick(){
        return false;
    }

    getDate(millis:number){
        return new Date(millis);
    }
}