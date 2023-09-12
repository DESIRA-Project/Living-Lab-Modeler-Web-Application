
import { ComponentFactoryResolver, ComponentRef, Inject, Injectable } from '@angular/core'
import { DynamicComponent } from '../DynamicModal/dynamic-component';
import { DynamicHTMLContentService } from '../DynamicModal/dynamic-html-content.service';
import { DynamicTooltip } from './dynamic-tooltip.component'

@Injectable()
export class DynamicTooltipService implements DynamicHTMLContentService{
   // factoryResolver: ComponentFactoryResolver;
    rootViewContainer: any;
    compo:ComponentRef<DynamicTooltip>|undefined;
    constructor(private factoryResolver:ComponentFactoryResolver ) {
//      this.factoryResolver = factoryResolver;
    }
  getDynamicComponent():DynamicComponent|null {
    return this.compo !== undefined ? this.compo.instance : null;

  }
    setRootViewContainerRef(viewContainerRef: any) {
      this.rootViewContainer = viewContainerRef;
    }
    addDynamicComponent() {
      const factory = this.factoryResolver.resolveComponentFactory(DynamicTooltip);
      const component = factory.create(this.rootViewContainer.parentInjector);
      this.compo = component;
      this.rootViewContainer.insert(component.hostView);
    }
  }