import {AfterViewInit, Component, EventEmitter, OnInit, ViewChild} from '@angular/core';
import {StakeholderService} from '../Service/stakeholder.service';
import {Stakeholder} from '../Models/Stakeholder';
import {SelectionModel} from '@angular/cdk/collections';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import {merge, of} from 'rxjs';
import {catchError, map, startWith, switchMap} from 'rxjs/operators';
import {StakeholderDetailsComponent} from './stakeholder-details/stakeholder-details.component';
import {AddNewStakeholderComponent} from './add-new-stakeholder/add-new-stakeholder.component';
import {PageResponse} from '../Models/Response/response';
import {AngularServicesProviderService} from '../Service/angular-services-provider.service';
import { DynamicModalDialogComponent } from '../ComponentLibrary/DynamicModalDialog/dynamic-modal-dialog.component';
import { getLimitedString } from '../Service/common';

@Component({
  selector: 'app-stakeholder-management',
  templateUrl: './stakeholder-management.component.html',
  styleUrls: ['./stakeholder-management.component.css']
})
export class StakeholderManagementComponent implements OnInit, AfterViewInit {

  stakeholders: Stakeholder[] = [];
  displayedColumns: string[] = ['select', 'name', 'description', 'lastAddedAt', 'moderated', 'actions'];
  dataSource = new MatTableDataSource<Stakeholder>(this.stakeholders);
  selection = new SelectionModel<Stakeholder>(true, []);
  // @ts-ignore
  @ViewChild(MatSort) sort: MatSort;
  // @ts-ignore
  @ViewChild(MatPaginator) paginator: MatPaginator;
  resultsLength = 0;
  isLoadingResults = true;
  filterBy: string | null = null;
  filterEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
  refreshEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
  resetPageIndex = true;
  modalWidth = '45%';
  filterTimer: NodeJS.Timeout | undefined;
  filterTimeoutInterval = 300;   /** Wait 300 milliseconds before actually searching for what the user typed */


  constructor(private stakeholderService: StakeholderService,
              private angularServicesProviderService: AngularServicesProviderService) {
  }


  ngOnInit(): void {
  }


  ngAfterViewInit(): void {

    /** Each time on of the following event emitters get triggered, run the following code which updates the table data */
    merge(this.sort.sortChange, this.paginator.page, this.filterEvent, this.refreshEvent)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this.stakeholderService.get(this.filterBy,
            this.sort.active,
            this.sort.direction,
            this.paginator.pageIndex,
            this.paginator.pageSize);
        }),
        map((response: PageResponse<Stakeholder>) => {
          this.isLoadingResults = false;
          this.resultsLength = response.totalCount;
          return response.data;
        }),
        catchError(() => {
          this.isLoadingResults = false;
          return of({});
        })
      ).subscribe((data: any) => {
      this.stakeholders = data;
      this.stakeholders.forEach((stakeholder: Stakeholder) => stakeholder.lastAddedAt = new Date(stakeholder.lastAddedAt ? stakeholder.lastAddedAt : 0));
      this.dataSource.data = this.stakeholders;
      this.paginator.length = this.resultsLength;
      if (this.resetPageIndex) {
        this.dataSource.paginator?.firstPage();
      }
      this.resetPageIndex = true;
    });
  }


  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }


  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle(): void {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }


  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: Stakeholder): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${this.stakeholders.indexOf(row) + 1}`;
  }


  resetPaging(): void {
    this.paginator.pageIndex = 0;
  }


  public initializeWithAuthData(): void {}


  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.filterBy = filterValue.trim().toLowerCase();

    /** If timer was running, cancel it because user typed something new */
    if (this.filterTimer) {
      clearTimeout(this.filterTimer);
    }

    /** Wait 'this.filterTimeoutInterval' milliseconds before emitting the signal for the actual filtering */
    this.filterTimer = setTimeout(() => this.filterEvent.emit(), this.filterTimeoutInterval);
  }


  /** Verify stakeholders */
  verify(stakeholders: Stakeholder[]): void {
    const ids = stakeholders.map((stakeholder: Stakeholder) => stakeholder.id);
    this.selection.clear();
    this.resetPageIndex = false;
    this.angularServicesProviderService.createNewModal().performServiceCallAndShowResponseWithConfirmationCustom('verifyStakeholderModal', this.stakeholderService.verify(ids),
      (instance: any) => instance.refreshEvent.emit(),
      this);
  }

  /** Un-verify stakeholders */
  unverify(stakeholders: Stakeholder[]): void {
    const ids = stakeholders.map((stakeholder: Stakeholder) => stakeholder.id);
    this.selection.clear();
    this.resetPageIndex = false;
    this.angularServicesProviderService.createNewModal().performServiceCallAndShowResponseWithConfirmationCustom('verifyStakeholderModal',this.stakeholderService.unverify(ids),
      (instance: any) => instance.refreshEvent.emit(),
      this);
  }

  public getLimitedDescription(value:string){
    return getLimitedString(value, 20);
}

  stakeholderDetails(stakeholder: Stakeholder): void {

    /** Open modal showing stakeholder details */
      let inst = this;
      inst.stakeholderService.getLivingLabs(stakeholder.id).subscribe(
        response => {
          const dyn: DynamicModalDialogComponent = inst.angularServicesProviderService.createNewModalWithType(StakeholderDetailsComponent);

          const getData = () => {
              return {
                entity: null,
                handle: dyn,
                stakeholder: stakeholder,
                livingLabsPerStakeholder: response.data};
          };

          // Perform appropriate action upon closing
          dyn.performResultStatusMonitoredOperationCustom('editStakeholderModal',getData, (returnedValue: string) => {
            switch (returnedValue) {
              case 'moderate': {
                if (!stakeholder.moderated) {
                  inst.verify([stakeholder]);
                }
                else {
                  inst.unverify([stakeholder]);
                }
                break;
              }

              case 'delete': {
                inst.angularServicesProviderService.createNewModal().performServiceCallAndShowResponseWithConfirmationCustom('editStakeholderModal',inst.stakeholderService.deleteOne(stakeholder.id),
                  (instance: any) => instance.refreshEvent.emit(),
                  inst,
                  'Are you sure you want to delete this stakeholder entity?');
                break;
              }

              case 'edit': {
                inst.angularServicesProviderService.createNewModal().performServiceCallAndShowResponseWithConfirmation(inst.stakeholderService.update(stakeholder),
                  (instance: any) => instance.refreshEvent.emit(),
                  inst);
                break;
              }
            }
          }, false);

    });
  }


  addNewStakeholder(): void {
    /** Open modal for adding new stakeholder */
    let inst = this;
    this.angularServicesProviderService.createNewModalWithType(AddNewStakeholderComponent).afterClosedOnResultCustom('addStakeholderModal')?.subscribe( (stakeholder:Stakeholder) =>{
      if (stakeholder) {
        inst.angularServicesProviderService.createNewModal().performServiceCallAndShowResponseWithConfirmation(
          inst.stakeholderService.add(stakeholder),
          (instance: any) => instance.refreshEvent.emit(),
          inst);
      }
    });


  }

}
