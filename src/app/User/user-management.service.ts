import { Injectable, NgZone } from "@angular/core";
import { Router } from "@angular/router";
import { JwtHelperService } from "@auth0/angular-jwt";
import { environment } from "src/environments/environment";
import { Subscriber } from "./subscriber";

@Injectable()
export class UserManagementService{
    private cookieKey:string = environment.env["user-management"] && environment.env["user-management"]["cookie-key"] ? environment.env["user-management"]["cookie-key"] : "gnomee-auth";

    private decodedUserToken:any = null;
    private subs :{ [key: string]: Subscriber; } = {};

    constructor(private jwtHelper:JwtHelperService,private ngZone: NgZone,private router:Router){
         const token = this.getToken();
         if(token === null) return;
         try{
         this.decodedUserToken = this.jwtHelper.decodeToken(token);
         }catch(e){
            //console.log("clear called in ctor()");
             this.clear();
         }
         //console.log(this.decodedUserToken);
    }

    register(user:any):boolean{
        if(user !== null && user.token !== undefined){
            try{
                this.decodedUserToken = this.jwtHelper.decodeToken(user.token);
                localStorage.setItem(this.cookieKey, user.token);
                return true;
            }catch(e){
                //console.log("clear called in register()");
                this.clear();
                return false;
            }
        }
        return false;
    }

    updateToken(attribute:any){
        if(attribute === null) return;
        if(attribute.attribute === undefined) return;
        if(attribute.attribute !== 'token') return;
        if(attribute.data === undefined) return;

        let token = attribute.data;
        /*console.log("updatet token")
        console.log(token);*/
        localStorage.setItem(this.cookieKey, token);
        this.decodedUserToken = this.jwtHelper.decodeToken(token);
        /*console.log(this.decodedUserToken)*/

        for(let key in this.subs){
            this.subs[key].update();
        }
    }

    addSubscriber(key:string, sub:Subscriber){
        this.subs[key] = sub;
    }

    getRouter(){
        return this.router;
    }

    getNGZone(){
        return this.ngZone;
    }

    getUserInfo():any{
        if (this.jwtHelper.isTokenExpired(this.getToken() ?? undefined)) {
          this.clear();
          return null;
        }
        if(this.decodedUserToken !== null){
            return this.decodedUserToken;
        }
        const token = this.getToken();
        if(token === null) { return null; }
        this.decodedUserToken = this.jwtHelper.decodeToken(token);
        return this.decodedUserToken;
    }

    clear(){
        if(this.decodedUserToken === null) {
            return;
        }
        localStorage.removeItem(this.cookieKey);
        let inst = this;
        setTimeout(()=>{
           inst.decodedUserToken = null;
        },1000);

        //this.decodedUserToken = null;
    }

    getToken():string|null{
        if (this.jwtHelper.isTokenExpired(localStorage.getItem(this.cookieKey) ?? undefined)) {
          return null;
        }
        return localStorage.getItem(this.cookieKey);
    }

    getUserPermissions():any{
        if(this.decodedUserToken === null || (this.decodedUserToken !== null &&  this.decodedUserToken.permissions === undefined) ) return null;
        return this.decodedUserToken.permissions;
    }

    userHasPermission(p:string):boolean{
        if(this.decodedUserToken === null || (this.decodedUserToken !== null &&  this.decodedUserToken.permissions === undefined) ) return false;
        return this.decodedUserToken.permissions.indexOf(p) !== -1;
    }

    userHasAdequatePermissions(p:string[]):boolean{
        if(this.decodedUserToken === null || (this.decodedUserToken !== null &&  this.decodedUserToken.permissions === undefined) ) return false;
        let userPermissions = this.decodedUserToken.permissions;
        for(let i = 0;i<p.length;i++){
            if( userPermissions.indexOf(p[i]) !== -1 ){
                return true;
            }
        }
        return false;
    }

}
