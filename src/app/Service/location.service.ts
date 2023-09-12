import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { BackendService } from "../backend.service";
import { getUrl } from "./common";

@Injectable({
    providedIn: 'root'
  })
  export class LocationService {
  
    private configData: any;
    private readonly url: string;
  private readonly search_postfix: string;

    constructor(private http: HttpClient, private service:BackendService) {
        this.configData = environment.env.backend;
        
    this.url = getUrl(this.configData.protocol,
      this.configData.host,
      this.configData.port,
      this.configData.location);

    this.search_postfix = this.configData.location_search_postfix;
    }

    public searchCity(searchString:string):Observable<any>{
        let url:string = this.service.getUrl(this.configData['protocol'], this.configData['host'],
        this.configData['port'], environment.env.backend.search_city);
    
        return this.http.get(url+"?searchString="+searchString);
    }
    search(term: string): Observable<any> {
      return this.http.get(this.url + '/' + this.search_postfix + '?term=' + term);
    }
    public searchCountry(searchString:string):Observable<any>{
        let url:string = this.service.getUrl(this.configData['protocol'], this.configData['host'],
        this.configData['port'], environment.env.backend.search_country);
    
        return this.http.get(url+"?searchString="+searchString);
    }

  }  
