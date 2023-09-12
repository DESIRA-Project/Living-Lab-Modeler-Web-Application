import { Component, NgZone, OnInit } from '@angular/core';
import { LivingLabService } from '../Service/living-lab.service';
import { PageResponse, Response } from '../Models/Response/response';
import { ErrorResponse } from '../Models/Response/error-response';
import { AuthService } from '../Auth/auth.service';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { AngularServicesProviderService } from "../Service/angular-services-provider.service";
import { PaginatedResponse } from '../User/Admin/LivingLabEntityManagement/paginated-scp-entity-response';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css']
})
export class LandingPageComponent implements OnInit {

  publishedLivingLabs: any[] = [];
  currentPage = 0;
  llsPerPage = 4;
  totalCount = 0;
  ready = false;
  fetched = 0;

  constructor(private router: Router,
    private ngZone: NgZone,
    private authService: AuthService,
    private livingLabService: LivingLabService,
    private angularServicesProviderService: AngularServicesProviderService) {

    if (this.authService.isAuthenticated()) {
      this.navigateToUserProfile();
      return;
    }

    this.fetchAllPublished();

  }

  ngOnInit(): void {
  }

  showMore() {
    this.ready = false;
    this.currentPage++;
    this.fetchAllPublished();
  }

  hasMore(): boolean {
    if (!this.ready) return false;
    if (!this.totalCount) return false;
    if (this.fetched === this.totalCount && this.totalCount > 0) return false;
    return true;
  }

  fetchAllPublished() {
    this.livingLabService.getPublishedLivingLabs(this.currentPage, this.llsPerPage).subscribe(
      (response: PageResponse<any>) => {

        if (response && response.data) {
          for (let i = 0; i < response.data.length; i++) {
            this.publishedLivingLabs.push(JSON.parse(JSON.stringify(response.data[i])));
          }
          this.fetched += response.data.length;
          this.totalCount = response.totalCount;
        }
        this.ready = true;
      },
      (error: ErrorResponse) => {
        console.log('error: ' + error.error.message);
        this.angularServicesProviderService.createModalWithGenericErrorMessage();
        this.ready = true;

      }
    );
  }

  fetchAllPublic() {
    this.livingLabService.getPublicLivingLabs().subscribe(
      (response: Response<any>) => {
        this.publishedLivingLabs = response.data;
        this.ready = true;

      },
      (error: ErrorResponse) => {
        console.log('error: ' + error.error.message);
        this.angularServicesProviderService.createModalWithGenericErrorMessage();
      }
    );
  }

  private navigateToUserProfile(): void {
    this.ngZone.run(() => {
      this.router.navigateByUrl(environment.env.signIn.redirectionLink);
    });
  }

  public navigateToSignIn():void{
    this.ngZone.run(() => {
      this.router.navigateByUrl(environment.env.signIn.link);
    });
  }

}
