import { Component, Input } from '@angular/core';
import { BackendService } from 'src/app/backend.service';
import { AttachableButton } from 'src/app/ComponentLibrary/attachable-button';
import { DynamicContentParent } from './dynamic-content-parent';
import { DynamicContent } from './dynamic-content.component';
import { DynamicItem } from './dynamic-item.components';
import { DynamicModalContainer } from './dynamic-modal-container';

@Component({
  template: `
    <div class="" *ngIf="ready === true">
        <div>
        <div>{{msg}}</div>
<!--        <button type="button" class="btn btn-success" (click)="exec()">Yes</button>
                </div> -->
    </div>
  `,
//  styleUrls: ['../style/tool-listing.css'],
})
export class CancellableOperationComponent implements DynamicContent {
    @Input() data: any;
    msg:string = "";
    ready:boolean = false;
    onSubmit:Function|null = null;
    parent:DynamicModalContainer|null = null;

    constructor(private service:BackendService){ }

    setDependencies(dependencies: DynamicItem[]): void {

    }

    setParent(parent: DynamicContentParent | undefined){

    }

    initializeWithAuthData(userToken: string): void {}

    getUserToken(): string|null {
      return null;
    }


    exec(){
         if(this.data.onSubmit){
           this.data.onSubmit();
         }
    }

    initialize(parent:DynamicModalContainer):void{
         this.msg = this.data.msg;
         //alert(this.data.title)
         if(this.data.title){
           parent.setTitle(this.data.title);
         }
         let inst = this;

         let exec = ()=>{
             inst.exec();
         };
         let acceptButtonText = this.data.acceptButtonText ? this.data.acceptButtonText : "Accept";
         let execButton:AttachableButton = new AttachableButton(acceptButtonText, null,exec,"blue-text");
         this.parent = parent;
         this.parent.addButton(execButton);
         this.ready = true;
    }

    ngOnDestroy(){
    }
}
