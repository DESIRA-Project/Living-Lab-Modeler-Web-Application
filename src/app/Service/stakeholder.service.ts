import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import { environment } from '../../environments/environment';
import { getUrl } from './common';
import { Observable } from 'rxjs/internal/Observable';
import { Stakeholder } from '../Models/Stakeholder';
import { BackendService } from '../backend.service';

@Injectable({
  providedIn: 'root'
})
export class StakeholderService {

  private configData: any;
  private readonly url: string;
  private readonly endpointUrl: string;


  constructor(private http: HttpClient) {

    this.configData = environment.env.backend;

    this.url = getUrl(this.configData.protocol,
      this.configData.host,
      this.configData.port,
      this.configData.stakeholders);

      this.endpointUrl = getUrl(this.configData.protocol,
        this.configData.host,
        this.configData.port,
        "")
  }

  public get(name: string | null,
    sortBy: string | null,
    direction: string | null,
    page: number | null,
    perPage: number | null): Observable<any> {


    let currentRequestUrl = this.url + '?';
    if (name) {
      currentRequestUrl += 'name=' + name + '&';
    }
    if (sortBy) {
      currentRequestUrl += 'sortBy=' + sortBy + '&';
    }
    if (direction) {
      currentRequestUrl += 'direction=' + direction + '&';
    }
    if (page) {
      currentRequestUrl += 'page=' + page + '&';
    }
    if (perPage) {
      currentRequestUrl += 'perPage=' + perPage + '&';
    }

    /*
     let params = { name: name, sortBy: sortBy, direction: direction, page: page, perPage: perPage }
    let p = BackendService.calculateURLFromParameters(params); */
    return this.http.get(currentRequestUrl);
  }

  public verify(ids: string[]): Observable<any> {
    return this.http.put(this.url + '/verify', Array.from(ids));
  }

  public unverify(ids: string[]): Observable<any> {
    return this.http.put(this.url + '/unverify', Array.from(ids));
  }

  public getLivingLabs(stakeholderId: string): Observable<any> {
    return this.http.get(this.url + '/' + stakeholderId + '/living-labs');
  }

  public add(stakeholder: Stakeholder): Observable<any> {
    return this.http.post(this.url, stakeholder);
  }

  public deleteOne(id: string): Observable<any> {
    return this.http.delete(this.url + '/' + id);
  }

  public update(stakeholder: Stakeholder): Observable<any> {
    return this.http.put(this.url, stakeholder);
  }

  public getModeratedStakeholders(name: string | null,
    sortBy: string | null,
    direction: string | null,
    page: number | null,
    perPage: number | null): Observable<any> {

    let params = { name: name, sortBy: sortBy, direction: direction, page: page, perPage: perPage }
    let p = BackendService.calculateURLFromParameters(params);
    /*console.log(this.endpointUrl  + environment.env.backend.get_moderated_stakeholders + p)*/

    return this.http.get(this.endpointUrl  + environment.env.backend.get_moderated_stakeholders + p);
  }

  public getUserDefinedStakeholders(name: string | null,
    sortBy: string | null,
    direction: string | null,
    page: number | null,
    perPage: number | null): Observable<any> {

    let params = { name: name, sortBy: sortBy, direction: direction, page: page, perPage: perPage }
    let p = BackendService.calculateURLFromParameters(params);
    return this.http.get(this.endpointUrl + '/' + environment.env.backend.get_user_defined_stakeholders + p);
  }

  public addUserDefinedStakeholder(stakeholder: Stakeholder): Observable<any>{
    return this.http.post(this.endpointUrl + '/' + environment.env.backend.add_user_defined_stakeholder, stakeholder);
  }

  public getStakeholderRoles(): Observable<any>{
    return this.http.get(this.endpointUrl + environment.env.backend.get_stakeholder_roles);
  }

  public checkIfNameExists(name: string): Observable<any> {
    const params = new HttpParams().set('name', name);
    return this.http.get(this.url + '/' + environment.env.backend.check_if_stakeholder_name_exists, {params});
  }
}
