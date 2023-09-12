import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { environment } from './../environments/environment';

@Injectable({
    providedIn:"root"
})
export class PageConfigService {
    private configData: any = {};
    private configDataRead: boolean = false;
    private configDataListener: BehaviorSubject<any> = new BehaviorSubject<any>(null);
    
    constructor(private http: HttpClient) {
       /* console.log("PageConfigService is instantiated");
        console.log(environment);*/
        this.readConfiguration();
    }

    private readConfiguration(): void {
        let isProduction:boolean = environment.production;
        this.configData = environment.env;
        this.configDataRead = true;
        this.configDataListener.next(this.configData);
    }

    public getConfigData(): Observable<any> {
        return this.configDataListener.asObservable();
    }
}