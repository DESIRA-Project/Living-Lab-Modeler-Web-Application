import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {getUrl} from './common';
import {Observable} from "rxjs/internal/Observable";

@Injectable({
  providedIn: 'root'
})
export class AssetsService {

  private configData: any;
  private readonly url: string;
  private readonly downloadUrl: string;


  constructor(private http: HttpClient) {
    this.configData = environment.env.backend;

    this.url = getUrl(this.configData.protocol,
      this.configData.host,
      this.configData.port,
      this.configData.assets);

    this.downloadUrl = getUrl(this.configData.protocol,
      this.configData.host,
      this.configData.port,
      this.configData.assets_download);
  }



  /**
   * From
   *    IKALYmy.txt
   * get
   *    http://localhost:8080/assets/IKALYmy.txt
   */
  public getAssetLink(id: string | undefined, withTimeStamp: boolean = false): string {
    if (!id) {
      return '';
    }
    if(id.indexOf(this.url) !== -1){
       return id;
    }
    let link = this.url + '/' + id;
    if (withTimeStamp) {
      link += '?t=' + new Date().getTime();
    }
    return link;
  }



  /**
   * From
   *    IKALYmy.txt
   * get
   *    http://localhost:8080/assets/download/IKALYmy.txt?withOriginalFilename=true
   */
  public getDownloadableAssetLink(id: string, originalFilename?: boolean): string {
    let parameters = '';
    if (originalFilename) {
      parameters += '?withOriginalFilename' + '=' + 'true';
    }
    const url = this.downloadUrl + '/' + id + parameters;
    return url;
  }



  /**
   * From
   *    SDGs\lQpFhzH.png
   * get
   *    E-WEB-Goal-03.png
   * */
  public getAssetOriginalFilename(id: string): Observable<any> {
    return this.http.get(this.url + '/' + id + '/' + environment.env.backend.assets_original_filename_postfix);
  }
}
