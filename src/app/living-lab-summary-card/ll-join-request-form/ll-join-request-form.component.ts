import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {LlJoinRequestService} from "../../Service/ll-join-request.service";
import {Response} from "../../Models/Response/response";
import {AngularServicesProviderService} from "../../Service/angular-services-provider.service";
import {ErrorResponse} from "../../Models/Response/error-response";

@Component({
  selector: 'app-ll-join-request-form',
  templateUrl: './ll-join-request-form.component.html',
  styleUrls: ['./ll-join-request-form.component.css', '../living-lab-summary-card.component.css']
})
export class LlJoinRequestFormComponent implements OnInit {

  text = '';

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              public dialogRef: MatDialogRef<LlJoinRequestFormComponent>,
              private llJoinRequestService: LlJoinRequestService,
              private angularServicesProviderService: AngularServicesProviderService) { }

  ngOnInit(): void {
  }

  submitRequest(): void {
    this.llJoinRequestService.addRequest({livingLabId: this.data.ll.id, text: this.text}).subscribe(
      (response: Response<boolean>) =>
        this.angularServicesProviderService.createNewModal().alert(true, 'Request sent successfully'),
      (error: ErrorResponse) =>
        this.angularServicesProviderService.createModalWithGenericErrorMessage()
    );
  }

}
