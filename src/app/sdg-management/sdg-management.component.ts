import { Component, OnInit } from '@angular/core';
import { AssetsService } from '../Service/assets.service';
import { SDG } from '../Models/SDG';
import { SdgService } from '../Service/sdg.service';
import { SdgEditComponent } from './sdg-edit/sdg-edit.component';
import { Response } from '../Models/Response/response';
import { AngularServicesProviderService } from '../Service/angular-services-provider.service';
import { DynamicModalDialogComponent } from '../ComponentLibrary/DynamicModalDialog/dynamic-modal-dialog.component';
import { IconResourceListComponent } from '../Models/IconResource';


@Component({
  selector: 'app-sdg-management',
  templateUrl: './sdg-management.component.html',
  styleUrls: ['./sdg-management.component.css']
})
export class SdgManagementComponent extends IconResourceListComponent implements OnInit {

  sdgs: SDG[] = [];
  sdgsMap: any = {};
  static numSdgsPerRow = 4;
  sdgsPerRow: SDG[][] = [];
  modalWidth = '45%';
  ready = false;

  fetchData(instance: any = this): void {
    // Get SDGs from backend,
    // fill sdgsMap in the form of sdgId -> sdg,
    // and set up SDGs per row.
    instance.sdgService.getAll().subscribe((response: Response<SDG[]>) => {
      instance.sdgs = response.data;
      for (const item of response.data) {
        instance.sdgsMap[item.id] = item;
      }
      instance.sdgsPerRow = instance.setupIconResourcesPerRow(instance.sdgs);
      instance.sdgsPerRow = instance.recalculateImages(instance.sdgsPerRow);
      instance.ready = true;
    });
  }


  constructor(public sdgService: SdgService,
    public assetsService: AssetsService,
    protected angularServicesProviderService: AngularServicesProviderService) {

    super(assetsService, SdgManagementComponent.numSdgsPerRow);
    this.fetchData();
  }


  ngOnInit(): void {
  }

  // Open DigitalTechnologyEditComponent in modal
  public edit(id: string): void {

    let dyn: DynamicModalDialogComponent = this.angularServicesProviderService.createNewModalWithType(SdgEditComponent);
    let inst = this;

    let getData = () => {
      return {
        handle: dyn,
        sdg: this.sdgsMap[id],
        callback: inst.save,
        parentInstance: inst,
      };
    };

    dyn.performStatusMonitoredOperationCustom(getData, () => {
      inst.ready = false;
      inst.fetchData();
    },'editSDGModal')
  }


  public save(instance: any, editedSdg: SDG, uploadedFile: File | null): void {

    instance.angularServicesProviderService.createNewModal().performServiceCallAndShowResponseWithConfirmation(
      instance.sdgService.update(editedSdg, uploadedFile),
      instance.fetchData,
      instance
    );
  }


  public deleteOne(id: string): void {
    this.sdgService.canBeSafelyRemoved(parseInt(id)).subscribe((res: Response<Boolean>) => {
      let message = res.data ? 'This SDG is referenced in multiple Living Labs. Are you sure you want to delete this SDG?' :
      'Are you sure you want to delete this SDG?';


      this.angularServicesProviderService.createNewResponsiveModal().performServiceCallAndShowResponseWithConfirmation(
        this.sdgService.deleteOne(id),
        this.fetchData,
        this,
        message
      );

    });
  }

  initializeWithAuthData(): void { }

}
