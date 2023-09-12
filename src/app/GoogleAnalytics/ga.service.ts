
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { BehaviorSubject } from 'rxjs';
import { PageConfigService } from '../pageconfig.service';
import { InjectablePlugin } from '../PluginService/injectable-plugin';
import { ThrowStmt } from '@angular/compiler';

@Injectable({
    providedIn:"root"
})

export class GAService implements InjectablePlugin{
    configKey = "ga";
    backendKey = "backend";
    pageData:any = null;
    useAnalyticsKey:string = "use_analytics"
    private gaUsed:boolean = true;
    private initializationInfo: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    private injectionInfo: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    

    constructor(private service:PageConfigService){
        this.service.getConfigData().subscribe((value) => {
            if (value === null) {
              return;
            }
            if (this.configKey in value) {
              this.pageData = value[this.configKey];
              if(this.backendKey in value){
                  if (this.useAnalyticsKey in value[this.backendKey]){
                      this.gaUsed = value[this.backendKey][this.useAnalyticsKey];
                  }
              }
              this.initializationInfo.next(true);
            }
          });      
    }
  isInjected(): Observable<boolean> {
    return this.injectionInfo.asObservable();
  }

    private getHeaderGACode(){
        return  this.pageData !== null && this.pageData['header'] !== undefined ? this.pageData['header'] : "";
    }

    private getBodyGACode(){
      return  this.pageData !== null && this.pageData['body'] !== undefined ? this.pageData['body'] : "";        
    }

    private getGlobalTagging(){
      return  this.pageData !== null && this.pageData['global_site_tag'] !== undefined ? this.pageData['global_site_tag'] : "";        
    }

    public isInitialized():Observable<boolean>{
      return this.initializationInfo.asObservable();
    }

    public injectPluginScript():void {
      if(!this.gaUsed){
        return;
      }
      let script = document.createElement('script');
      script.type = 'text/javascript';
      script.innerHTML = this.getHeaderGACode();
      script.setAttribute("id", this.configKey + "_header_script" );

      this.addDOMScript("head", script);

      let noscript = document.createElement('noscript');
      noscript.innerHTML = this.getBodyGACode();
      noscript.setAttribute("id", this.configKey + "_noscript_script" );

      this.addDOMScript("body", noscript);

      //global tagging
      let gtag = this.getGlobalTagging();
      if(gtag !== null){
          for(let i:number = 0;i<gtag.length;i++){
              if(gtag[i].async !== undefined){
                   let asyncscript = document.createElement("script");
                   asyncscript.setAttribute("async","");
                   asyncscript.setAttribute("src",gtag[i].src);
                   asyncscript.setAttribute("id", this.configKey + "_asyncscript_script" );

                   this.addDOMScript("head",asyncscript);
              }
              else{
                if(gtag[i].code !== undefined){
                        let scr = document.createElement("script");
                        scr.innerHTML = gtag[i].code;
                        scr.setAttribute("id", this.configKey + "_script_script" );
                        this.addDOMScript("head",scr);

                }
              }
         }
      }
      this.injectionInfo.next(true);
      console.log("Installed ga plugin!");
  }

  public removePluginScript(){
      let ids:string[] = ["_header_script", "_noscript_script" ,"_asyncscript_script" ,"_script_script" ];
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
}