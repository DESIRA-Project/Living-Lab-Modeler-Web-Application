import { Component, Input } from "@angular/core";
import { environment } from "src/environments/environment";
import { ResolutionAwareComponent } from "../ComponentLibrary/resolutionaware.component";
import { PageConfigService } from "../pageconfig.service";
import { BreadcrumbController } from "./breadcrumb-controller";

@Component({
    selector: 'breadcrumb',
    templateUrl: './breadcrumb.component.html',
    styleUrls: ['../style/breadcrumb.css'],
    providers: []
  })
  
  export class BreadcrumbComponent extends ResolutionAwareComponent{
    private configKey: string = "breadcrumb";
    public pageData: any = null;
    public currentPageName:string|null = null;
    public gapBottom:boolean = false;
    public ready = false;
    public controller:BreadcrumbController|null = null;
    public controllerLabel:string|null = null;
    public path:any[] = [];

    @Input() public set currentPage(s:string){
          this.currentPageName = s;
    }

    @Input() public set hasGapBottom(gapBottom:boolean){
      this.gapBottom = gapBottom;
    }

    @Input() public set setController(controller:BreadcrumbController){
      this.controller = controller;
      this.controller.setBreadcrumb(this);
    }

    constructor(){
        super();
        this.pageData = environment.env.breadcrumb;    
        this.ready = true;
    }

    labelIsLink(component:any){
      let key = component.key;
      if(key === "") return false;

      /*console.log(key +  " =  " + this.pageData.items[key]);*/
      if(component.link !== undefined) return true;
      return (this.pageData.items[key] != undefined);
    }

    getLabelLink(component:any):string{
      let key = component.key;
      if(key === "") return "";
     // console.log(this.pageData.items);
      if(this.pageData.items[key] !== undefined){
        return this.pageData.items[key].link;
      }
      if(component.link !== undefined && component.link !== "") return component.link;
      return "";

    }

    setPath(path:any[]|null){
      if(path === null){
        this.path = [];
        return;
      }
     // console.log(path);
      this.path = path;
    }

    setLabel(label:string){
      this.controllerLabel = label;
    }

    addToPath(path:any[]|null){
      if(path === null){
        this.setPath(path);
        return;
      }
/*      console.log(path);
      console.log(this.path);*/
      
      for(let i = 0;i<path.length;i++){
        this.path.push(path[i]);
      }
    }

  }