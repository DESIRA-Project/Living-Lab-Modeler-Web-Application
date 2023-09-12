import { Component, ElementRef, Input, ViewChild } from "@angular/core";
import html2canvas from "html2canvas";
import { HierarchicalEdgeBundling } from "src/app/living-lab-view-page/tabs/living-lab-view-page-scp-system/HierarchicalEdgeBundling";
import { LivingLabViewPageScpSystemComponent } from "src/app/living-lab-view-page/tabs/living-lab-view-page-scp-system/living-lab-view-page-scp-system.component";
import { SCPGraphController } from "src/app/Models/SCPGraphController";
import { ScreenshotService } from "src/app/Service/screenshot.service";
import { environment } from "src/environments/environment";
@Component({
    selector: 'll-scp-graph',
    templateUrl: './ll-scp-graph.component.html',
    /*    styleUrls: ['./living-lab-view-page-scp-system.component.css']*/
})
export class LLSCPGraphComponent extends LivingLabViewPageScpSystemComponent {

    parent:SCPGraphController|null = null;
    public static readonly screenshot: string = "scpGraph";

    @Input()
    set controller(controller:SCPGraphController){
       this.parent = controller;
    }

    constructor(protected screenshotService: ScreenshotService){
        super();
    }
    
    ngOnInit(): void {
        this.delimiter = '.';
        this.graphData = [{
            "name": "scp.Physical. ",
            "connections": [
            ]
        },
        {
            "name": "scp.Socio. ",
            "connections": [

            ]
        },
        {
            "name": "scp.Cyber. ",
            "connections": [
            ]
        }];


        this.config = environment.env.livingLabViewPage.scpSystem;
        this.dataReady = true;
    }

    @ViewChild('chartView', {static: false}) set chart(chart: ElementRef) {

        if (chart) {
          this.graph = new HierarchicalEdgeBundling(this.graphData, this.delimiter, this.config.scpGraph);
          this.graph.draw(this.graphId, this.descriptionTextId);
          this.parent?.setSCPGraph(this);
        }
    }

    redraw(data:any){
        if(data){
            this.graph.redraw(data,this.graphId, this.descriptionTextId);
            this.captureMapScreenshot();
        }
    }

    private captureMapScreenshot() {
        if(this.screenshotService.isServiceDisabled()) return;
        let inst = this;
        this.parent?.onScreenshotLoad();
         return new Promise(async (resolve, reject) => {
             let e = document.getElementById(this.graphId);
             if (e) {
                 var html2canvasstartTime = performance.now()
                 html2canvas(e, {
                     allowTaint: true,
                     scale: 3,
                     useCORS: true,
                     logging : false,
                 }).
                     then(canvas => {
                         var html2canvasendTime = performance.now();
                         console.log(`Call to the html2canvas took ${html2canvasendTime - html2canvasstartTime} milliseconds`)
                         var startTime = performance.now()
                         var imgData = canvas.toDataURL("image/png");
                        // inst.mapScreenshot = imgData;
                        //console.log(imgData)
                        inst.screenshotService.add(LLSCPGraphComponent.screenshot, imgData);
                        this.parent?.screenshotReady();
                         var endTime = performance.now()
                         console.log(`Call to then block took ${endTime - startTime} milliseconds`)
                     });
             }
         });
     }


}