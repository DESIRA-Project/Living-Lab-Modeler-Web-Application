import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from './Auth/auth-guard.service';
import { SignInComponent } from './Auth/signin.component';
import { PageNotFoundComponent } from './PageNotFound/page-not-found.component';
import { UserLandingPageComponent } from './User/user-landing-page.component';
import {LivingLabViewPageComponent} from './living-lab-view-page/living-lab-view-page.component';
import {ActivityViewPageComponent} from './activity-view-page/activity-view-page.component';
import {AddNewActivityComponent} from './add-new-activity/add-new-activity.component';
import {LandingPageComponent} from './landing-page/landing-page.component';
import {ActivityEditComponent} from "./activity-edit/activity-edit.component";
import { PrivacyComponent } from './privacy/privacy.component';
import { AboutComponent } from './about/about.component';
import { ToUComponent } from './tou/tou.component';
import { ContactComponent } from './contact/contact.component';

const routes: Routes = [
  { path: '', component: LandingPageComponent, pathMatch: 'full'},
  { path: 'index', component: LandingPageComponent },
  { path: 'signin', component: SignInComponent },
  { path: 'home', component: UserLandingPageComponent, canActivate:[AuthGuardService] },
  { path: 'my-profile', component: UserLandingPageComponent, canActivate:[AuthGuardService] },  
  { path: 'users-management', component: UserLandingPageComponent, canActivate:[AuthGuardService] },
  { path: 'living-lab-creation', component: UserLandingPageComponent, canActivate:[AuthGuardService] },
  /*{ path: 'living-lab-update', component: UserLandingPageComponent, canActivate:[AuthGuardService] },*/
  { path: 'living-lab-update/:livingLabId', component: UserLandingPageComponent, canActivate:[AuthGuardService] },
  { path: 'my-living-labs', component: UserLandingPageComponent, canActivate:[AuthGuardService] },
  { path: 'all-living-labs', component: UserLandingPageComponent, canActivate:[AuthGuardService] },  
  { path: 'analytics', component: UserLandingPageComponent, canActivate:[AuthGuardService] },
  { path: 'users-management', component: UserLandingPageComponent, canActivate:[AuthGuardService] },
  { path: 'living-lab-management', component: UserLandingPageComponent, canActivate:[AuthGuardService] },
  { path: 'digital-technology-management', component: UserLandingPageComponent, canActivate:[AuthGuardService] },
  { path: 'users-management', component: UserLandingPageComponent, canActivate:[AuthGuardService] },
  { path: 'living-lab-entity-management', component: UserLandingPageComponent, canActivate:[AuthGuardService] },
  { path: 'sdg-management', component: UserLandingPageComponent, canActivate:[AuthGuardService] },
  { path: 'stakeholder-management', component: UserLandingPageComponent, canActivate:[AuthGuardService] },
  { path: 'privacy', component: PrivacyComponent },
  { path: 'about', component: AboutComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'terms-of-use', component: ToUComponent },  
  { path: 'living-lab/:livingLabId', component: LivingLabViewPageComponent},
  { path: 'living-lab/:livingLabId/activity/:activityId', component: ActivityViewPageComponent},
  { path: 'living-lab/:livingLabId/add-new-activity', component: AddNewActivityComponent, canActivate:[AuthGuardService] },
  { path: 'living-lab/:livingLabId/activity/:activityId/edit', component: ActivityEditComponent, canActivate:[AuthGuardService] },

 // { path: '404', component: PageNotFoundComponent },
  { path: '**', redirectTo: '' }
];
@NgModule({
  imports: [RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'enabled', useHash: true// Add options right here
  })], providers: [
    AuthGuardService
],
  exports: [RouterModule]
})
export class AppRoutingModule { }
