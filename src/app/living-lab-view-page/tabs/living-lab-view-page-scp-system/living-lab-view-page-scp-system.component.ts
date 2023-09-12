import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {HierarchicalEdgeBundling} from './HierarchicalEdgeBundling';
import {environment} from '../../../../environments/environment';

@Component({
  selector: 'app-living-lab-view-page-scp-system',
  templateUrl: './living-lab-view-page-scp-system.component.html',
  styleUrls: ['./living-lab-view-page-scp-system.component.css']
})
export class LivingLabViewPageScpSystemComponent implements OnInit {

  @Input() livingLab: any;
  config: any;
  dataReady = false;
  graphId = 'scp-graph';
  descriptionTextId = 'scp-description';
  scpEntitiesDictionary: {[index: number]: any} = {};
  scpEntityConnectionDescriptions: {[index: string]: string} = {};
  graphData: any[] = [];
  graph: any;
  delimiter = '~';

  constructor() { }

  ngOnInit(): void {

    this.config = environment.env.livingLabViewPage.scpSystem;

    // Index scp entities based on id,
    // and initialize an empty list of connections for each one
    for (const scpEntity of this.livingLab.scpEntities) {
      this.scpEntitiesDictionary[scpEntity.id] = scpEntity;
      this.scpEntitiesDictionary[scpEntity.id].connections = [];
    }

    // Iterate over this.livingLab.scpEntityConnections
    // and populate connections field with dotted scp entity names
    // e.g.
    // "connections": [
    //    "scp.cyber.E-governance digital platforms",
    //    "scp.socio.Regional authorities & water management administrative units"
    // ]
    //
    // Also, populate scpEntityConnectionDescriptions dictionary like below
    // e.g.
    // {
    //    "1~3": "Connection description from node with id 1 to node with id 3",
    //    "1~5": "Connection description from node with id 1 to node with id 5"
    //    ...
    // }
    for (const scpEntityConnection of this.livingLab.scpEntityConnections) {

      this.scpEntitiesDictionary[scpEntityConnection.source].connections
        .push(
          this.getDottedScpEntityName(
            this.scpEntitiesDictionary[scpEntityConnection.destination]
          )
        );

      this.scpEntityConnectionDescriptions[scpEntityConnection.source + this.delimiter + scpEntityConnection.destination] =
        '<b>' +
        this.scpEntitiesDictionary[scpEntityConnection.source].name
        + ' - '
        + this.scpEntitiesDictionary[scpEntityConnection.destination].name
        + '</b><br><br>'
        + scpEntityConnection.description;
    }

    // Finally, push data into graphData list as needed by the d3 code
    // e.g.
    // {
    //     "name":"scp.socio.Local community",
    //     "connections":[
    //         "scp.cyber.E-governance digital platforms",
    //         "scp.socio.Regional authorities & water management administrative units"
    //     ]
    // },
    for (const scpEntity of this.livingLab.scpEntities) {
      const id = scpEntity.id;
      const name = this.getDottedScpEntityName(scpEntity);
      const connections = this.scpEntitiesDictionary[scpEntity.id].connections;
      const description = '<b>' + name.split(this.delimiter)[2] + '</b><br><br>' + scpEntity.description;
      this.graphData.push({
        id,
        name,
        connections,
        description
      });
    }

    this.dataReady = true;
  }


  @ViewChild('chart', {static: false}) set chart(chart: ElementRef) {
    if (chart) {
      this.graph = new HierarchicalEdgeBundling(this.graphData, this.delimiter, this.config.scpGraph, this.scpEntityConnectionDescriptions);
      this.graph.draw(this.graphId, this.descriptionTextId);
    }
  }


  // Converts a scp entity
  // {
  //     "id":3,
  //     "name":"Irrigation Network",
  //     "group":"Cyber"
  // }
  // to string
  // "Scp.Cyber.Irrigation Network"
  // as needed by the d3 code
  getDottedScpEntityName(scpEntity: any): string {
    return 'SCP' + this.delimiter + scpEntity.group + this.delimiter + scpEntity.name;
  }

}
