import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuardService implements CanActivate {
  constructor(public auth: AuthService, public router: Router,  private route: ActivatedRoute) {}
  //return true if the user is authenticated
  //thus the route is enabled
  //otherwise it navigates the user to the sign in page
  canActivate(): boolean {
   // alert("auth")

    let url = window.location.href;
    if(url.indexOf("?user=") !== -1 ){
      let toks  =  url.split("?user=");
         let token = toks[1];
         this.auth.userManagementService.register({token:token});
         this.router.navigateByUrl(environment.env.signIn.redirectionLink);
         return true;
    }
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['']);
      return false;
    }
    return true;
  }

  //return true if the user is not authenticated
  //thus the route is disabled
  //otherwise it navigates the user to the sign in page
  canDeactivate():boolean{
    //console.log("canDeactivate()");
      if(!this.auth.isAuthenticated()){
        return true;
      }

      return false;
  }
}
