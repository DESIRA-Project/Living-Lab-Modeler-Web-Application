
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { BehaviorSubject } from 'rxjs';
import { environment } from './../environments/environment';
import { Router } from '@angular/router';
import { ReCaptchaService } from './ReCaptchaService/recaptcha.service';

@Injectable({
    providedIn:"root"
})
export class BackendService {
    private configData: any = {};
    private dataInfo: BehaviorSubject<any> = new BehaviorSubject<any>([]);
    private queryDataInfo: BehaviorSubject<any> = new BehaviorSubject<any>(null);
    private navigationData: any = {};
    private navigationDataInfo: BehaviorSubject<any> = new BehaviorSubject<any>(null);
    private defaultAmountOfResults:number = 10;
    private currentAmountOfResults:number = this.defaultAmountOfResults;

    private totalAmountOfResults:number = 0;
    private totalAmountOfResultsInfo: BehaviorSubject<number> = new BehaviorSubject<any>(-1);

    private initializationInfo: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    private sortOptions:any = [];
    private sortOptionsInfo:BehaviorSubject<any> = new BehaviorSubject<any>(null);
    private sortingOption:number = 0;

    private lastQueryContainedResults:boolean = false;

    private sharedDataBuffer:any = {};

    constructor(private http: HttpClient, private router:Router, private recaptchaService:ReCaptchaService) {
        console.log("BackendService is instantiated");
        this.readConfiguration();
    }

    
    public static calculateURLFromParameters(p:any):string{
        let keys = Object.keys(p);
        //find first
        let i = 0;
        let result = "";
        for(;i<keys.length;i++){
            if(p[keys[i]] !== undefined && p[keys[i]] !== null){
                result = "?"+keys[i] + "="+p[keys[i]];
                break;
            }
        }
        //everything undefined or null
        if(result === "") return "";
        i++;
        for(;i<keys.length;i++){
            //console.log(keys[i]+"  == > "+p[keys[i]]);
            if(p[keys[i]] !== undefined && p[keys[i]] !== null)
            result += "&"+keys[i] + "="+p[keys[i]];
        }
        return result;
    }

    public getRecaptchaService():ReCaptchaService{
        return this.recaptchaService;
    }

    public getConfigValue(key:string):string|null{
        if(this.configData === null || this.configData === undefined){
            return null;
        }
        if(this.configData[key] === undefined) return null;
        return this.configData[key];
    }

    public lastQueryReturnedData():boolean{
        return this.lastQueryContainedResults;
    }

    private readConfiguration(): void {
        let isProduction:boolean = environment.production;
        this.configData = environment.env.backend;
        this.initializationInfo.next(true);
    }

    public getUrl(protocol: string, host: string, port: string, endpoint: string): string {
        return protocol + "://" + host + (port !== "" ? ":" + port : "") + "/" + endpoint;
    }

    public fetchData(body:any, onFinish: Function): void {
    }

     public performPostCall(endpoint:string, params:any, onFinish: Function, returnWholeDataResponse = false,_url = ""):void{
        let isAuthCall = false;

        if(params['token'] !== undefined){
             isAuthCall = true;
        }
        let url:string = _url === "" ? this.getUrl(this.configData['protocol'], this.configData['host'],
         this.configData['port'], endpoint) : _url;

/*        console.log("Post call "+url);
        console.log(params);*/
         this.http.post(url, params).subscribe(data =>{
             let response:any = data;
             let res:boolean = false;
             if(response.result !== undefined){
                res = response.result;
             }

             if(response.responseData && response.responseData.length === 1){
                 let r = response.responseData;
                 if(r[0].data !== undefined && r[0].data === false && r[0]. description !== undefined && r[0].description === "User token has expired"){
                  // we need to redirect to sign in component
                    this.router.navigateByUrl(environment.env.signIn.link);
                    return;
                }
            }

             if(onFinish !== null){
                if(returnWholeDataResponse == true){
                    onFinish(data);
                }
                else{
                    onFinish(res);
                }
            }
         });
     }

     public performGetCall(endpoint:string, params:any, onFinish: Function, returnWholeDataResponse = false,_url = ""):void{
        
        let url:string = _url === "" ? this.getUrl(this.configData['protocol'], this.configData['host'],
         this.configData['port'], endpoint) : _url;

         this.http.get(url, params).subscribe(data =>{
             let response:any = data;
             let res:boolean = false;
             if(response.result !== undefined){
                res = response.result;
             }

             if(onFinish !== null){
                if(returnWholeDataResponse == true){
                    onFinish(data);
                }
                else{
                    onFinish(res);
                }
            }
         });
     }

    public getPreparedURL(endpoint:string){
        return this.getUrl(this.configData['protocol'], this.configData['host'],
        this.configData['port'], endpoint);
    }

    public getSupportedAuthProviders(onFinish:Function){
        let url:string = this.getUrl(this.configData['protocol'], this.configData['host'],
        this.configData['port'], environment.env.backend.get_auth_providers);

        this.performGetCall("", {}, onFinish, true, url);
    }

    public setAmountOfResults(newAmount:number):void{
        this.currentAmountOfResults = newAmount;
    }

    public setSortingOption(option:number):void{
        this.sortingOption = option;
    }

    public getData(): Observable<any> {
        return this.dataInfo.asObservable();
    }

    public getQueryData(): Observable<any> {
        return this.queryDataInfo.asObservable();
    }


    public getNavigation(): Observable<any> {
        return this.navigationDataInfo.asObservable();
    }

    public getSorting(): Observable<any> {
        return this.sortOptionsInfo.asObservable();
    }

    public isInitialized(): Observable<boolean> {
        return this.initializationInfo.asObservable();
    }

    public getConfigData():any{
        return this.configData;
    }

    public getTotalAmountOfResults():Observable<number>{
        return this.totalAmountOfResultsInfo.asObservable();
    }
}
