import { Type } from "@angular/core";
import { UserManagementService } from "src/app/User/user-management.service";
import { BackendService } from "../../backend.service";
import { DynamicItem } from "./dynamic-item.components";

export class DynamicContentItem extends DynamicItem{
    private token:string|null = null;
    constructor(public component: Type<any>, public backend:BackendService, public userManagementService:UserManagementService) {
        super(component,backend);
    }

    setUserToken(token:string){
         this.token = token;
    }

    getUserToken():string|null{return this.token;}

}