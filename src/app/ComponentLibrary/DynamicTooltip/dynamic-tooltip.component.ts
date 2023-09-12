import { Component, ViewChild } from '@angular/core'
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { DynamicComponent } from '../DynamicModal/dynamic-component'
@Component({
  selector: 'xx',
  template: `<div class="tooltip" id="tt">
  <span class="tooltiptext"></span>
</div>`,
styleUrls: ['../../style/tooltip.css'],
})
export class DynamicTooltip implements DynamicComponent {
  
  @ViewChild('tt', { static: false })
  mytooltip!: NgbTooltip; 
  
    constructor(){

    }

    attachToElement(el: HTMLElement): void {
      console.log(el);
      console.log(document.getElementById("tt"));
      let ell = document.getElementById("tt");
  
      

      let _el = document.getElementById('currentLabel')
/*
      if(ell !== null && el.parentElement){
        console.log(this.mytooltip);
      el.parentElement.appendChild(ell);
      console.log(el.parentElement)
      this.mytooltip.open();
      }*/
      if(_el && ell){
      //  console.log(_el.parentElement)
        _el.appendChild(ell);
//        console.log(el.parentElement)
        //this.mytooltip.container = "currentLabel";
        //this.mytooltip.closeDelay = 2000;
        //this.mytooltip.open();  
      }

  //  throw new Error('Method not implemented.');
    }

    open(): void {
        this.mytooltip.open();
    }
  
    close(): void {
         // throw new Error('Method not implemented.')
    }
}