import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { environment } from "src/environments/environment";
//import { BackendService } from "../backend.service";
import { InjectablePlugin } from "../PluginService/injectable-plugin";

declare var grecaptcha: any;

@Injectable({
    providedIn: "root"
})

export class ReCaptchaService implements InjectablePlugin{
    private initializationInfo: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    private injectionInfo: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    private recaptcha : InjectablePlugin|null = null;
    private captchaKey = "";
    useRecaptchaKey:string = "use_recaptcha"
    useRecaptcha:boolean = true;
    isRendered:boolean = false;
    isRenderedForTheFirstTime:boolean = true;
    pluginInjected = false;
    
    constructor(/*private service : BackendService*/){
/*        this.service.isInitialized().subscribe(isInit=>{
            if(isInit !== true){
                return;
            }

        });*/
        let c = /*this.service.getConfigData();*/ environment.env.backend;
        if(c.recaptcha_key === undefined){
            return;
        }
        if(this.useRecaptchaKey in c){
          this.useRecaptcha = (c as any)[this.useRecaptchaKey];
        }
        let k = c.recaptcha_key;
        this.captchaKey = k;
        this.initializationInfo.next(true);
    }

    isInjected(): Observable<boolean> {
         return this.injectionInfo;
    }

    removePluginScript(): void {
      if(!this.useRecaptcha){
        return;
      }
      let ids:string[] = ["recaptcha_loader","recaptcha"];

      for(let i:number = 0;i<ids.length;i++){
          let node = document.getElementById(ids[i]);
          let parent = node?.parentNode;
          if(node !== null && parent !== null){
            parent?.removeChild(node);
          }
      }
      this.isRenderedForTheFirstTime = true;
      this.isRendered = false;
      this.pluginInjected = false;
    }

    isInitialized(): Observable<boolean> {
        return this.initializationInfo;
    }

    injectPluginScript(): void {

        if(!this.useRecaptcha){
          return;
        }

        let loadScript = document.createElement('script');
        loadScript.type = 'text/javascript';
        loadScript.innerText = "var onloadCallback = function() {};";
        loadScript.setAttribute("id", "recaptcha_loader");
        this.addDOMScript("head",loadScript);

        let script = document.createElement('script');
        script.type = 'text/javascript';
        script.setAttribute("async","");
        script.setAttribute("defer","");
        script.src = "https://www.google.com/recaptcha/api.js?onload=onloadCallback&render=explicit";
        script.setAttribute("id", "recaptcha");
        this.appendDOMScript("head",script);   
        script.onload = ()=>{
          setTimeout( ()=>{
            this.injectionInfo.next(true);  
          } ,1000 );         
        };
       
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

      private appendDOMScript(tag:string,script:HTMLElement){
        let id = script.getAttribute("id");
        if( id !== null){
            if(document.getElementById(id) !== null){
              return;
            }
        }
        document.getElementsByTagName(tag)[0].appendChild(script);        
      }

/*      private addDOMScriptOnIdentifiedNode(nodeId:string,script:HTMLElement){
        let id = script.getAttribute("id");
        if( id !== null){
            if(document.getElementById(id) !== null){
              return;
            }
        }
        document.getElementById(nodeId)?.appendChild(script);
        console.log(document.getElementById(nodeId));
      }*/

      public execute(cb:Function){
        if(!this.useRecaptcha){
          cb();
          return;
        }
        if(this.isRendered === true){
          /*console.log("Recaptcha is rendered");*/
          return;
        }

        let inst = this;

        let cbb = ()=>{
            cb();
            let el = document.getElementById('rc');
            inst.isRendered = false;
            if(el && el.style){
             //    grecaptcha.reset();
                 el.style.visibility = 'hidden';
                 el.style.display = 'None';
            }
        }
        this.renderReCaptcha(cbb);
          //console.log(grecaptcha)
        this.isRendered = true;
      }

      public reset(cb:Function){
        if(!this.useRecaptcha){
          cb();
          return;
        }
        this.isRendered = false;
        let el = document.getElementById('rc');
        if(el){
          el.innerHTML = '';
        }
        this.isRenderedForTheFirstTime = true;

        let inst = this;

        let cbb = ()=>{
            cb();
            let el = document.getElementById('rc');
            inst.isRendered = false;
            if(el && el.style){
             //    grecaptcha.reset();
                 el.style.visibility = 'hidden';
                 el.style.display = 'None';
            }
        }
        this.renderReCaptcha(cbb);
          //console.log(grecaptcha)
        this.isRendered = true;
      }


      private renderReCaptcha(cbb:Function){

        if(this.isRenderedForTheFirstTime){
         // alert("!= null " + ( document.getElementById("rc") !== null ) );
          grecaptcha.render('rc', {
            'sitekey' : this.captchaKey,
            'callback':cbb,
            'size':'compact'
          });
          this.isRenderedForTheFirstTime = false;
        }
        else{
          let el = document.getElementById('rc');
//          alert("re render")
          if(el && el.style){
            grecaptcha.reset();
               //grecaptcha.reset();
               el.style.visibility = 'visible';
               el.style.display = '';
          }
        }
      }

}