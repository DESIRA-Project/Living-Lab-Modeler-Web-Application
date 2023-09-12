import { Injectable } from '@angular/core';
// @ts-ignore
import livingLab from './mock-living-lab.json';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {getUrl} from './common';
import {Observable} from 'rxjs/internal/Observable';
import {of} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LivingLabService {

  private readonly url: string;

  constructor(private http: HttpClient) {

    const configData = environment.env.backend;

    this.url = getUrl(configData.protocol,
      configData.host,
      configData.port,
      configData.living_lab);
  }

  get(id: number, summary?: boolean): Observable<any> {
    return this.http.get(this.url + '/' + id + (summary ? '?summary=true' : ''));
  }

  getMiniSummary(id: number): Observable<any> {
    return this.http.get(this.url + '/' + environment.env.backend.get_mini_summary + '/' + id );
  }

  livingLabIdIsValid(id:number):Observable<any>{
    return this.http.get(this.url + '/' + environment.env.backend.living_lab_exists + '/' + id);
  }

  getMockLivingLab(): Observable<any> {
    return of({data: livingLab});
  }

  createLivingLab(llData: any): Observable<any>{
    return this.http.post(this.url + '/' + environment.env.backend.create_living_lab, llData);
  }

  getUserLivingLabs(userId: number): Observable<any> {
    return this.http.get(this.url + '/' + environment.env.backend.user_living_labs_postfix + '/' + userId);
  }

  getPublicLivingLabs(): Observable<any> {
    return this.http.get(this.url + '/' + environment.env.backend.public_living_labs_postfix);
  }

  getPublishedLivingLabs(page:number, perPage:number):Observable<any>{
    return this.http.get(this.url + '/' + environment.env.backend.get_all_published_living_labs + "?page="+page + "&perPage="+perPage );
  }

  getAllLivingLabs(joinRequestsOnly:boolean, search:string, page:number, perPage:number):Observable<any>{
    return this.http.get(this.url + '/' + environment.env.backend.get_all_living_labs + "?page="+page + "&perPage="+perPage+"&search="+search+"&onlyJoinRequests="+joinRequestsOnly  )
  }

  downloadReport(id:number):Observable<any>{
    console.log(this.url + "/" + environment.env.backend.download_living_lab_report);

    let headers = new HttpHeaders({
      'Content-Type':  'application/pdf',
      responseType : 'blob',
      Accept : 'application/pdf',
      observe : 'response'
      })

    return this.http.get(this.url + "/" + id + "/" + environment.env.backend.download_living_lab_report, { headers: headers, responseType: 'blob' });    
  }

  downloadMaterial(id:number):Observable<any>{
    console.log(this.url + "/" + environment.env.backend.download_living_lab_material);

    let headers = new HttpHeaders({
      'Content-Type':  'application/zip',
      responseType : 'blob',
      Accept : 'application/zip',
      observe : 'response'
      })

    return this.http.get(this.url + "/" + id + "/" + environment.env.backend.download_living_lab_material, { headers: headers, responseType: 'blob' });    
  }
  
  getUserLLPermissions(livingLabId: number): Observable<any> {
    return this.http.get(this.url + '/' + livingLabId + '/' + environment.env.backend.user_ll_permissions_postfix);
  }

  deleteLivingLab(livingLabId: number): Observable<any> {
    return this.http.post(this.url + '/' + environment.env.backend.delete_ll + '/' + livingLabId, {});
  }

  updateLivingLab(livingLabId: number, llData: any): Observable<any> {
/*    console.log('gonna update living lab');
    console.log(llData);*/
    return this.http.post(this.url + '/' + environment.env.backend.update_ll + '/' + livingLabId, llData);
  }

  /*Super user ops */
  activateLivingLab(livingLabId: number): Observable<any> {
    return this.http.post(this.url + '/' + environment.env.backend.activate_living_lab + '/' + livingLabId, {});
  }

  deactivateLivingLab(livingLabId: number): Observable<any> {
    return this.http.post(this.url + '/' + environment.env.backend.deactivate_living_lab + '/' + livingLabId, {});
  }

  deleteLivingLabPermanently(livingLabId: number): Observable<any> {
    return this.http.post(this.url + '/' + environment.env.backend.delete_living_lab_permanently + '/' + livingLabId, {});
  }

  getAllLivingLabsForManagement(showAll:boolean, search:string, page:number, perPage:number):Observable<any>{
    return this.http.get(this.url + '/' + environment.env.backend.get_all_living_labs_for_management + "?page="+page + "&perPage="+perPage+"&search="+search+"&showAll="+showAll  )
  }

}
