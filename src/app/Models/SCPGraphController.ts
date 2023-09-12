import { HierarchicalEdgeBundling } from "../living-lab-view-page/tabs/living-lab-view-page-scp-system/HierarchicalEdgeBundling";
import { LLSCPGraphComponent } from "../User/LLCreation/LLSCPEntities/ll-scp-graph.component";
import { ScreenshotCapturer } from "./ScreenshotCapturer";

export interface SCPGraphController extends ScreenshotCapturer{
        setSCPGraph(graph:LLSCPGraphComponent):void;
        redraw():void;
   
};