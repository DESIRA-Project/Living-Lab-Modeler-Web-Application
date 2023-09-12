import { BreakpointObserver, BreakpointState } from "@angular/cdk/layout/breakpoints-observer";

export class CardRenderableComponent{
    renderInCard = true;

    constructor(public breakpointObserver: BreakpointObserver, public width:string,public showLogs:boolean){
        let inst = this;
        this.breakpointObserver
        .observe(['(min-width: '+width+')'])
        .subscribe((state: BreakpointState) => {
          if (state.matches) {
            inst.renderInCard = true;
            if(inst.showLogs){
                console.log('Viewport width is greater than '+inst.width+"!");
            }
        } else {
            if(inst.showLogs){
                console.log('Viewport width is less than '+inst.width+"!");
            }
            inst.renderInCard = false;
          }
        });
    }
}