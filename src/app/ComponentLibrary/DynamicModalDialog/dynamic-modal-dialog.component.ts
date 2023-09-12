import { ComponentFactoryResolver, Type } from "@angular/core";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { ConfirmationModalComponent } from "src/app/confirmation-modal/confirmation-modal.component";
import { Observable } from "rxjs/internal/Observable";
import { ErrorResponse } from "../../Models/Response/error-response";
import { MatSnackBar } from "@angular/material/snack-bar";
import { SnackBarComponent } from "../snack-bar/snack-bar.component";

export interface ModalButtonColor {
  color: string;
}

export interface ModalButton {
  label: string;
  color: string
}

export interface ModalConfig {
  text: string;
  buttons: ModalButton[];

};

export class DynamicModalDialogComponent {
  modalWidth = '45%';

  public confirmationModalComponentType: Type<any> = ConfirmationModalComponent;
  public componentTypeOnModal!: Type<any>;

  private dialogRef: MatDialogRef<Type<any>> | undefined;

  constructor(public dialog: MatDialog,
    public componentFactoryResolver: ComponentFactoryResolver,
    public snackBar: MatSnackBar) {

      // For smoother modals below is a function
      // that approaches 100% as innerWidth goes to 0px
      // and approaches 50% as innerWidth goes to 1400px
      this.modalWidth = (window.innerWidth - 200) * (50 - 90) / (1400 - 200) + 90 + '%';
  }

  public setConfirmationModalComponent(c: Type<any>) {
    this.confirmationModalComponentType = c;
  }

  public setComponentTypeOnModal(c: Type<any>) {
    this.componentTypeOnModal = c;
  }

  public setModalWidth(width: string) {
    this.modalWidth = width;
  }

  public close(): void {
    this.dialogRef?.close();
  }



  public performConfirmableOperation(getData: Function, beforeConfirmation: Function, onFinish: Function): void {

    this.dialogRef = this.dialog.open(this.componentTypeOnModal, {
      hasBackdrop: true,
      width: this.modalWidth,
      data: getData()
    });

    beforeConfirmation();

    this.dialogRef.afterClosed().subscribe(textToBeShown => {
      if (textToBeShown === undefined) {
        return;
      }
      this.dialog.open(this.confirmationModalComponentType, {
        hasBackdrop: true,
        width: this.modalWidth,
        data: textToBeShown
      });
      onFinish();
    });
  }

  public performConfirmableOperationCustom(className:string, getData: Function, beforeConfirmation: Function, onFinish: Function): void {

    this.dialogRef = this.dialog.open(this.componentTypeOnModal, {
      hasBackdrop: true,
/*      width: this.modalWidth,*/
      panelClass: className,
      data: getData()
    });

    beforeConfirmation();

    this.dialogRef.afterClosed().subscribe(textToBeShown => {
      if (textToBeShown === undefined) {
        return;
      }
      this.dialog.open(this.confirmationModalComponentType, {
        hasBackdrop: true,
/*        width: this.modalWidth,*/
        panelClass: className,
        data: textToBeShown
      });
      onFinish();
    });
  }

  public getObservableFromConfirmableOperation(getData: Function, beforeConfirmation: Function): Observable<any> {

    this.dialogRef = this.dialog.open(this.componentTypeOnModal, {
      hasBackdrop: true,
      width: this.modalWidth,
      data: getData()
    });

    beforeConfirmation();

    return this.dialogRef.afterClosed();
  }

  public getObservableFromConfirmableOperationWithCustomStyle(getData: Function, beforeConfirmation: Function, dialogPanelClass: string): Observable<any> {

    this.dialogRef = this.dialog.open(this.componentTypeOnModal, {
      hasBackdrop: true,
      panelClass: dialogPanelClass,
      data: getData(),
      autoFocus: false,
      restoreFocus: false
    });

    beforeConfirmation();

    return this.dialogRef.afterClosed();
  }

  public showModal(getData: Function, beforeConfirmation: Function, onFinish: Function): void {

    this.dialogRef = this.dialog.open(this.componentTypeOnModal, {
      hasBackdrop: true,
      width: this.modalWidth,
      data: getData(),
      autoFocus: false,
      restoreFocus: false
    });

    beforeConfirmation();

    this.dialogRef.afterClosed().subscribe(textToBeShown => {
      onFinish();
    });
  }

