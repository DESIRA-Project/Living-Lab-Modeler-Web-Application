import { Component, OnInit } from '@angular/core';
import {LivingLabService} from '../Service/living-lab.service';
import {Response} from '../Models/Response/response';
import {ErrorResponse} from '../Models/Response/error-response';
import {AngularServicesProviderService} from "../Service/angular-services-provider.service";
import { DynamicContent } from '../ComponentLibrary/DynamicModal/dynamic-content.component';
import { DynamicContentParent } from '../ComponentLibrary/DynamicModal/dynamic-content-parent';
import { DynamicItem } from '../ComponentLibrary/DynamicModal/dynamic-item.components';
import { DynamicModalContainer } from '../ComponentLibrary/DynamicModal/dynamic-modal-container';

@Component({
  selector: 'app-public-living-labs',
  templateUrl: './public-living-labs.component.html',
  styleUrls: ['../my-living-labs/my-living-labs.component.css', './public-living-labs.component.css']
})
export class PublicLivingLabsComponent implements OnInit, DynamicContent {

  ready = false;
  publicLivingLabs: any[] = [];

  constructor(private livingLabService: LivingLabService,
              private angularServicesProviderService: AngularServicesProviderService) { }
  data: any;
  initialize(parent: DynamicModalContainer): void {

  }
  getUserToken(): string | null {
   return null;
  }
  initializeWithAuthData(userToken: string): void {

  }
  setDependencies(dependencies: DynamicItem[]): void {

  }
  setParent(parent: DynamicContentParent | undefined): void {

  }
  isDirty?(): boolean {
     return false;
  }

  ngOnInit(): void {
    this.livingLabService.getPublicLivingLabs().subscribe(
      (response: Response<any>) => {
        this.publicLivingLabs = response.data;
        this.ready = true;
      },
      (error: ErrorResponse) => {
        console.log('error: ' + error.error.message);
        this.angularServicesProviderService.createModalWithGenericErrorMessage();
      }
    );
  }

}
