import { Injectable, NgZone } from "@angular/core";
import { AuthConfig, OAuthService } from "angular-oauth2-oidc";
import { BehaviorSubject, Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { AuthenticatablePlugin } from "../Auth/authenticatable-plugin";
import { BackendService } from "../backend.service";
import { PageConfigService } from "../pageconfig.service";
import { InjectablePlugin } from "../PluginService/injectable-plugin";
import { JwksValidationHandler } from 'angular-oauth2-oidc-jwks';

@Injectable({
    providedIn:"root"
})

export class OAOauthService implements InjectablePlugin, AuthenticatablePlugin{
    configKey = "oaoauth";
    backendKey = "backend";
    pageData:any = null;
    useGOauthKey:string = "use_oaoauth"
    private goauthUsed:boolean = true;
    private gapiSetup:boolean = false;
    private authInstance:any = null;
    private initializationInfo: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    constructor(private service:PageConfigService,private ngZone: NgZone, private backend:BackendService,private oauthService: OAuthService){
        this.service.getConfigData().subscribe((value) => {
            if (value === null) {
              return;
            }
            if (this.configKey in value) {
              this.pageData = value[this.configKey];
              if(this.backendKey in value){
                  if (this.useGOauthKey in value[this.backendKey]){
                      this.goauthUsed = value[this.backendKey][this.useGOauthKey];
                  }
              }
              this.backend.isInitialized().subscribe(backendInitialized=>{
                  if(backendInitialized === null){
                      return;
                  }
                  if(backendInitialized === true){
                       this.initializationInfo.next(true);
                  }

                  // Discovery Document of your AuthServer as defined by OIDC
                  /*'https://steyer-identity-server.azurewebsites.net/identity/.well-known/openid-configuration';*/
                 // let url = 'https://aai.openaire.eu/oidc/.well-known/openid-configuration';//'https://openaire-dev.aai-dev.grnet.gr/oidc/.well-known/openid-configuration';
                  // Load Discovery Document and then try to login the user

                 let authConfig: AuthConfig = {
                    loginUrl: environment.env.oaoauth.login_url,//'https://openaire-dev.aai-dev.grnet.gr/oidc/authorize',
                    redirectUri: environment.env.oaoauth.redirect_url,//'http://localhost:8080/auth/openairesignin',
                    clientId: environment.env.oaoauth.client_id,//'0dc42bc5-216e-4409-af56-c7e1a01eb6db',
                    scope: environment.env.oaoauth.scope,//"openid profile email",
                    responseType: environment.env.oaoauth.response_type,//'code',
                    disablePKCE:true,
                    
                  };

                  this.oauthService.configure(authConfig);
            });
          }
        });      
    }
    isDisabled(): boolean {
        return environment.env.oaoauth.disable;
    }
    isInjected(): Observable<boolean> {
        return this.initializationInfo.asObservable(); 
    }

    authenticate(onSuccess: any, onFailure: any): Promise<void> {
        this.oauthService.tokenValidationHandler = new JwksValidationHandler();
        let p = this.oauthService.tryLogin();

        this.oauthService.initImplicitFlow();
            return new Promise(()=>{
        });
    }

    public getPluginImage():string{
        return  this.pageData !== null && this.pageData['img'] !== undefined ? this.pageData['img'] : "";       
    }

    getPluginImageHeight(): number {
        return  this.pageData !== null && this.pageData['img_height'] !== undefined ? this.pageData['img_height'] : -1;  
    }
    getPluginImageWidth(): number {
        return  this.pageData !== null && this.pageData['img_width'] !== undefined ? this.pageData['img_width'] : -1;  
    }

    hasPluginImageHeight(): boolean {
        return  this.pageData !== null && this.pageData['img_height'] !== undefined ? true: false;  
    }
    hasPluginImageWidth(): boolean {
        return  this.pageData !== null && this.pageData['img_width'] !== undefined ? true: false; 
    }

    isInitialized(): Observable<boolean> {
        this.initializationInfo.next(true);
        return this.initializationInfo.asObservable();
    }
    injectPluginScript(): void {
        //throw new Error("Method not implemented.");
    }
    removePluginScript(): void {
        //throw new Error("Method not implemented.");
    }
    
}