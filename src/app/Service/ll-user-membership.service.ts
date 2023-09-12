import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { BackendService } from "../backend.service";

@Injectable({
    providedIn: 'root'
})
export class LLUserMembershipService {
    constructor( private service: BackendService, private http: HttpClient) {

    }

    canModifyLivingLab(userId:number, llId:number):Observable<any>{
        let configData = this.service.getConfigData();
        let url: string = this.service.getUrl(configData['protocol'], configData['host'],
            configData['port'], environment.env.backend.ll_user_membership_postfix);
        return this.http.get(url + '/' + environment.env.backend.can_modify_living_lab + '?userId=' + userId + '&llId='+llId);
    }


    checkUserLivingLabMembership(userId:number, llId:number):Observable<any>{
        let configData = this.service.getConfigData();
        let url: string = this.service.getUrl(configData['protocol'], configData['host'],
            configData['port'], environment.env.backend.ll_user_membership_postfix);
        return this.http.get(url + '/' + environment.env.backend.check_user_living_lab_membership + '?userId=' + userId + '&llId='+llId);
    }

    checkUserHasAlreadyRequestedJoin(userId:number, llId:number):Observable<any>{
        let configData = this.service.getConfigData();
        let url: string = this.service.getUrl(configData['protocol'], configData['host'],
            configData['port'], environment.env.backend.ll_user_membership_postfix);
        return this.http.get(url + '/' + environment.env.backend.check_user_has_already_requested_join + '?userId=' + userId + '&llId='+llId);
    }

    getLLUserMembers(id:number):Observable<any>{
        let configData = this.service.getConfigData();
        let url: string = this.service.getUrl(configData['protocol'], configData['host'],
            configData['port'], environment.env.backend.ll_user_membership_postfix);

        return this.http.get(url+"/"+environment.env.backend.get_ll_users+"/"+id);
    }

    getLLUserRoles():Observable<any>{
        let configData = this.service.getConfigData();
        let url: string = this.service.getUrl(configData['protocol'], configData['host'],
            configData['port'], environment.env.backend.ll_user_membership_postfix);

        return this.http.get(url+"/"+environment.env.backend.get_ll_user_roles);
    }

    getLLPotentialMembers(searchString:string,id:number):Observable<any>{
        let configData = this.service.getConfigData();
        let url: string = this.service.getUrl(configData['protocol'], configData['host'],
            configData['port'], environment.env.backend.ll_user_membership_postfix);

        return this.http.get(url+"/"+environment.env.backend.get_ll_potential_members+"/"+id+"?search="+searchString);
    }

    getLLDefaultRole(id:number):Observable<any>{
        let configData = this.service.getConfigData();
        let url: string = this.service.getUrl(configData['protocol'], configData['host'],
            configData['port'], environment.env.backend.ll_user_membership_postfix);

        return this.http.get(url+"/"+environment.env.backend.get_ll_default_role + "/" + id);
    }

    getLLMinimalRequiredRoles(id:number):Observable<any>{
        let configData = this.service.getConfigData();
        let url: string = this.service.getUrl(configData['protocol'], configData['host'],
            configData['port'], environment.env.backend.ll_user_membership_postfix);

        return this.http.get(url+"/"+environment.env.backend.get_ll_minimal_required_roles + "/" + id);
    }

    saveLLMembership(id:number,changes:any):Observable<any>{
        let configData = this.service.getConfigData();
        let url: string = this.service.getUrl(configData['protocol'], configData['host'],
            configData['port'], environment.env.backend.ll_user_membership_postfix);

        return this.http.post(url+"/"+environment.env.backend.save_ll_membership + "/" + id,changes);
    }

    removeLLMembership(livingLabId: number): Observable<any> {
      let configData = this.service.getConfigData();
      let url: string = this.service.getUrl(configData['protocol'], configData['host'],
        configData['port'], environment.env.backend.ll_user_membership_postfix)
        + "/" + environment.env.backend.remove_ll_user_membership_postfix + "/" + livingLabId;

      return this.http.post(url, {});
    }
}
