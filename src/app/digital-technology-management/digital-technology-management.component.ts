/*
TODO: - Check title and or description y-axis overflow
 */

import {Component, OnInit} from '@angular/core';
import {DigitalTechnologyService} from '../Service/digital-technology.service';
import {DigitalTechnologyEditComponent} from './digital-technology-edit/digital-technology-edit.component';
import {AssetsService} from '../Service/assets.service';
import {DigitalTechnology} from '../Models/DigitalTechnology';
import { AlertSupportingComponent } from '../User/alert-supporting-component';
import {Response} from '../Models/Response/response';
import {AngularServicesProviderService} from '../Service/angular-services-provider.service';
import { DynamicModalDialogComponent } from '../ComponentLibrary/DynamicModalDialog/dynamic-modal-dialog.component';
import { IconResourceListComponent } from '../Models/IconResource';
import { DigitalTechnologyAddComponent } from './digital-technology-add/digital-technology-add.component';


@Component({
  selector: 'app-digital-technology-management',
  templateUrl: './digital-technology-management.component.html',
  styleUrls: ['./digital-technology-management.component.css']
})
export class DigitalTechnologyManagementComponent extends IconResourceListComponent implements OnInit {

  digitalTechnologies: DigitalTechnology[] = [];
  digitalTechnologiesMap: any = {};
  static numDigitalTechnologiesPerRow = 4;
  digitalTechnologiesPerRow: DigitalTechnology[][] = [];
  modalWidth = '45%';
  ready = false;

  fetchData(instance: any = this): void {
    // Get digital technologies from backend,
    // fill digitalTechnologiesMap in the form of digitalTechnologyId -> digitalTechnology,
    // and set up digital technologies per row.
    instance.ready = false;
    instance.digitalTechnologyService.getAll().subscribe((response: Response<DigitalTechnology[]>) => {
      instance.digitalTechnologies = response.data;
      for (const item of response.data) {
        instance.digitalTechnologiesMap[item.id] = item;
      }
      instance.digitalTechnologiesPerRow = instance.setupIconResourcesPerRow(instance.digitalTechnologies);
      instance.digitalTechnologiesPerRow = instance.recalculateImages(instance.digitalTechnologiesPerRow);
      instance.ready = true;
    });
  }

  initializeWithAuthData(): void {}

  constructor(public digitalTechnologyService: DigitalTechnologyService,
              protected assetsService: AssetsService,
              protected angularServicesProviderService: AngularServicesProviderService) {
    super(assetsService, DigitalTechnologyManagementComponent.numDigitalTechnologiesPerRow);
    this.fetchData();
  }

  ngOnInit(): void {
  }

  // Open DigitalTechnologyEditComponent in modal
  public edit(id: string): void {

    let dyn: DynamicModalDialogComponent = this.angularServicesProviderService.createNewModalWithType(DigitalTechnologyEditComponent);
    let inst = this;

    let getData = () => {
        return { 
          handle: dyn, 
          digitalTechnology: inst.digitalTechnologiesMap[id],    
          allTechs: inst.digitalTechnologies,         
          callback: inst.save,  
          parentInstance: inst,
        };
    };

    dyn.performStatusMonitoredOperationCustom(getData, () => {
        inst.ready = false;
        inst.fetchData();
    },'addNewTechnologyModal')    
  }


  public add(){
    let dyn: DynamicModalDialogComponent = this.angularServicesProviderService.createNewModalWithType(DigitalTechnologyAddComponent);
    let inst = this;

    let getData = () => {
        return { 
          handle: dyn,       
          digitalTechnology: {} as DigitalTechnology,
          allTechs: inst.digitalTechnologies,   
          callback: inst.register,  
          parentInstance: inst,
        };
    };

    dyn.performStatusMonitoredOperationCustom(getData, () => {
        inst.ready = false;
        inst.fetchData();
    },'addNewTechnologyModal')   
  }


  /*
  * Callback function for DigitalTechnologyEditComponent to call when user presses the save button
  * */
  public save(instance: any, editedDigitalTechnology: DigitalTechnology, uploadedFile: File | null): void {
    instance.angularServicesProviderService.createNewModal().performServiceCallAndShowResponseWithConfirmationCustom('saveConfirmationModal',
      instance.digitalTechnologyService.update(editedDigitalTechnology, uploadedFile),
      instance.fetchData,
      instance
    );
  }

  public register(instance: DigitalTechnologyManagementComponent, dt: DigitalTechnology, uploadedFile: File | null): void {
    instance.angularServicesProviderService.createNewModal().performServiceCallAndShowResponseWithConfirmation(
      instance.digitalTechnologyService.add(dt, uploadedFile),
      instance.fetchData,
      instance
    );
  }


  public deleteOne(id: string): void {

    this.digitalTechnologyService.canBeSafelyRemoved(parseInt(id)).subscribe((res:Response<Boolean>)=>{
          let message = res.data ? 'This Digital Technology is referenced in multiple Living Labs. Are you sure you want to delete this Digital Technology?' :
          'Are you sure you want to delete this Digital Technology?';

          this.angularServicesProviderService.createNewResponsiveModal().performServiceCallAndShowResponseWithConfirmation(
            this.digitalTechnologyService.deleteOne(id),
            this.fetchData,
            this,
            message
          );
    });
  }

}