  public performConfirmableOperationWithConfig(config: ModalConfig, getData: Function, beforeConfirmation: Function, onFinish: Function): void {


    let labels: string[] = [];
    let colors: ModalButtonColor[] = [];

    for (let i = 0; i < config.buttons.length; i++) {
      labels.push(config.buttons[i].label);
      colors.push({ color: config.buttons[i].color });
    }

    this.dialogRef = this.dialog.open(this.componentTypeOnModal, {
      hasBackdrop: true,
      width: this.modalWidth,
      data: {

        buttons: labels,
        buttonsStyle: colors,
        textStyle: {}
      }


    });

    beforeConfirmation();

    this.dialogRef.afterClosed().subscribe(textToBeShown => {
      if (textToBeShown === undefined) {
        return;
      }
      this.dialog.open(this.confirmationModalComponentType, {
        hasBackdrop: true,
        width: this.modalWidth,
        data: textToBeShown
      });
      onFinish();
    });
  }

  public performStatusMonitoredOperation(getData: Function, onFinish: Function): void {

    this.dialogRef = this.dialog.open(this.componentTypeOnModal, {
      hasBackdrop: true,
      width: this.modalWidth,
      data: getData(),
      autoFocus: false,
      restoreFocus: false
    });

    this.dialogRef.afterClosed().subscribe(textToBeShown => {
      if (textToBeShown === undefined) {
        return;
      }
      this.dialog.open(this.confirmationModalComponentType, {
        hasBackdrop: true,
        width: this.modalWidth,
        data: textToBeShown
      });
      onFinish();
    });
  }

  public performStatusMonitoredOperationCustom(getData: Function, onFinish: Function, className: string): void {

    this.dialogRef = this.dialog.open(this.componentTypeOnModal, {
      hasBackdrop: true,
      /*        width: this.modalWidth,*/
      data: getData(),
      autoFocus: false,
      panelClass: className,
      restoreFocus: false
    });

    this.dialogRef.afterClosed().subscribe(textToBeShown => {
      if (textToBeShown === undefined) {
        return;
      }
      this.dialog.open(this.confirmationModalComponentType, {
        hasBackdrop: true,
        width: this.modalWidth,
        data: textToBeShown
      });
      onFinish();
    });
  }


  public performResultStatusMonitoredOperation(getData: Function, onFinish: Function, confirmation: boolean, specifiedModalWidth?: string): void {

    this.dialogRef = this.dialog.open(this.componentTypeOnModal, {
      hasBackdrop: true,
      width: specifiedModalWidth ?? this.modalWidth,
      data: getData(),
      autoFocus: false,
      restoreFocus: false
    });

    this.dialogRef.afterClosed().subscribe(textToBeShown => {
      if (textToBeShown === undefined) {
        return;
      }
      if (confirmation === true) {
        this.dialog.open(this.confirmationModalComponentType, {
          hasBackdrop: true,
          width: this.modalWidth,
          data: textToBeShown,
          autoFocus: false,
          restoreFocus: false
        });

      }
      onFinish(textToBeShown);
    });
  }

  public performResultStatusMonitoredOperationCustom(className:string, getData: Function, onFinish: Function, confirmation: boolean, specifiedModalWidth?: string): void {

    this.dialogRef = this.dialog.open(this.componentTypeOnModal, {
      hasBackdrop: true,
/*      width: specifiedModalWidth ?? this.modalWidth,*/
      panelClass: className,
      data: getData(),
      autoFocus: false,
      restoreFocus: false
    });

    this.dialogRef.afterClosed().subscribe(textToBeShown => {
      if (textToBeShown === undefined) {
        return;
      }
      if (confirmation === true) {
        this.dialog.open(this.confirmationModalComponentType, {
          hasBackdrop: true,
          /*width: this.modalWidth,*/
          panelClass: className,
          data: textToBeShown,
          autoFocus: false,
          restoreFocus: false
        });

      }
      onFinish(textToBeShown);
    });
  }

  public afterClosed(cb: ((i: number) => void)): void {
    this.dialogRef?.afterClosed().subscribe(cb);
  }


  public getObservable(): Observable<any> | null {
    return this.dialogRef !== undefined ? this.dialogRef.afterClosed() : null;
  }

  public afterClosedOnResultWithData(data: any): Observable<any> | undefined {

    this.dialogRef = this.dialog.open(this.componentTypeOnModal, {
      hasBackdrop: true,
      width: this.modalWidth,
      data: data
    });

    return this.dialogRef?.afterClosed();
  }

  public afterClosedOnResult(): Observable<any> | undefined {

    this.dialogRef = this.dialog.open(this.componentTypeOnModal, {
      hasBackdrop: true,
      width: this.modalWidth,
    });

    return this.dialogRef?.afterClosed();
  }

  public afterClosedOnResultCustom(className:string): Observable<any> | undefined {

    this.dialogRef = this.dialog.open(this.componentTypeOnModal, {
      hasBackdrop: true,
      panelClass:className,
    });

    return this.dialogRef?.afterClosed();
  }

