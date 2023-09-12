
import { Injectable } from '@angular/core';
import {CookieService} from 'ngx-cookie-service';
import { BehaviorSubject, Observable } from 'rxjs';
import { PageConfigService } from '../pageconfig.service';

@Injectable({
    providedIn:"root"
})
export class KBTCookieService {
    private pageKey = "cookie-banner";    
    private data:any = null;
    private appCookieName:string = "";
    private initialized:boolean = false;
    private isInitializedInfo  = new BehaviorSubject<boolean>(false);

    constructor(private service:CookieService,private pageConfig:PageConfigService){
        this.pageConfig.getConfigData().subscribe((value)=>{
            if(value === null){
              return;
            }
            if(value[this.pageKey] === undefined){
              return;
            }
            this.data = value[this.pageKey];
            
            this.appCookieName = this.data.cookie_object_name;
/*            console.log("Cookie Service");
            console.log(this.data);
            console.log(this.appCookieName);*/
            this.initialized = true;
            this.isInitializedInfo.next(true);
       });
    }

    getData(){
        return this.data;
    }

    getAppCookieName(){
        return this.appCookieName;
    }

    isInitialized():Observable<boolean>{
        return this.isInitializedInfo.asObservable();
    }

    public storeCookieObject(name:string, o:any){
        this.service.set(name, o);
    }

    public getCookieObject(name:string):any{
        return this.service.get(name);
    }

    public hasCookieObject(name:string):boolean{
        return this.service.check(name);
    }

    public hasAppCookieObject(){
        if(this.appCookieName === undefined) return false;
        return this.hasCookieObject(this.appCookieName);
    }

    public getAppCookieObject(){
        if(this.appCookieName === undefined) return null;
        return this.getCookieObject(this.appCookieName);
    }

};