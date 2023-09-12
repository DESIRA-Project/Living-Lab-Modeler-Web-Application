import { Component, ElementRef, Input, ViewChild } from "@angular/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { NgbModal, NgbModalOptions, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { ModalController } from "src/app/ComponentLibrary/DynamicModal/modal-controller";
import { ReCaptchaService } from "src/app/ReCaptchaService/recaptcha.service";
import { PageConfigService } from "../../pageconfig.service";
import { AttachableButton } from "../attachable-button";
import { DynamicContent } from "./dynamic-content.component";
import { DynamicItem } from "./dynamic-item.components";
import { DynamicModalContainer } from "./dynamic-modal-container";
//import { ModalController } from "./modal-controller";
@Component({
  selector: 'dynamic-modal',
  templateUrl: './dynamic-modal.component.html',
  styleUrls: ['../../style/dynamic-modal.css'/*, '../../style/gnomee.css'*/],
  providers: []
})

export class DynamicModalComponent implements DynamicModalContainer {

  data: any = null;
  _modal: any = null;
  _modalData: DynamicItem | null = null;
  sentences: SafeHtml[] = []
  title: string | null = null;
  key: string = "dynamic-modal";
  configData: any = null;
  fullHeight: boolean = false;

  @ViewChild("dynamicContent") content: ElementRef|null = null;

  cookieCategoryToggleState: boolean[] = [];
  cookieCategoryInability: boolean[] = [];
  mode: number = 0;
  appCookieName: string | null = null;
  initialized: boolean = false;
  isModalClosed: boolean = true;
  onDismiss: Function = () => { };
  sz: string | null = null;
  buttons: any[] = [];
  protected parent: ModalController | null = null;
  public closeButtonText: string = "Close";
  public usesRecaptcha:boolean = false;
  public recaptchaLogo:any = null;
  public panelClass:string = "";

  openFromExternalMedium: boolean = false;
  @Input() set openFromExternalMediumOption(option: boolean) {
    this.openFromExternalMedium = option;
    setTimeout(() => {
      this.openDynamicModal();

    }, 500);
  }

  @Input() set openFromExternalMediumOptionWithClass(className:string) {
    this.openFromExternalMedium = true;
    this.panelClass = className;
    setTimeout(() => {
      this.openDynamicModal();

    }, 500);
  }

  @Input() set cb(func: Function) {
    if (func !== null) {
      this.onDismiss = func;
    }
  }

  @Input() set modalData(_data: DynamicItem) {
    if (_data !== null) {
      this._modalData = _data;
    }
  }

  @Input() set modalTitle(title: string) {
    this.title = title;
  }

  @Input() set modalParent(parent: any) {
    parent.modal = this;
    this.parent = parent;
  }

  @Input() set modalSize(sz: string) {
    this.sz = sz;
  }

  @Input() set modalFullHeight(fullHeight: boolean) {
    this.fullHeight = fullHeight;
  }

  @Input() set closeButtonTextAttribute(text: string) {
    this.closeButtonText = text;
  }

  addButton(b: AttachableButton): void {
    this.buttons.push(b);
  }

  constructor(
    private modalService: NgbModal,
    private sanitizer: DomSanitizer,
    private configService: PageConfigService,
    private rec:ReCaptchaService
  ) {

    this.configService.getConfigData().subscribe((data) => {
      if (data === null) return;
      if (data === false) return;
      this.configData = data[this.key];
      let inst = this;
      if(this.configData && this.configData.recaptchaLogo){
           this.recaptchaLogo = this.configData.recaptchaLogo;
      }
      this.rec.isInjected().subscribe((val:any)=>{
           if(val === true){
             //console.log(inst.content?.nativeElement)
          //   alert(this.content.getElementById("rc") === null)
             //inst.usesRecaptcha = true;
           }
      });
      this.initialized = true;

    });
  }
  getSharedData() {
    return this.data;
  }
  storeValue(key: string, value: any): void {
   this.data[key] = value;
  }

  setCloseButtonText(text: string): void {
    this.closeButtonText = text;
  }

  getParent(): ModalController | null {
    return this.parent;
  }

  setTitle(title: string): void {
    this.title = title;
  }

  loadData(): void {

  }

  containsRecaptcha(){
    let inst = this;
    setTimeout(()=>{

        let m = this._modal as NgbModalRef;
        if(this._modal && this._modal._windowCmptRef && this._modal._windowCmptRef.hostView && this._modal._windowCmptRef.hostView.rootNodes.length >= 1){
             let e:HTMLElement = this._modal._windowCmptRef.hostView.rootNodes[0];
             let elems:Element|null = e.querySelector("#rc");
             //console.log(elems)
             inst.usesRecaptcha = elems === null ? false : true;
        }

  },1000)
  }

  openDynamicModal() {

    this.mode = 0;

    let opt: NgbModalOptions = {};
    if (this.sz === 'lg' || this.sz === 'sm' || this.sz === 'xl') {
      opt.size = this.sz;
    }
    if(this.panelClass !== ''){
      opt.modalDialogClass = this.panelClass;
      opt.windowClass = this.panelClass;
      opt.size = undefined;
    }


    this._modal = this.modalService.open(this.content, opt);
    this.isModalClosed = false;
//console.log(this._modal);
//console.log(this._modal._windowCmptRef.hostView.rootNodes[0]);
this.containsRecaptcha();

//console.log(document.querySelector(".modal-content"))

let m = this._modal as NgbModalRef;
//console.log ( m.componentInstance)

//console .log ( this._modal.componentInstance );

    const parentRef = this;
    this._modal.result.then(function () {
      //Get triggers when modal is closed
      parentRef.isModalClosed = true;
      parentRef.mode = 0;
      if (parentRef.onDismiss !== null) {
        //console.log("onDismiss 1");
        parentRef.onDismiss();
      }
    }, function () {
      //gets triggers when modal is dismissed.
      if (parentRef.onDismiss !== null) {
        parentRef.onDismiss();
      }

      parentRef.isModalClosed = true;

    })

  }

  switchMode(n: number) {
    this.mode = 1;
  }

  closeModal() {
    if (this.modalService.hasOpenModals()) {
      this.modalService.dismissAll();
    }
    this.mode = 0;
    this.isModalClosed = true;
    if (this.onDismiss !== null) {
      this.onDismiss();
    }
  }

  anotherModalIsOpen() {
    return this.modalService.hasOpenModals();
  }

}
