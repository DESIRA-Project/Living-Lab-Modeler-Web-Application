import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {getUrl} from './common';
import {Observable} from 'rxjs/internal/Observable';
import {SDG} from '../Models/SDG';


@Injectable({
  providedIn: 'root'
})
export class SdgService {

  private configData: any;
  private readonly url: string;

  constructor(private http: HttpClient) {

    this.configData = environment.env.backend;

    this.url = getUrl(this.configData.protocol,
      this.configData.host,
      this.configData.port,
      this.configData.sdgs);
  }


  public getAll(): Observable<any> {
    return this.http.get(this.url);
  }


  public deleteOne(id: string): Observable<any> {
    return this.http.delete(this.url + '/' + id);
  }


  public update(sdg: SDG, icon: File | null): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('sdgJson', JSON.stringify(sdg));
    if (icon != null) {
      formData.append('icon', icon);
    }

    return this.http.put(this.url, formData);
  }

  public canBeSafelyRemoved(id:number): Observable<any>{
    return this.http.get(this.url + "/" + environment.env.backend.sdg_has_entities_connected+"/"+id);
  }

}
