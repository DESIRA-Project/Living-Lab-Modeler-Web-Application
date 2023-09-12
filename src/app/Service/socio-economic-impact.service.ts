import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {getUrl} from "./common";
import {Observable} from "rxjs/internal/Observable";

@Injectable({
  providedIn: 'root'
})
export class SocioEconomicImpactService {

  private readonly url: string;
  private readonly configData = environment.env.backend;

  constructor(private http: HttpClient) {
    this.url = getUrl(this.configData.protocol,
      this.configData.host,
      this.configData.port,
      this.configData.socio_economic_impact.url);
  }

  public get(livingLabId: number, digitalTechnologyIds: number[]): Observable<any> {
    return this.http.post(this.url + '/' + this.configData.socio_economic_impact.get_se_impact.url + '/' + livingLabId, { ids: digitalTechnologyIds});
  }
}
