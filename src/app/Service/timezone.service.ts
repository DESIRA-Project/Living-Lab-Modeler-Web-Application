import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {getUrl} from './common';
import {Observable} from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})
export class TimezoneService {

  private readonly url: string;

  constructor(private http: HttpClient) {

    const configData = environment.env.backend;

    this.url = getUrl(configData.protocol,
      configData.host,
      configData.port,
      configData.timezones);
  }

  getAll(): Observable<any> {
    return this.http.get(this.url);
  }
}
