import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[dynamicContent]',
})
export class DynamicContentDirective {
  constructor(public viewContainerRef: ViewContainerRef) {
   }
}