  public alert(success: boolean, message: string) {
    /*let type = ConfirmationModalComponent;
    const successDialogRef = this.dialog.open(type, {
        hasBackdrop: true,
        width: this.modalWidth,
        data: {
            text: message,
            textStyle: { color: success ? 'green' : 'red' }
        }
    });*/
    const snackBarRef = this.snackBar.openFromComponent(SnackBarComponent, {
      data: {
        message,
        color: success ? 'var(--green)' : 'var(--red)'
      },
      duration: 5000
    });
  }

  public performAction(config: ModalConfig, onFinish: Function): void {
    let labels: string[] = [];
    let colors: ModalButtonColor[] = [];

    for (let i = 0; i < config.buttons.length; i++) {
      labels.push(config.buttons[i].label);
      colors.push({ color: config.buttons[i].color });
    }

    let inst = this;
    this.dialogRef = this.dialog.open(this.confirmationModalComponentType, {
      hasBackdrop: true,
      width: this.modalWidth,
      data: {
        text: config.text,
        textStyle: {},
        buttons: labels,
        buttonsStyle: colors
      },
      autoFocus: false,
      restoreFocus: false
    })

    onFinish(inst);
  }

  public performActionCustom(className:string, config: ModalConfig, onFinish: Function): void {
    let labels: string[] = [];
    let colors: ModalButtonColor[] = [];

    for (let i = 0; i < config.buttons.length; i++) {
      labels.push(config.buttons[i].label);
      colors.push({ color: config.buttons[i].color });
    }

    let inst = this;
    this.dialogRef = this.dialog.open(this.confirmationModalComponentType, {
      hasBackdrop: true,
/*      width: this.modalWidth,*/
      panelClass:className,
      data: {
        text: config.text,
        textStyle: {},
        buttons: labels,
        buttonsStyle: colors
      },
      autoFocus: false,
      restoreFocus: false
    })

    onFinish(inst);
  }



  public performServiceCallAndShowResponseWithConfirmation(observable: Observable<any>,
    callbackFunction: (param?: any) => void,
    instance: any,
    confirmationDialogText?: string): MatDialogRef<any> | null {

    /** Show confirmation modal if specified */
    if (confirmationDialogText) {
      const confirmationDialogRef = this.dialog.open(ConfirmationModalComponent, {
        hasBackdrop: true,
        width: this.modalWidth,
        data: {
          text: confirmationDialogText,
          buttons: ['CONFIRM', 'CANCEL'],
          buttonsStyle: [{ color: 'blue' }, { color: 'gray' }]
        }
      });

      /** Perform actual service call after closing */
      confirmationDialogRef.afterClosed().subscribe(returnedValue => {
        switch (returnedValue) {
          case 0: {
            return this.performServiceCallAndShowResponse(observable, callbackFunction, instance);
          }
          default: {
            return null;
          }
        }
      });

      return null;
    }

    /** If no confirmation modal needed, perform service call */
    else {
      return this.performServiceCallAndShowResponse(observable, callbackFunction, instance);
    }
  }

  public performServiceCallAndShowResponseWithConfirmationCustom(className: string,observable: Observable<any>,
    callbackFunction: (param?: any) => void,
    instance: any,
    confirmationDialogText?: string): MatDialogRef<any> | null {

    /** Show confirmation modal if specified */
    if (confirmationDialogText) {
      const confirmationDialogRef = this.dialog.open(ConfirmationModalComponent, {
        hasBackdrop: true,
/*        width: this.modalWidth,*/
       panelClass:className,
        data: {
          text: confirmationDialogText,
          buttons: ['CONFIRM', 'CANCEL'],
          buttonsStyle: [{ color: 'blue' }, { color: 'gray' }]
        }
      });

      /** Perform actual service call after closing */
      confirmationDialogRef.afterClosed().subscribe(returnedValue => {
        switch (returnedValue) {
          case 0: {
            return this.performServiceCallAndShowResponse(observable, callbackFunction, instance);
          }
          default: {
            return null;
          }
        }
      });

      return null;
    }

    /** If no confirmation modal needed, perform service call */
    else {
      return this.performServiceCallAndShowResponse(observable, callbackFunction, instance);
    }
  }


  public performServiceCallAndShowResponse(observable: Observable<any>,
    callbackFunction: (param?: any) => void,
    instance: any): MatDialogRef<any> | null {

    /** Perform service call */
    observable.subscribe(
      response => {

        /** Call back function gets called here */
        callbackFunction(instance);

        /** Open success modal */
        this.alert(true, response.message);
        return null;
      },

      (error: ErrorResponse) => {
        /** Call back function also gets called here */
        callbackFunction(instance);

        /** Open error modal */
        this.alert(false, error.error.message);
        return null;
      });

    return null;
  }

}
