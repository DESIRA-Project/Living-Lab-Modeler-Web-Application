import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {getUrl} from './common';
import { BackendService } from '../backend.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {

  private configData: any;
  private readonly url: string;


  constructor(private http: HttpClient, private service:BackendService) {
    this.configData = environment.env.backend;

    this.url = getUrl(this.configData.protocol,
      this.configData.host,
      this.configData.port,
      this.configData.assets);
  }


  public getAssetLink(id: string, withTimeStamp: boolean = false): string {
    let link = this.url + '/' + id;
    if (withTimeStamp) {
      link += '?t=' + new Date().getTime();
    }
    return link;
  }

  public getUserProfile():Observable<any>{
    let url:string = this.service.getUrl(this.configData['protocol'], this.configData['host'],
    this.configData['port'], environment.env.backend.get_user_profile);

    return this.http.get(url);
}

public requestUserProfile(userId:number):Observable<any>{
    let url:string = this.service.getUrl(this.configData['protocol'], this.configData['host'],
    this.configData['port'], environment.env.backend.request_user_profile);

    return this.http.get(url+"?userId="+userId);
}

public getUsers():Observable<any>{
  let url:string = this.service.getUrl(this.configData['protocol'], this.configData['host'],
  this.configData['port'], environment.env.backend.get_users);

  return this.http.get(url);
}

public requestUpdateUserProfile(params:any):Observable<any>{
    let url:string = this.service.getUrl(this.configData['protocol'], this.configData['host'],
    this.configData['port'], environment.env.backend.request_update_user_profile);

    return this.http.post(url,params);
}

public updateUserProfile(params:any):Observable<any>{
    let url:string = this.service.getUrl(this.configData['protocol'], this.configData['host'],
    this.configData['port'], environment.env.backend.update_user_profile);

    return this.http.post(url,params);
}

public requestUserActivation(params:any):Observable<any>{
    let url:string = this.service.getUrl(this.configData['protocol'], this.configData['host'],
    this.configData['port'], environment.env.backend.request_user_activation);

    return this.http.post(url,params);
}
}
