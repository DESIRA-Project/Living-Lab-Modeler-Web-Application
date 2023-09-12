import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import { BackendService } from '../backend.service';
import { LocalStorageDefs } from '../Models/LocalStorageDefs';

@Injectable({
  providedIn: 'root'
})
export class LlJoinRequestDispatcherService {
    constructor( private service: BackendService, private http: HttpClient) {

    }

    storeJoinRequest(llId:number):void{
        if(!localStorage.getItem(LocalStorageDefs.LivingLabJoinRequestAttributeKey)){
             localStorage.setItem(LocalStorageDefs.LivingLabJoinRequestAttributeKey, llId.toString() );
        }
        else{
            console.log("We cannot store more than one join request ids in the local storage.");
            //store it anyway
            localStorage.setItem(LocalStorageDefs.LivingLabJoinRequestAttributeKey, llId.toString() );
        }
    }

    getLastJoinRequest():number{
        let ret = localStorage.getItem(LocalStorageDefs.LivingLabJoinRequestAttributeKey);
        if(!ret) return -1;
        return Number(ret);
    }

    hasJoinRequest():boolean{
        return localStorage.getItem(LocalStorageDefs.LivingLabJoinRequestAttributeKey) !== undefined;
    }

    clearJoinRequest(){
        if(this.hasJoinRequest()){
            localStorage.removeItem(LocalStorageDefs.LivingLabJoinRequestAttributeKey);
        }
    }
}