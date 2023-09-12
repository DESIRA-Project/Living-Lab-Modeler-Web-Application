import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs/internal/Observable';
import { getUrl } from './common';
import {DigitalTechnology} from '../Models/DigitalTechnology';
import {Response} from '../Models/Response/response';

@Injectable({
  providedIn: 'root'
})
export class DigitalTechnologyService {

  private configData: any;
  private readonly url: string;

  constructor(private http: HttpClient) {

    this.configData = environment.env.backend;

    this.url = getUrl(this.configData.protocol,
      this.configData.host,
      this.configData.port,
      this.configData.digital_technologies);
  }


  public getAll(): Observable<any> {
    return this.http.get(this.url);
  }


  public deleteOne(id: string): Observable<any> {
    return this.http.delete(this.url + '/' + id);
  }


  public add(digitalTechnology: DigitalTechnology, icon: File | null): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('digitalTechnologyJson', JSON.stringify(digitalTechnology));
    if (icon != null) {
      formData.append('icon', icon);
    }

    return this.http.post(this.url + "/" + environment.env.backend.digital_technology_add, formData);
  }

  public canBeSafelyRemoved(id:number): Observable<any>{
    return this.http.get(this.url + "/" + environment.env.backend.digital_technology_has_entities_connected+"/"+id);
  }

  public update(digitalTechnology: DigitalTechnology, icon: File | null): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('digitalTechnologyJson', JSON.stringify(digitalTechnology));
    if (icon != null) {
      formData.append('icon', icon);
    }

    return this.http.put(this.url, formData);
  }
}
