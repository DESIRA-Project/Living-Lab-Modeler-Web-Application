import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {getUrl} from "./common";
import {Observable} from "rxjs/internal/Observable";
import {LLJoinRequest} from "../Models/LLJoinRequest";

@Injectable({
  providedIn: 'root'
})
export class LlJoinRequestService {

  private readonly url: string;
  private readonly configData = environment.env.backend;

  constructor(private http: HttpClient) {
    this.url = getUrl(this.configData.protocol,
      this.configData.host,
      this.configData.port,
      this.configData.ll_join_request.url);
  }

  public addRequest(request: LLJoinRequest): Observable<any> {
    return this.http.post(this.url + '/' + this.configData.ll_join_request.add.url, request);
  }

  public getNumberOfPendingRequests(livingLabId: number): Observable<any> {
    return this.http.get(this.url + '/' + this.configData.ll_join_request.get_num_of_pending_requests.url + '/' + livingLabId);
  }

  public getPendingRequests(livingLabId: number): Observable<any> {
    return this.http.get(this.url + '/' + this.configData.ll_join_request.get_pending_requests.url + '/' + livingLabId);
  }

  public acceptRequest(requestId: number): Observable<any> {
    return this.http.post(this.url + '/' + this.configData.ll_join_request.accept.url + '/' + requestId, {});
  }

  public rejectRequest(requestId: number): Observable<any> {
    return this.http.post(this.url + '/' + this.configData.ll_join_request.reject.url + '/' + requestId, {});
  }
}
