import { BreakpointObserver } from "@angular/cdk/layout";
import { Component } from "@angular/core";
import { BreadcrumbController } from "../Breadcrumb/breadcrumb-controller";
import { BreadcrumbComponent } from "../Breadcrumb/breadcrumb.component";
import { CardRenderableComponent } from "../CardRenderableComponent/card-renderable.component";

@Component({
    selector: 'tou',
    templateUrl: './tou.component.html',
    styleUrls:['../CardRenderableComponent/card-renderable.component.css']
})
export class ToUComponent extends CardRenderableComponent implements BreadcrumbController{
    private breadcrumb: BreadcrumbComponent | null = null;
    title = "Terms of Use";
    toolData : any = {toolName:"LLM", introToolName:"Living Lab Modeler (LLM)"};
    privacyLink = "#/llm/privacy";

    constructor(public breakpointObserver: BreakpointObserver){
        super(breakpointObserver,"500px",false);

    }
    setBreadcrumb(inst: BreadcrumbComponent): void {
        if (inst !== null) {
            this.breadcrumb = inst;
            this.breadcrumb.setLabel("Terms of Use");
        }
    }

    setLabel(label: string): void {
        if (this.breadcrumb !== null) {
            this.breadcrumb.setLabel(label);
        }
    }

    setPath(path: any[] | undefined): void {
        if (this.breadcrumb !== null) {
            if (path === undefined) {
                this.breadcrumb.setPath(null);
            }
            else {
                this.breadcrumb.setPath(path);
            }
        }
    }
}