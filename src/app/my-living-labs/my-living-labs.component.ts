import { BreakpointObserver } from "@angular/cdk/layout";
import { Component, OnInit } from '@angular/core';
import {LivingLabService} from '../Service/living-lab.service';
import {Response} from '../Models/Response/response';
import {ErrorResponse} from '../Models/Response/error-response';
import {UserManagementService} from '../User/user-management.service';
import { UserLivingLab } from '../Models/UserLivingLab';
import {Router} from '@angular/router';
import {AngularServicesProviderService} from "../Service/angular-services-provider.service";
import {Deepcopy} from "../Utils/deepcopy";
import {MessageService} from "../Service/message.service";
import { DynamicContent } from '../ComponentLibrary/DynamicModal/dynamic-content.component';
import { DynamicContentParent } from '../ComponentLibrary/DynamicModal/dynamic-content-parent';
import { DynamicItem } from '../ComponentLibrary/DynamicModal/dynamic-item.components';
import { DynamicModalContainer } from '../ComponentLibrary/DynamicModal/dynamic-modal-container';
import { Navigationable } from '../Models/Navigationable';
import { CardRenderableComponent } from '../CardRenderableComponent/card-renderable.component';

@Component({
  selector: 'app-my-living-labs',
  templateUrl: './my-living-labs.component.html',
  styleUrls: ['./my-living-labs.component.css']
})
export class MyLivingLabsComponent extends CardRenderableComponent implements OnInit, DynamicContent, Navigationable {

  userId = -1;
  livingLabs: any[] = [];
  creatorOf: any[] = [];
  memberOf: { [id: number]: any[] } = {};
  initialDisplayedLivingLabs: any[] = [];
  displayedLivingLabs: any[] = [];

  // llUserRoles = {
  //    llUserRole1.id: llUserRole.role,
  //    llUserRole2.id: llUserRole.role,
  //    ...
  // }
  llUserRoles: {[key: number]: string} = {};
  llUserRolesIds: number[] = [];
  roleIdOfActiveFilter: number | undefined;
  parent:DynamicContentParent | undefined;
  ready = false;

  constructor(public breakpointObserver: BreakpointObserver, private userManagementService: UserManagementService,
              private livingLabService: LivingLabService,
              private router: Router,
              private angularServicesProviderService: AngularServicesProviderService,
              private messageService: MessageService) {
                super(breakpointObserver,"500px",false);
    if (!this.userManagementService.getUserInfo()) {
      this.router.navigate(['/']);
    }
    this.userId = userManagementService.getUserInfo().id;
  }
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
    this.parent = parent;
  }

  goToPage(url:string){
    this.parent?.goToPage(url);
  }
  isDirty?(): boolean {
    return false;
  }

  ngOnInit(): void {
     this.fetchLLs();
     this.checkForMessages();
  }

  checkForMessages(): void {
    const message: string | undefined = this.messageService.pop();
    if (message) {
      this.angularServicesProviderService.createNewModal().alert(true, message);
      this.messageService.clear();
    }
  }

  fetchLLs(): void {
    this.livingLabService.getUserLivingLabs(this.userId).subscribe(
      (response: Response<UserLivingLab[]>) => {
        this.livingLabs = response.data;

        // Re initialize
        this.creatorOf = [];
        this.memberOf = {};
        this.displayedLivingLabs = [];
        this.llUserRoles = {};
        this.llUserRolesIds = [];
        this.roleIdOfActiveFilter = undefined;

        if (this.livingLabs.length === 0) {
          this.ready = true;
          return;
        }

        this.livingLabs.forEach(livingLab => {
          if (livingLab.creatorId === this.userId) {
            this.creatorOf.push(livingLab);
            livingLab.chipText = 'Creator';
            this.displayedLivingLabs.push(livingLab);
          }
          else {
            if (this.memberOf[livingLab.llUserRole.id] === undefined) {
              this.memberOf[livingLab.llUserRole.id] = [];
            }
            this.memberOf[livingLab.llUserRole.id].push(livingLab);

            if (this.llUserRoles[livingLab.llUserRole.id] === undefined) {
              this.llUserRoles[livingLab.llUserRole.id] = livingLab.llUserRole.role;
            }

            // From 'Living Lab Facilitator', keep only 'Facilitator'
            livingLab.chipText = livingLab.llUserRole.role.split(' ').pop();

            this.displayedLivingLabs.push(livingLab);
          }

          this.llUserRolesIds = Object.keys(this.llUserRoles).map(Number)
          this.initialDisplayedLivingLabs = Deepcopy.copy(this.displayedLivingLabs);
          this.ready = true;
        });
      },
      (error: ErrorResponse) => {
        console.log('error');
        console.log(error);
        this.angularServicesProviderService.createModalWithGenericErrorMessage();
      }
    );
  }

  redraw(): void {
      this.ready = false;
      this.fetchLLs();
  }

  filterByCreator(): void {
    this.ready = false;
    this.displayedLivingLabs = Deepcopy.copy(this.initialDisplayedLivingLabs.filter(livingLab => livingLab.creatorId === this.userId));
    this.roleIdOfActiveFilter = 0;
    this.ready = true;
  }

  filterByRoleId(roleId: number): void {
    this.ready = false;
    this.displayedLivingLabs = Deepcopy.copy(this.initialDisplayedLivingLabs.filter(livingLab => livingLab.llUserRole.id === roleId));
    this.roleIdOfActiveFilter = roleId;
    this.ready = true;
  }

  clearFilter(): void {
    this.ready = false;
    this.displayedLivingLabs = Deepcopy.copy(this.initialDisplayedLivingLabs);
    this.roleIdOfActiveFilter = undefined;
    this.ready = true;
  }

}
