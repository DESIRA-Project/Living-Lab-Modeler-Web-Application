import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { BackendService } from "../backend.service";

@Injectable({
    providedIn: "root"
})
export class SCPGroupsService {
    constructor(private service: BackendService, private http:HttpClient) {

    }

    public getSCPGroups (): Observable<any> {
        let configData = this.service.getConfigData();

        let url: string = this.service.getUrl(configData['protocol'], configData['host'],
            configData['port'], environment.env.backend.get_scp_groups);

        return this.http.get(url);
    }
}