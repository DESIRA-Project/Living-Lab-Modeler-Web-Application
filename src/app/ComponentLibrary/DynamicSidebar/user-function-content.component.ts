import { Component, Input } from "@angular/core";
import { DynamicContentService } from "../../ComponentLibrary/DynamicModal/dynamic-content.service";
import { DynamicItem } from "../../ComponentLibrary/DynamicModal/dynamic-item.components";
import { ActivatedItem } from "./activated-item";
import { PageFunction } from "./page-function";
import { UserListManager } from "./user-list-manager";
import {DynamicContentParent} from "../DynamicModal/dynamic-content-parent";
import { DynamicContentSectionComponent } from "../DynamicModal/dynamic-content-section.component";
import { UserManagementService } from "src/app/User/user-management.service";
import { Router } from "@angular/router";
import { AngularServicesProviderService } from "src/app/Service/angular-services-provider.service";

@Component({
    selector: 'user-function-content',
    templateUrl: './user-function-content.component.html',
})

export class UserFunctionContentComponent implements ActivatedItem{

    view:PageFunction[]|null = null;
    activeItem:number = -1;
    activeIndices:number[] = [];
    manager:UserListManager|null = null;
    token:string|null = null;
    tokenFetched:boolean = false;
    viewLoaded:boolean = false;

    activeComponent:DynamicItem|null = null;
    dynamicContentParent: DynamicContentParent | undefined;

    activeComponentLock = false;

    @Input() set setView(view:PageFunction[]|null){
        this.view = view;

        if(this.view !== null){
            this.activeItem = 0;
            /*console.log("user function content set active setview");*/
            this.setActiveComponent();
            this.viewLoaded = true;
        }
    }

    @Input() set setParent(manager:UserListManager){
        this.manager = manager;
        this.manager.setFunctionContentComponent(this);
    }

    @Input() set setToken(token:string){
        this.token = token;
        this.tokenFetched = true;
//        this.setActiveComponent();
    }

    constructor(private dynContentService:DynamicContentService,
        private userManagementService: UserManagementService,
        protected angularServicesProviderService: AngularServicesProviderService,
        private router: Router){
    }


    getToken():string{
        if(this.token !== null){
            return this.token;
        }
        return '';
    }

    setActiveItem(i:number,  dynamicContentParent: DynamicContentParent, params?:string,){
        //console.log("set active is called")
        /*console.log("Lock "+ this.activeComponentLock)*/
        /*console.log("set active item "+dynamicContentParent)*/
        if(this.activeComponentLock) return;
        if(this.activeItem === i && this.viewLoaded === true && this.activeComponent !== null) return;
        this.activeComponentLock = true;
        this.activeComponent = null;
        this.viewLoaded = false;
        this.activeItem = i;
        //console.log("set active item")
        this.dynamicContentParent = dynamicContentParent;
        //console.log("dynamic content parent set "+this.dynamicContentParent)
        this.setActiveComponent();

         setTimeout(()=>{
             this.viewLoaded = true;
             this.activeComponentLock = false;
        },10);
    }

    setActiveChild(indices: number[]): void {
        this.activeComponent = null;
        this.viewLoaded = false;
        this.activeItem = indices[0];
        this.activeIndices = indices;
       // this.setActiveChildComponent(indices);

         setTimeout(()=>{
             this.viewLoaded = true;
        },10);

    }

/*    getChildName(indices:number[]){
        if(this.view !== null){
            let p:PageFunction = this.view[this.activeItem];

        }
    }*/
    checkForAuth(){
        if (!this.userManagementService.getUserInfo()) {
            this.angularServicesProviderService.createTokenExpirationModal();
            this.router.navigate(['/']);
            return;
          }
    }
    setActiveChildComponent(indices:number[]){
        if(this.view === null) return;
        if(this.token !== null){
            let p:PageFunction = this.view[this.activeItem];
            if(!p.children){
                return;
            }

            this.checkForAuth();

            this.activeComponent = this.dynContentService.getUserAuthorizedComponent(p.children[indices[1]].name);
            return;
        }
        return;
    }

    setParentCB(combo:UserFunctionContentComponent,c:DynamicContentSectionComponent):void{
        /*console.log(combo.dynamicContentParent);
        console.log(combo)*/
        if(c && combo.dynamicContentParent){
            c.setDynamicContentParent(combo.dynamicContentParent);
        }
        else{
            console.log(combo.dynamicContentParent);
        }
    }

    getParentCB(){
        let inst = this;
        return (c:DynamicContentSectionComponent) =>{
            return inst.setParentCB(inst, c);
        }
    }

    setActiveComponent(dynamicContentParent?: DynamicContentParent){
        if(this.view === null) return;
        if(this.token !== null){
            if(this.view[this.activeItem].children !== undefined){
                let children:PageFunction[] = this.view[this.activeItem].children ?? [];
                let index = this.activeIndices[1];
                let component = children[index];

                this.checkForAuth();

                this.activeComponent = this.dynContentService.getUserAuthorizedComponent(component.name);
                return;
            }

            this.checkForAuth();


            this.activeComponent = this.dynContentService.getUserAuthorizedComponent(this.view[this.activeItem].name);            
            return;
        }
        return;
    }
}
