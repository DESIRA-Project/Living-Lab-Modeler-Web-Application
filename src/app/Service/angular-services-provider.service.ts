import { ComponentFactoryResolver, Injectable, Type } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { DynamicModalDialogComponent } from "../ComponentLibrary/DynamicModalDialog/dynamic-modal-dialog.component";
import {MatSnackBar} from "@angular/material/snack-bar";
import { BreakpointObserver, BreakpointState } from "@angular/cdk/layout";

@Injectable()
export class AngularServicesProviderService {
  constructor(public breakpointObserver: BreakpointObserver, private componentResolver: ComponentFactoryResolver, private modalDialog: MatDialog, private matSnackBar: MatSnackBar) {
  }

  public getModalDialog(): MatDialog {
    return this.modalDialog;
  }

  public getComponentFactoryResolver(): ComponentFactoryResolver {
    return this.componentResolver;
  }

  public createNewModal():DynamicModalDialogComponent{
    return new DynamicModalDialogComponent(this.modalDialog, this.componentResolver, this.matSnackBar);
  }

  public createNewResponsiveModal():DynamicModalDialogComponent{
    let i = new DynamicModalDialogComponent(this.modalDialog, this.componentResolver, this.matSnackBar);
    i.setModalWidth('21rem');
    return i;

  }

  public createNewModalWithType(t:Type<any>):DynamicModalDialogComponent{
    let inst = new DynamicModalDialogComponent(this.modalDialog, this.componentResolver, this.matSnackBar);
    inst.setComponentTypeOnModal(t);
    return inst;
  }

  public createNewResponsiveModalWithType(t:Type<any>):DynamicModalDialogComponent{
    let inst = new DynamicModalDialogComponent(this.modalDialog, this.componentResolver, this.matSnackBar);
    inst.setComponentTypeOnModal(t);
    inst.setModalWidth('21rem');
    return inst;
  }

  public createNewModalWithTypeAndWidth(t:Type<any>,w:string):DynamicModalDialogComponent{
    let inst = new DynamicModalDialogComponent(this.modalDialog, this.componentResolver, this.matSnackBar);
    inst.setComponentTypeOnModal(t);
    inst.setModalWidth(w);
    return inst;
  }

  public createModalWithGenericErrorMessage(): void {
    new DynamicModalDialogComponent(this.modalDialog, this.componentResolver, this.matSnackBar)
      .alert(false, 'Something went wrong, please try again later!');
  }

  public createTokenExpirationModal():void{
    this.createNewModal().alert(true, "Your session has expired. Please log in again.");
  }

}
