import { ComponentFactoryResolver } from "@angular/core";
import { BreakpointObserver, BreakpointState } from "@angular/cdk/layout";

import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { DynamicModalDialogComponent } from "./dynamic-modal-dialog.component";

export class ResponsiveDynamicModalDialogComponent extends DynamicModalDialogComponent {
    onSmallScreen : boolean = false;
    screenWidth = "500px";
    showLogs = true;
    startingModalWidth = this.modalWidth;

    constructor(public breakpointObserver: BreakpointObserver, public dialog: MatDialog,
        public componentFactoryResolver: ComponentFactoryResolver,
        public snackBar: MatSnackBar) {

        super(dialog, componentFactoryResolver, snackBar);

        let inst = this;
        this.setModalWidth("20rem");
        
        this.breakpointObserver
        .observe(['(min-width: '+inst.screenWidth+')'])
        .subscribe((state: BreakpointState) => {
          if (state.matches) {
            inst.onSmallScreen = false;
         //   inst.modalWidth = inst.startingModalWidth;
            if(inst.showLogs){
                console.log('Viewport width is greater than '+inst.screenWidth+"!");
            }
        } else {
            if(inst.showLogs){
                console.log('Viewport width is less than '+inst.screenWidth+"!");
            }
            inst.onSmallScreen = true;
           // inst.modalWidth = "";
          }
        });
    }
}