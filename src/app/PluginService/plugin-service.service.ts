
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { BehaviorSubject } from 'rxjs';
import { PageConfigService } from '../pageconfig.service';
import { GAService } from '../GoogleAnalytics/ga.service';
import { InjectablePlugin } from './injectable-plugin';
//import { KBTCookieService } from '../CookieBanner/cookie-service.component';
import { GOauthService } from '../Google Oauth/goauth.service';
import { OAOauthService } from '../Open Aire Oauth/oaoauth.service';

interface Plugins{
       
};


@Injectable({
    providedIn: "root"
})

export class PluginService implements InjectablePlugin {
    private initializationInfo: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    private readyPlugins:number = 0;
    private plugins : { [key:string]:InjectablePlugin; } = {};
    private onDemandPlugins = ["goauth","oaoauth"];
    
    constructor(service: GAService, private goauthService: GOauthService, private oaoauthService:OAOauthService) {
        this.plugins["ga"] = service;

        let keys = Object.keys(this.plugins);        
        this.readyPlugins = keys.length;

        for (let i: number = 0; i < keys.length; i++) {
            this.plugins[keys[i]].isInitialized().subscribe((value) => {
                if (value !== true) {
                    return;
                }

                this.readyPlugins --;
                if(this.readyPlugins === 0){
                    this.initializationInfo.next(true);
                }
            });
        }
    }
    isInjected(): Observable<boolean> {
        return this.isInitialized();
    }

    getPlugin(key:string):InjectablePlugin|null{
         return this.plugins[key] !== undefined ? this.plugins[key] : null;
    }

    setupOnDemandPlugin(key:string){
        if(this.onDemandPlugins.indexOf(key) === -1){
            console.log("Unknown plugin "+key+" was attempted to be installed..")
            return;
        }
        if(this.plugins[key] !== undefined){
            console.log("Already installed plugin "+key+" was attempted to be re-installed..")
            return;
        }
        if(key === "goauth"){
            this.plugins["goauth"] = this.goauthService;
            this.goauthService.isInitialized().subscribe(isInitialized=>{
                if(isInitialized === true){
                    this.goauthService.injectPluginScript();
               //     alert("goauth instantiated");
                }
            });
        }
        if(key === 'oaoauth'){
            this.plugins["oaoauth"] = this.oaoauthService;
            this.oaoauthService.isInitialized().subscribe(isInitialized=>{
                if(isInitialized === true){
                    this.oaoauthService.injectPluginScript();
               //     alert("goauth instantiated");
                }
            });
        }
        
    }

    isInitialized(): Observable<boolean> {
        return this.initializationInfo;
    }

    injectPluginScript(): void {
        let keys = Object.keys(this.plugins);
        for (let i: number = 0; i < keys.length; i++) {
            this.plugins[keys[i]].injectPluginScript();
        }
    }
    removePluginScript(): void {
        let keys = Object.keys(this.plugins);
        for (let i: number = 0; i < keys.length; i++) {
            this.plugins[keys[i]].removePluginScript();
        }
    }

    setupPlugins(setupPlan:{ [key:string]:number; } ){
        let keys = Object.keys(setupPlan);
        for(let i:number = 0;i<keys.length;i++){
            let key = keys[i];
            if(this.plugins[key] !== undefined){
                let value = setupPlan[key];
                if(value === 0){
                    this.plugins[key].removePluginScript();
                }
                else{
                    this.plugins[key].injectPluginScript();
                }
            }
        }       
    }

    setupPluginsOnAppInitialization(cookieData:any, currentCookieObject:any){

        let cookieInfo = JSON.parse( currentCookieObject).cookieInfo;
        if(cookieInfo === undefined){
            return;
        }
        for(let i:number = 0;i<cookieInfo.length;i++){
            //console.log(cookieInfo[i]);
            let name = cookieInfo[i].name;
            if(name !== undefined){
                if(this.plugins[name] === undefined){
                    continue;
                }
                let enabled:boolean = cookieInfo[i].enabled;
                if(enabled === true){
                    this.plugins[name].injectPluginScript();
                }
            }
        }
        //console.log(cookieData);

    }
}