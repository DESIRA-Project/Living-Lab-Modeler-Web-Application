import { Injectable } from '@angular/core';
import { Router, RouterEvent, NavigationEnd } from '@angular/router';

 /** A router wrapper, adding extra functions. */
@Injectable()
export class RouterExtService {
  
  private previousUrl: string|undefined = undefined;
  private currentUrl: string|undefined = undefined;

  private urlHistory:string[] = [];

  constructor(private router : Router) {
    this.currentUrl = this.router.url;
    router.events.subscribe(event => {
      //console.log(event)
      if (event instanceof NavigationEnd) {
        this.previousUrl = this.currentUrl;
        this.currentUrl = event.url;
        //this.urlHistory.push(event.url);
      };
    });
  }

  public getPreviousUrl(){
   // console.log(this.urlHistory)
    return this.previousUrl;    
  }    

  public getCurrentUrl(){
    return this.currentUrl;
  }    

  public registerUrl(url:string){
    this.currentUrl = url;
   // this.urlHistory.push(url);
  }
/*
  public consume():string|undefined{
    if(this.urlHistory.length === 0) return undefined;
    let last = this.urlHistory.pop();
    if(this.urlHistory.length === 0){
        return undefined;
    }
    return this.urlHistory[this.urlHistory.length - 1];
  }*/
}