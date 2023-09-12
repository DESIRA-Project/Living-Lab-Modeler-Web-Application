import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { BackendService } from "../backend.service";

@Injectable({
    providedIn: 'root'
  })
  export class DomainService {
  
    private configData: any;
    constructor(private http: HttpClient, private service:BackendService) {
        this.configData = environment.env.backend;
    }

    public getDomains():Observable<any>{
        let url:string = this.service.getUrl(this.configData['protocol'], this.configData['host'],
        this.configData['port'], environment.env.backend.get_domains);
    
        return this.http.get(url);
    }
  }  