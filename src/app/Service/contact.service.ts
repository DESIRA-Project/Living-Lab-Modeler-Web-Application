import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { BackendService } from "../backend.service";
import { ContactEnvelope } from "../Models/ContactEnvelope";
import { ReCaptchaService } from "../ReCaptchaService/recaptcha.service";

@Injectable({
    providedIn: 'root'
  })
  export class ContactService {

    private configData: any;

    constructor(private http: HttpClient, private service:BackendService) {
        this.configData = environment.env.backend;
    }

    public submitFeedback(envelope:ContactEnvelope):Observable<any>{
        let url:string = this.service.getUrl(this.configData['protocol'], this.configData['host'],
        this.configData['port'], environment.env.backend.contact);
    
        return this.http.post(url + '/' + environment.env.backend.contact_submit, envelope);
    }

  }  