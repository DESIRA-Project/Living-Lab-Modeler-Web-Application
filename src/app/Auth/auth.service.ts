import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { UserManagementService } from '../User/user-management.service';
@Injectable({ providedIn: 'root' })

export class AuthService {
  constructor(public jwtHelper: JwtHelperService, public userManagementService: UserManagementService) {}
  // ...
  public isAuthenticated(): boolean {
    const token = this.userManagementService.getToken();//localStorage.getItem('gnomee-auth');
    // Check whether the token is expired and return
    // true or false
    let b:boolean = token !== null ? !this.jwtHelper.isTokenExpired(token) : false;
/*    console.log("isAuthenticated() " + b);
    console.log((new Error).stack);*/
    return token !== null ? !this.jwtHelper.isTokenExpired(token) : false;
  }
}