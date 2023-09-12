import { Component, Input, ViewChild } from "@angular/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { PageConfigService } from "../pageconfig.service";
import { PluginService } from "../PluginService/plugin-service.service";
import { KBTCookieService } from "./cookie-service.component";

@Component({
    selector: 'cookie-banner',
    templateUrl: './cookie-banner.component.html',
    styleUrls: ['../style/cookie-banner.css'],
    providers: []
  })

  export class CookieBanner {

      data:any = null;
      _modal:any = null;
      sentences:SafeHtml[] = []
      @ViewChild("cookieBannerContent") content:any;

      cookieCategoryToggleState:boolean[] = [];
      cookieCategoryInability:boolean[] = [];
      mode:number = 0;
      appCookieName:string|null = null;
      initialized:boolean = false;
      isModalClosed:boolean = true;
      onDismiss:Function = ()=>{};

      openFromExternalMedium:boolean = false;
      @Input() set openFromExternalMediumOption(option:boolean){
          this.openFromExternalMedium = option;
          setTimeout(()=>{
            this.openCookiesModal();
          },500);
      }

      @Input() set cb(func:Function){
        if(func !== null){
          this.onDismiss = func;
        }
    }

  ready = false;

  constructor(private service:KBTCookieService,
                  private modalService:NgbModal,
                  private sanitizer: DomSanitizer,
                  private pluginService:PluginService){

             this.service.isInitialized().subscribe((value) =>{
                 if(value !== true){
                     return;
                 }
                 this.data = this.service.getData();
                 let htmlSentences = this.data.cookie_modal.content;
                 for(let i:number = 0 ;i<htmlSentences.length;i++){
                     this.sentences.push(this.sanitizer.bypassSecurityTrustHtml(htmlSentences[i]));
                 }

                 this.loadCookieOptions();

                 this.appCookieName = this.data.cookie_object_name;
                 this.pluginService.isInitialized().subscribe((value)=>{

                  if(value !== true){
                    return;
                  }
                  this.initialized = true;
                 });

               this.ready = true;
             });
      }

      private loadCookieOptions(){
        let hasCookieInstalled:boolean = this.service.hasAppCookieObject();
        if(!hasCookieInstalled){
            for(let i:number =  0;i<this.data.cookie_modal.cookie_settings.cookie_categories.length;i++){
                if(this.data.cookie_modal.cookie_settings.cookie_categories[i].default_value !== undefined){
                    this.cookieCategoryInability.push(
                      this.data.cookie_modal.cookie_settings.cookie_categories[i].default_value);
                }
                else{
                   this.cookieCategoryInability.push(false);
               }
              this.cookieCategoryToggleState.push(false);
           }
       }
       else{
           let cookieObject = this.service.getAppCookieObject();
           if(cookieObject !== null){
             cookieObject = JSON.parse(cookieObject);
             if(cookieObject.cookieInfo !== undefined){
               for(let i:number = 0;i<cookieObject.cookieInfo.length;i++){
                   let cookie = cookieObject.cookieInfo[i];
                   this.cookieCategoryInability.push(cookie.enabled);
                   this.cookieCategoryToggleState.push(false);
               }
             }
           }
       }
      }

      usingCookies(){
        return this.service.hasCookieObject(this.data.cookie_object_name);
      }

      switchCookieState(i:number){
          this.cookieCategoryInability[i] = !this.cookieCategoryInability[i];
      }

      saveCookieSettings(){
           console.log(this.cookieCategoryInability);
           let cookieInfo = [];
           let cookiePlan: { [key:string]:number; } = {};

           for(let i:number =  0;i<this.data.cookie_modal.cookie_settings.cookie_categories.length;i++){
                cookieInfo.push({name:this.data.cookie_modal.cookie_settings.cookie_categories[i].code,
                  enabled:this.cookieCategoryInability[i]});
                  cookiePlan[this.data.cookie_modal.cookie_settings.cookie_categories[i].plugin] = this.cookieCategoryInability[i] === true ? 1 : 0;
           }

           this.storeCookieObject(cookieInfo);
           this.pluginService.setupPlugins(cookiePlan);
      }

      toggleCookieCategory(cat:number){
        this.cookieCategoryToggleState[cat] = !this.cookieCategoryToggleState[cat];
        for(let i:number = 0;i<this.cookieCategoryToggleState.length;i++){
          if(cat === i) continue;
          this.cookieCategoryToggleState[i] = false;
        }
      }

      acceptAllCookies(){
          let cookieInfo = [];
          let cookiePlan: { [key:string]:number; } = {};

          for(let i:number =  0;i<this.data.cookie_modal.cookie_settings.cookie_categories.length;i++){
               cookieInfo.push({name:this.data.cookie_modal.cookie_settings.cookie_categories[i].code, enabled:true});
               cookiePlan[this.data.cookie_modal.cookie_settings.cookie_categories[i].plugin] = 1;
          }

          this.storeCookieObject(cookieInfo);
          this.pluginService.setupPlugins(cookiePlan);
        }

        rejectAllCookies(){
          let cookieInfo = [];
          let cookiePlan: { [key:string]:number; } = {};

          for(let i:number =  0;i<this.data.cookie_modal.cookie_settings.cookie_categories.length;i++){
            if(this.data.cookie_modal.cookie_settings.cookie_categories[i].always_enabled !== undefined){
               if(this.data.cookie_modal.cookie_settings.cookie_categories[i].always_enabled === true){
                 cookieInfo.push({name:this.data.cookie_modal.cookie_settings.cookie_categories[i].code, enabled:true})
                 cookiePlan[this.data.cookie_modal.cookie_settings.cookie_categories[i].plugin] = 1;
               }
               else{
                cookieInfo.push({
                  name:this.data.cookie_modal.cookie_settings.cookie_categories[i].code,
                  enabled:this.data.cookie_modal.cookie_settings.cookie_categories[i].default_value});
               }
               cookiePlan[this.data.cookie_modal.cookie_settings.cookie_categories[i].plugin] = this.data.cookie_modal.cookie_settings.cookie_categories[i].default_value === true ? 1 : 0;

            }
          }

          this.storeCookieObject(cookieInfo);
          this.pluginService.setupPlugins(cookiePlan);

        }


      private storeCookieObject(cookieInfo:any[]){
/*        console.log("Storing cookie with name");
        console.log(this.appCookieName);*/
        if(this.appCookieName !== null){
          this.service.storeCookieObject(this.appCookieName, JSON.stringify( {cookieInfo:cookieInfo}) );
        }

        //close modal if possible
        this.closeModal();

      }

      openCookiesModal(){
        this.mode = 0;
        this._modal = this.modalService.open(this.content);
        this.isModalClosed = false;

        const parentRef = this;
        this._modal.result.then(function(){
            //Get triggers when modal is closed
            //parentRef._parent.setToggleFilterModal(false);
            parentRef.isModalClosed = true;
            parentRef.mode = 0;

            if(parentRef.onDismiss !== null){
              parentRef.onDismiss ();
            }
           }, function(){
            //gets triggers when modal is dismissed.
            //parentRef._parent.setToggleFilterModal(false);

            if(parentRef.onDismiss !== null){
              parentRef.onDismiss ();
            }

            parentRef.isModalClosed = true;

           })

      }

      switchMode(n:number){
        this.mode = 1;
      }

      closeModal(){
        if(this.modalService.hasOpenModals()){
          this.modalService.dismissAll();
        }
        this.mode = 0;
        this.isModalClosed = true;
        if(this.onDismiss !== null){
          this.onDismiss ();
        }
      }

      anotherModalIsOpen(){
          return this.modalService.hasOpenModals();
      }

  }
