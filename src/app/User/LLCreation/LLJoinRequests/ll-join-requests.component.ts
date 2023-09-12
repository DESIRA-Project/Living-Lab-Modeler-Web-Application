import {AfterViewChecked, AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {LlJoinRequestService} from "../../../Service/ll-join-request.service";
import {LLJoinRequest} from "../../../Models/LLJoinRequest";
import {AngularServicesProviderService} from "../../../Service/angular-services-provider.service";
import {Response} from "../../../Models/Response/response";
import {ErrorResponse} from "../../../Models/Response/error-response";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {LlUsersManagementComponent} from "../LLUsersManagement/ll-users-management.component";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {
  LlJoinRequestAccompanyingTextPopupComponent
} from "./ll-join-request-accompanying-text-popup/ll-join-request-accompanying-text-popup.component";

@Component({
  selector: 'app-ll-join-requests',
  templateUrl: './ll-join-requests.component.html',
  styleUrls: ['../LLUsersManagement/ll-users-management.component.css', './ll-join-requests.component.css']
})
export class LlJoinRequestsComponent implements OnInit, AfterViewChecked {

  @Input() livingLabId: number | undefined;
  // @ts-ignore
  @Input() dialogRef: MatDialogRef<LlUsersManagementComponent>;
  requests: LLJoinRequest[] = [];
  ready = true;
  displayedColumns: string[] = ['fullName', 'text', 'createdAt', 'actions'];
  dataSource: MatTableDataSource<LLJoinRequest> = new MatTableDataSource<LLJoinRequest>(this.requests);
  // @ts-ignore
  @ViewChild(MatPaginator) paginator: MatPaginator;
  pageSize = 5;
  // @ts-ignore
  @ViewChild(MatSort) sort: MatSort;
  popupDialogRef: MatDialogRef<LlJoinRequestAccompanyingTextPopupComponent> | undefined;

  constructor(private llJoinRequestService: LlJoinRequestService,
              private angularServicesProviderService: AngularServicesProviderService,
              public dialog: MatDialog) {
  }

  ngOnInit(): void {
    // Fetch requests from backend
    if (this.livingLabId) {
      this.llJoinRequestService.getPendingRequests(this.livingLabId).subscribe(
        (response: any) => {
          response.data.forEach((request: any) => {
            request.createdAt = new Date(request.createdAt);
            request.fullName = request.userFirstname + " " + request.userLastname;
          })
          this.requests = response.data;
          this.dataSource.data = this.requests;
          this.ready = true;
        },
        (error: ErrorResponse) => {
          this.angularServicesProviderService.createModalWithGenericErrorMessage();
          return;
        }
      )
    }
  }

  ngAfterViewChecked() {
    if (!this.dataSource.paginator && this.paginator) {
      this.dataSource.paginator = this.paginator
    }
    if (!this.dataSource.sort && this.sort) {
      this.dataSource.sort = this.sort
    }
  }

  acceptRequest(requestId: number): void {
    this.llJoinRequestService.acceptRequest(requestId).subscribe(
      (response: Response<boolean>) => {
        this.dialogRef.close();
        this.angularServicesProviderService.createNewModal().alert(true, 'Request accepted successfully!');
      },
      (error: ErrorResponse) => {
        this.dialogRef.close();
        this.angularServicesProviderService.createModalWithGenericErrorMessage();
      }
    );
  }

  rejectRequest(requestId: number): void {
    this.llJoinRequestService.rejectRequest(requestId).subscribe(
      (response: Response<boolean>) => {
        this.dialogRef.close();
        this.angularServicesProviderService.createNewModal().alert(true, 'Request rejected successfully!');
      },
      (error: ErrorResponse) => {
        this.dialogRef.close();
        this.angularServicesProviderService.createModalWithGenericErrorMessage();
      }
    );
  }

  showAccompanyingTextModal(e: Event, text: string): void {
    const trigger = new ElementRef(e.currentTarget);
    this.popupDialogRef = this.dialog.open(LlJoinRequestAccompanyingTextPopupComponent, {
      backdropClass: 'backdrop-class',
      panelClass: 'classy',
      data: {trigger, text},
    });
  }
}
