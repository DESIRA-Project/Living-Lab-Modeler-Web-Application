import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {Sunburst} from "./Sunburst";
import {environment} from "../../../../environments/environment";
import * as d3 from "d3";
import {SocioEconomicImpactService} from "../../../Service/socio-economic-impact.service";
import {Response} from "../../../Models/Response/response";

interface Map {
  [key: string]: string | undefined
}

@Component({
  selector: 'app-living-lab-view-page-socio-economic-impact',
  templateUrl: './living-lab-view-page-socio-economic-impact.component.html',
  styleUrls: ['../../living-lab-view-page.component.css', './living-lab-view-page-socio-economic-impact.component.css']
})
export class LivingLabViewPageSocioEconomicImpactComponent implements OnInit {

  @Input() livingLab: any;
  ready = false;
  config = environment.env.livingLabViewPage.socioEconomicImpact;
  figureId = 'socio-economic-impact-graph';
  selectedDigitalTechnologyId: number | undefined;
  data: any;

  colorFunc = (name: string, depth = 1, active = true) => {
    // Initial circle in the middle should be transparent
    if (!(this.config.graph.arcColors as Map)[name])
      return "none";

    depth *= 0.07;  // Tweak for more smooth color changes

    let color;
    if (!active) {  // If arc is inactive mark it with appropriate color
      color = d3.hsl(this.config.graph.inactiveArcColor);
    }
    else {          // If arc is active get is color from config
      color = d3.hsl((this.config.graph.arcColors as Map)[name]!);
    }

    // Return brightened color
    return d3.hsl(color.h, color.s, color.l + depth < 1 ? color.l + depth : 1);
  }

  constructor(private socioEconomicImpactService: SocioEconomicImpactService) { }

  ngOnInit(): void {
    this.fetchData([]);
  }

  fetchData(digitalTechnologyIds: number[]): void {
    this.socioEconomicImpactService.get(this.livingLab.id, digitalTechnologyIds)
      .subscribe(
        (response: Response<any>) => {
          this.data = response.data;
          this.data.name = null;
          this.ready = true;
        }
      )
  }

  @ViewChild('chart', {static: false}) set chart(chart: ElementRef) {
    if (chart) {

      const sunburstConfig = {
        value: (d: any) => d.children && d.children.length > 0 ? null : 1, // size of each node (file); null for internal nodes (folders)
        label: (d: { name: any; }) => d.name, // display name for each cell
        title: (d: { name: any; }) => d.name, // hover text
        fillOpacity: (d: any) => d.data.active ? 0.65 : 0.325,
        width: 700,
        height: 700,
        color: this.colorFunc
      };

      // @ts-ignore
      Sunburst.draw(this.data, this.figureId, sunburstConfig);
    }
  }

  onDigitalTechnologyClick(digitalTechnologyId: number) {
    // In case of unselect
    if (this.selectedDigitalTechnologyId == digitalTechnologyId) {
      this.selectedDigitalTechnologyId = undefined;
      this.ready = false;
      this.fetchData([]);
    }
    // In case of select
    else {
      this.selectedDigitalTechnologyId = digitalTechnologyId;
      this.ready = false;
      this.fetchData([this.selectedDigitalTechnologyId]);
    }
  }

}
