
import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { BehaviorSubject } from 'rxjs';
import { PageConfigService } from '../pageconfig.service';
import { InjectablePlugin } from '../PluginService/injectable-plugin';
import { ThrowStmt } from '@angular/compiler';
import { BackendService } from '../backend.service';
import { AuthenticatablePlugin } from '../Auth/authenticatable-plugin';
import { environment } from 'src/environments/environment';

declare var gapi: any; //this is the key

@Injectable({
    providedIn:"root"
})

export class GOauthService implements InjectablePlugin, AuthenticatablePlugin{
    configKey = "goauth";
    backendKey = "backend";
    pageData:any = null;
    useGOauthKey:string = "use_goauth"
    private goauthUsed:boolean = true;
    private gapiSetup:boolean = false;
    private authInstance:any = null;
    private initializationInfo: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    private injectionInfo: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    constructor(private service:PageConfigService,private ngZone: NgZone, private backend:BackendService){
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
                  return;
              });
            }
          });      
    }
  isDisabled(): boolean {
    return  false;
  }
  isInjected(): Observable<boolean> {
    return this.injectionInfo.asObservable();
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
    
    private getScriptSource(){
        return  this.pageData !== null && this.pageData['src'] !== undefined ? this.pageData : "";        
    }

    public isInitialized():Observable<boolean>{
      return this.initializationInfo.asObservable();
    }

    public injectPluginScript():void {
      if(!this.goauthUsed){
        return;
      }
      let goauthCode = this.getScriptSource();
      if(goauthCode !== null){
          
          let initGoogleOAUTHModule = ()=>{
              let p = this;
              this.ngZone.run(()=>{
                  this.initGoogleAuth();
                  });
              };
              if(goauthCode.async !== undefined){
                   let asyncscript = document.createElement("script");
                   asyncscript.setAttribute("async","");
                   asyncscript.setAttribute("src",goauthCode.src);
                   asyncscript.setAttribute("id", this.configKey + "_asyncscript_script" );
                   asyncscript.onload = ()=>{
                        initGoogleOAUTHModule();
                   }
                   if(goauthCode.defer !== undefined){
                       asyncscript.setAttribute("defer","");
                   }
                   this.addDOMScript("head",asyncscript);
                   this.injectionInfo.next(true);
              }
      }

      console.log("Installed g oauth plugin!");      
  }

  public removePluginScript(){
      let ids:string[] = ["_asyncscript_script"];
      for(let i:number = 0;i<ids.length;i++){
          ids[i] = this.configKey + ids[i];
      }

      for(let i:number = 0;i<ids.length;i++){
          let node = document.getElementById(ids[i]);
          let parent = node?.parentNode;
          if(node !== null && parent !== null){
            parent?.removeChild(node);
          }
      }
  }

  private addDOMScript(tag:string,script:HTMLElement){
    let id = script.getAttribute("id");
    if( id !== null){
        if(document.getElementById(id) !== null){
          return;
        }
    }
    let firstChild = document.getElementsByTagName(tag)[0].firstChild;
    if (firstChild !== null) {
      document.getElementsByTagName(tag)[0].insertBefore(script, firstChild);
    }
    else{
      document.getElementsByTagName(tag)[0].appendChild(script);
    }
  }

  async initGoogleAuth(): Promise<void> {
    //  Create a new Promise where the resolve 
    // function is the callback passed to gapi.load
    const pload = new Promise(resolve => {
        gapi.load('auth2', resolve);
        console.log("gapi loaded");
    });

    // When the first promise resolves, it means we have gapi
    // loaded and that we can call gapi.init
    return pload.then(async () => {
      await gapi.auth2
        .init({ client_id: environment.env.goauth.client_id,  plugin_name: "chat"})//'136356096064-eipjsof5hjp4v3a29ibml3ck6h1gd01e.apps.googleusercontent.com' })
        .then( (auth:any) => {
          this.gapiSetup = true;
          let a = auth;
          this.authInstance = a;
        });
    });
  }


  /* 
  async signOut():Promise<void>{
      if (!this.gapiSetup) {
          await this.initGoogleAuth();
      }
  }*/

  async authenticate(onSuccess:any, onFailure:any): Promise<void> {
    // Initialize gapi if not done yet
    if (!this.gapiSetup) {
        await this.initGoogleAuth();
    }

    // Resolve or reject signin Promise
    return new Promise(async () => {
      await this.authInstance.signIn().then(
        ( user:any, error:any)=>{
            let id  = user.getAuthResponse().id_token;
            if(error !== undefined){
                onFailure();
                return;
            }
            
            let onFinish = (res:any)=>{
                onSuccess(res);
                return;
            };
            this.backend.performPostCall(environment.env.backend.gooath,id,onFinish,true);

        }
        );
    });
}

}