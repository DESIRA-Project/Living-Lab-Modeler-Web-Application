import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { BackendService } from "../backend.service";
import { UserManagementService } from "../User/user-management.service";

export interface EntityQueryParameters {
    token: string | null;
    searchField?: string, /*groupIds: number[],*/ verified?: boolean, keyword: string;
    size: number, pageIndex: number;
    sortField?: string, direction?: string;
}

interface EntityExistenceQueryParameters {
    token: string | null, name: string;
}


@Injectable({
    providedIn: "root"
})
export class SCPEntitiesService {

    constructor(private service: BackendService, private userManagementService: UserManagementService, private http: HttpClient) {

    }

    public switchBulkModeration(ids: number[], moderation: boolean):Observable<any> {
        let configData = this.service.getConfigData();
        let url: string = this.service.getUrl(configData['protocol'], configData['host'],
            configData['port'], environment.env.backend.verify_scp_entities);

        return this.http.post(url + "?ids=" + ids + "&moderation=" + moderation, {});
    }


    public deleteBulk(ids: number[]):Observable<any> {
        let configData = this.service.getConfigData();
        let url: string = this.service.getUrl(configData['protocol'], configData['host'],
            configData['port'], environment.env.backend.delete_scp_entities);

        return this.http.delete(url + "?ids=" + ids ,{});
    }

    public checkIfSCPEntityExists(entityName: string): Observable<any> {
        let configData = this.service.getConfigData();
        let url: string = this.service.getUrl(configData['protocol'], configData['host'],
            configData['port'], environment.env.backend.check_scp_entity_exists);

            return this.http.post(url,{name:entityName});
    }

    public getPaginatedSCPEntitiesWithCriteria(params: EntityQueryParameters):Observable<any> {

        let configData = this.service.getConfigData();
        params.searchField = params.searchField ?? params.searchField;
        params.verified = params.verified ?? params.verified;

        let url: string = this.service.getUrl(configData['protocol'], configData['host'],
            configData['port'], environment.env.backend.get_scp_entities_based_on_criteria);

        let parameters = BackendService.calculateURLFromParameters(params);
        return this.http.get(url + parameters);
    }

    public getSCPEntityLabelsBasedOnName(search:string):Observable<any> {

        let configData = this.service.getConfigData();

        let url: string = this.service.getUrl(configData['protocol'], configData['host'],
            configData['port'], environment.env.backend.get_scp_entities_based_on_name);
        return this.http.get(url + "?search="+search);
    }


    public switchEntityModeration(entityId: number):Observable<any> {
        let configData = this.service.getConfigData();
        let url: string = this.service.getUrl(configData['protocol'], configData['host'],
            configData['port'], environment.env.backend.switch_entity_moderation);

        return this.http.post(url + "/" + entityId, {});
    }

    public createSCPEntityLabel(name: string, description: string):Observable<any> {
        let configData = this.service.getConfigData();
        let params = { token: this.userManagementService.getToken(), name: name, description: description }

        let url: string = this.service.getUrl(configData['protocol'], configData['host'],
            configData['port'], environment.env.backend.create_scp_entity_label);

        return this.http.put(url, params);
    }

    public updateSCPEntityLabel(id: number, name: string, description: string):Observable<any> {
        let configData = this.service.getConfigData();
        let params = { token: this.userManagementService.getToken(), name: name, description: description, entityId: id }

        let url: string = this.service.getUrl(configData['protocol'], configData['host'],
            configData['port'], environment.env.backend.update_scp_entity_label);

        return this.http.put(url, params);
    }
/*
    public updateSCPEntity(id: number, name: string, description: string, groupId: number):Observable<any> {
        let configData = this.service.getConfigData();
        let params = { token: this.userManagementService.getToken(), name: name, description: description, groupId: groupId, entityId: id }

        let url: string = this.service.getUrl(configData['protocol'], configData['host'],
            configData['port'], environment.env.backend.update_scp_entity_label);

        return this.http.put(url, params);
    }
*/

}