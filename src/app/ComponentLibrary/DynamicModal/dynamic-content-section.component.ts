import { Component, ComponentFactoryResolver, Input, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { DynamicContent } from "./dynamic-content.component";
import { DynamicContentDirective } from "./dynamic-content.directive";
import { DynamicItem } from "./dynamic-item.components";
import { DynamicModalContainer } from "./dynamic-modal-container";
import { DynamicContentParent } from "./dynamic-content-parent";

@Component({
  selector: 'dynamic-content-section',
  template: `
    <div class="dynamic-content-section">
        <ng-template dynamicContent></ng-template>
    </div>
    `
})

export class DynamicContentSectionComponent implements OnInit, OnDestroy {

  @Input() item: DynamicItem | null = null;
  @Input() parent: DynamicModalContainer | null = null;
  @Input() userToken: string | null = null;
  @Input() onFinish: Function | undefined;
  private dynamicContentParent: DynamicContentParent | undefined;
  @Input() setDynamicContentParent(p: DynamicContentParent | undefined) {
    this.dynamicContentParent = p;

    // Set component instance of user-landing-page
    this.dynamicContentParent?.setCurrentViewInst(this.componentRef.instance);
    if (this.dynamicContentParent) {
      if (this.componentRef.instance) {
        if (this.componentRef.instance.setParent) {
          this.componentRef.instance.setParent(this.dynamicContentParent);
        }
      }
      else {
        alert("what it is null")
      }
    }
    else {
      console.log("parent is " + this.dynamicContentParent)
    }


  }
  //  currentAdIndex = -1;

  @ViewChild(DynamicContentDirective, { static: true }) dynamicContent!: DynamicContentDirective;
  interval: number | undefined;
  loaded: boolean = false;
  componentRef: any = null;
  constructor(private componentFactoryResolver: ComponentFactoryResolver) { }

  ngOnInit() {
    this.loadComponent();
    this.getContent();
  }

  ngOnDestroy() {
    clearInterval(this.interval);
  }

  loadComponent() {
    const i = this.item;
    if (this.loaded === true) return;

    if (i === null) { return; }
    //console.log("loadeded component " + this.loaded);
    
    this.loaded = true;
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(i.component);
    const viewContainerRef = this.dynamicContent.viewContainerRef;
    viewContainerRef.clear();

    this.componentRef = viewContainerRef.createComponent<DynamicContent>(componentFactory);

    this.componentRef.instance.data = i.data;
    /*console.log(i.component)*/

    if (i.hasDependencies()) {
      this.componentRef.instance.setDependencies(i.dependencies);
    }
    if (this.parent) {
      this.componentRef.instance.initialize(this.parent);
    }

    if (this.userToken !== null) {
      if (this.componentRef.instance.initializeWithAuthData !== undefined) {
        this.componentRef.instance.initializeWithAuthData(this.userToken);
      }
    }
    if (this.onFinish) {
      this.onFinish(this);
    }
  }

  getContent() {

  }
}
