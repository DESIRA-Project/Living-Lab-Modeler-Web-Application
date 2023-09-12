import {Component, EventEmitter, Input, Output} from "@angular/core";
import { UserManagementService } from "src/app/User/user-management.service";
import { ActivatedItem } from "./activated-item";
import { PageFunction } from "./page-function";
import { UserListManager } from "./user-list-manager";
import {LocalStorageDefs} from "../../Models/LocalStorageDefs";
import {DynamicContentParent} from "../DynamicModal/dynamic-content-parent";
import { RouterExtService } from "src/app/Service/router-ext.service";

@Component({
    selector: 'user-function-list',
    templateUrl: './user-function-list.component.html',
    styleUrls:['../../style/user-function-list.css']
})

export class UserFunctionListComponent implements ActivatedItem {
    view:PageFunction[]|null = null;
    activeItem:number = -1;
    activeChild:number = -1;
    manager:UserListManager|null = null;
    viewsReady = false;

    @Output() clickedOnItem = new EventEmitter<boolean>();

    @Input() set setView(view:PageFunction[]|null){
        if(view !== null){
            this.activeItem = 0;
            for(let i = 0;i<view.length;i++){
                view[i].open = false;
            }
        }
        this.view = view;
        this.viewsReady = true;
    }

    @Input() set setParent(manager:UserListManager){
        if (this.manager !== null) {
          return;
        }
        this.manager = manager;
        this.manager.setFunctionList(this);
    }

    constructor(private userManagementService:UserManagementService, private routerExt:RouterExtService){

    }

    openParentNode(i:number):void{
        if(this.view !== null){
            this.view[i].open = !this.view[i].open;
        }
    }

    openParentNodeIfClosed(i:number):void{
        if(this.view !== null && this.view[i] !== undefined){
            if(this.view[i].open === false){
                this.view[i].open = true;
            }
        }
    }

    itemCanBeViewed(func:PageFunction):boolean{
        if(func === null) return false;
        let result = this.userManagementService.userHasAdequatePermissions(func.permissions);
        return result;
    }

    setActiveItem(i:number){
        /*if (localStorage.getItem(LocalStorageDefs.CurrentDynamicContentSectionIsDirty) === 'true') {
          if (!window.confirm('Are you sure you would like to leave this page? You may have unsaved changes.')) {
            return;
          }
          else {
            localStorage.removeItem(LocalStorageDefs.CurrentDynamicContentSectionIsDirty);
          }
        }*/

        if (this.manager?.checkCurrentViewDirty()) {
          if (!window.confirm('Are you sure you would like to leave this page? You may have unsaved changes.')) {
            return;
          }
        }

        if(this.view !== null){
        //console.log(this.view[i])
        this.routerExt.registerUrl(/*"/home"+*/this.view[i].url);
        }

        if(this.view !== null && this.view[i].children !== undefined){
            return;
        }
        this.activeItem = i;
        if(this.manager){
            this.manager.setActiveItem(i);
        }
    }

    initialize(i:number){
          if(this.view !== null && this.view[i].children !== undefined){
              return;
          }
          this.activeItem = i;
    }

    setActiveChild(indices:number[]){
        let i = indices[0];
        if(this.view !== null && this.view[i].children === undefined){
            return;
        }
        this.activeItem = i;
        this.activeChild = indices[1];
        if(this.manager){
            this.manager.setActiveChild(indices);
        }
    }

    performNavigationTasks(i: number, f: PageFunction) {
      if (f.openInNewTab) {
        window.open(f.url);
      }
      else {
        this.setActiveItem(i);
        this.clickedOnItem.emit(true)
      }
    }

}
