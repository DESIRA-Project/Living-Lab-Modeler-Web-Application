import { Component, NgZone } from "@angular/core";
import { Router } from "@angular/router";
import { environment } from "src/environments/environment";
import { BackendService } from "../backend.service";
import { PluginService } from "../PluginService/plugin-service.service";
import { UserManagementService } from "../User/user-management.service";
import { AuthService } from "./auth.service";
import { AuthenticatablePlugin } from "./authenticatable-plugin";

@Component({
    selector: 'signin',
    templateUrl: './signin.component.html',
    styleUrls:['../style/signin.css']
})
export class SignInComponent {
    //service: AuthenticatablePlugin | null = null;
    supportedAuthMethods: { [name: string]: AuthenticatablePlugin | null } = {};
    onAuthenticationError = false;
    errorMessage : { [name: string]: string | null } | null = {}; 
    ready = false;
    constructor(private plugins: PluginService,
        private router: Router,
        private ngZone: NgZone,
        private authService: AuthService,
        private backendService: BackendService,
        private userManagementService:UserManagementService) {

            this.ready = true;
        if (this.authService.isAuthenticated()) {
            this.navigateToUserProfile();
            return;
        }

        this.plugins.isInitialized().subscribe(pluginManagerInitialized => {
            if (pluginManagerInitialized === true) {
                this.backendService.isInitialized().subscribe(backendInitialized => {
                    if (backendInitialized === null) {
                        return;
                    }
                    if (backendInitialized === true) {
                        this.backendService.getSupportedAuthProviders((data: any) => {
                            console.log(data.responseData);
                            let providers = data.responseData;
                            if (providers) {
                                providers = providers[0];
                                if (providers.attribute === 'authProviders') {
                                    let data = providers.data.values;
                                    for (let i = 0; i < data.length; i++) {
                                        /*console.log(data[i]);*/
                                        let provider = data[i].nameValuePairs['provider'];
                                        let pluginKey = data[i].nameValuePairs['key'];

                                        this.plugins.setupOnDemandPlugin(pluginKey);
                                        let p: unknown = this.plugins.getPlugin(pluginKey);
                                        if (p) {
                                            this.supportedAuthMethods[pluginKey] = <AuthenticatablePlugin>p;
                                        }
                                        else{
                                            console.log("Plugin "+pluginKey+" not found");
                                        }
                                    }
                                }
                            }
                        });
                    }
                });
            }
        });

    }

    getAuthenticationMethodImage(key:string){
          if(this.supportedAuthMethods[key]){
              return this.supportedAuthMethods[key]?.getPluginImage();
          }
          return "";
    }

    hasAuthenticationMethodImageWidth(key:string):boolean{
        if(this.supportedAuthMethods[key] !== null ){
            let i = this.supportedAuthMethods[key];
            if(i !== null){
                return i.hasPluginImageWidth();
            }
        }
        return false;
    }

    isAuthenticationMethodDisabled(key:string):boolean{
        if(this.supportedAuthMethods[key] !== null ){
            let i = this.supportedAuthMethods[key];
            if(i !== null){
                return i.isDisabled();
            }
        }
        return false;

    }

    hasAuthenticationMethodImageHeight(key:string):boolean{
        if(this.supportedAuthMethods[key] !== null ){
            let i = this.supportedAuthMethods[key];
            if(i !== null){
                return i.hasPluginImageHeight();
            }
        }
        return false;
    }

    getAuthenticationMethodImageWidth(key:string):number{
        if(this.supportedAuthMethods[key] !== null ){
            let i = this.supportedAuthMethods[key];
            if(i !== null){
                return i.getPluginImageWidth();
            }
        }
        return -1;
    }

    getAuthenticationMethodImageHeight(key:string):number{
        if(this.supportedAuthMethods[key] !== null ){
            let i = this.supportedAuthMethods[key];
            if(i !== null){
                return i.getPluginImageHeight();
            }
        }
        return -1;
    }


    authenticateWithSupportedProvider(key: string) {
        let service = this.supportedAuthMethods[key];
        let inst = this;
        if (service && service !== null) {
            inst.ready = false;
            let p: Promise<void> = service.authenticate((user: any) => {
/*                console.log(user);
                console.log(inst)*/
                inst.ready = false;
                if(user.result === false){
                    inst.onAuthenticationError = true;
                    inst.errorMessage = {title:user['auth-error-title'], message:user['auth-error-message']}
                    inst.ready = true;
                    inst.refreshComponent();
                    return;
                }
                inst.userManagementService.register(user);
//                localStorage.setItem("gnomee-auth", user.token);
                inst.supportedAuthMethods[key] = null;
                inst.ready = true;
                inst.navigateToUserProfile();
                return;
            }, () => {

            });
        }
    }

    private setupError(){
        this.ready = true;
        this.onAuthenticationError = true;
    }

    private refreshComponent(){
        this.ngZone.run(() => {
                       
        });
    }

    private navigateToUserProfile() {
        this.ngZone.run(() => {
            this.router.navigateByUrl(environment.env.signIn.redirectionLink);
        });
    }

}