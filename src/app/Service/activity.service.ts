import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {getUrl} from './common';
import {Observable} from 'rxjs/internal/Observable';
import {Activity} from '../Models/Activity';

@Injectable({
  providedIn: 'root'
})
export class ActivityService {

  readonly url: string;
  readonly urlActivityExtension: string;


  constructor(private http: HttpClient) {

    const configData = environment.env.backend;

    this.url = getUrl(configData.protocol,
      configData.host,
      configData.port,
      configData.living_lab);

    this.urlActivityExtension = configData.living_lab_activity;
  }


  get(livingLabId: number, activityId: number): Observable<any> {
    return this.http.get(this.url + '/' + livingLabId + '/' + this.urlActivityExtension + '/' + activityId);
  }


  create(livingLabId: number, activity: Activity): Observable<any> {
    return this.http.post(this.url + '/' + livingLabId + '/' + this.urlActivityExtension, activity);
  }


  update(livingLabId: number, activity: Activity): Observable<any> {
    console.log('Gonna update activity');
    console.log(activity);
    return this.http.put(this.url + '/' + livingLabId + '/' + this.urlActivityExtension, activity);

  }

}
