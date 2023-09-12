import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { LivingLabService } from '../Service/living-lab.service';
import { AssetsService } from '../Service/assets.service';
import { SDG } from '../Models/SDG';
import { DigitalTechnology } from '../Models/DigitalTechnology';
import { ActivatedRoute, Router } from '@angular/router';
import { Response } from '../Models/Response/response';
import { ErrorResponse } from '../Models/Response/error-response';
import { BreadcrumbController } from '../Breadcrumb/breadcrumb-controller';
import { BreadcrumbComponent } from '../Breadcrumb/breadcrumb.component';
import { environment } from '../../environments/environment';
import { Location } from '@angular/common';
import { SubscriptionLike } from 'rxjs';
import { MatTabGroup } from '@angular/material/tabs';
import { RouterExtService } from '../Service/router-ext.service';

@Component({
  selector: 'app-living-lab-view-page',
  templateUrl: './living-lab-view-page.component.html',
  styleUrls: ['./living-lab-view-page.component.css']
})
export class LivingLabViewPageComponent implements OnInit, BreadcrumbController {

  ready = false;
  id = -1;
  livingLab: any;
  tabNo = 0;
  fragment = '';
  private breadcrumb: BreadcrumbComponent | null = null;
  environment = environment;
  defaultMainPhoto = false;
  mainPhotoHeight = 'auto';
  mainPhotoWidth = 'auto';
  mainPhotoMaxWidth = '100%';
  public subscription: SubscriptionLike = {} as SubscriptionLike;
  goBackCounter = 0;

  prevUrl = "/";

  constructor(private activatedRoute: ActivatedRoute,
    private router: Router,
    private livingLabService: LivingLabService,
    private assetsService: AssetsService,
    private location: Location,
    private routerExt:RouterExtService) {

      let u = this.routerExt.getCurrentUrl();
      if(u){
          this.prevUrl = u;
      }
      this.activatedRoute.params.subscribe(params => this.id = +params.livingLabId);
    this.activatedRoute.queryParams.subscribe(queryParams => {
      this.tabNo = queryParams.tabNo;
      if (this.tabNo === undefined || this.tabNo < 0 || 6 <= this.tabNo) {
        this.tabNo = 0;
      }
    });

    let inst = this;
   this.storeState(true);

   this.subscription = this.location.subscribe((s: any) => {
    let u = inst.getPrevUrl(s);
    if(u === '/living-lab/'+this.id){
      let u = this.prevUrl;
      this.subscription.unsubscribe();
      let prev = inst.getPrevCounter(s);
      let old = {url:u, prev:prev };
      window.history.pushState(old, 'current', u);
      this.location.replaceState(u, undefined,   old );
      return;
    }
   });
  }

  getPrevCounter(s: any) {
    let prev = 0;
    if (s.state && s.state.prev !== undefined) {
      prev = s.state.prev;
    }
    else {
      if (s.prev !== undefined)
        prev = s.prev;
    }
    return prev;
  }

  getPrevUrl(s: any) {
    let url = '';
    if (s.state && s.state.url !== undefined) {
      url = s.state.url;
    }
    else {
      if (s.url !== undefined)
        url = s.url;
    }
    return url;
  }

  storeState(replaceUrl: boolean) {
    let url: string = this.router.url;
    if (url.indexOf("=") === -1) {
      url += "?tabNo=" + this.tabNo + "#tabs";
    }
    else {
      let tok = url.split("=")[0];
      url = tok + "=" + this.tabNo + "#tabs";

    }
    let st = history.state;
    if (st === null) {
      st = {};
    }
    let prevUrl = st.url;
    st.url = url;
    st.prev = this.tabNo;

    if (replaceUrl) {
      if (prevUrl === url) return;
      window.history.pushState(st, 'current', url);
      this.location.replaceState(url, /*"tabNo="+this.tabNo*/undefined, st);
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }


  public selectTab(i: number) {
    //console.log("selecting tab " + i);
    if (i === this.tabNo) return;
    this.tabNo = i;
    this.storeState(true);
  }

  setPath(path: any[] | undefined): void {
    if (this.breadcrumb !== null) {
      if (path === undefined) {
        this.breadcrumb.setPath(null);
      }
      else {
        this.breadcrumb.setPath(path);
      }
    }
  }

  setLabel(label: string): void {
    if (this.breadcrumb !== null) {
      this.breadcrumb.setLabel(label);
    }
  }

  setBreadcrumb(inst: BreadcrumbComponent): void {
    if (inst !== null) {
      this.breadcrumb = inst;
    }
  }

  ngOnInit(): void {

    this.activatedRoute.fragment.subscribe(fragment => { this.fragment = fragment; });

    let serviceCall: any;
    if (this.id === -1) {
      serviceCall = this.livingLabService.getMockLivingLab();
    }
    else {
      serviceCall = this.livingLabService.get(this.id);
    }

    serviceCall.subscribe(
      (response: Response<any>) => {
        this.livingLab = response.data;
        // this.setPath([{ name: "Living Lab Modeler", key: "home" }, { name: "Content Management", key: "" }]);

        this.setLabel(this.livingLab.name);

        this.defaultMainPhoto = this.livingLab.iconUrl == null;
        this.livingLab.iconUrl = this.defaultMainPhoto ? undefined : this.assetsService.getAssetLink(this.livingLab.iconUrl);
        this.mainPhotoHeight = this.defaultMainPhoto ? '500px' : this.mainPhotoHeight;
        this.mainPhotoWidth = this.defaultMainPhoto ? 'auto' : this.mainPhotoWidth;
        this.livingLab.sdgs.forEach((sdg: SDG) => sdg.iconUrl = this.assetsService.getAssetLink(sdg.iconUrl));
        this.livingLab.digitalTechnologies.forEach((digitalTechnology: DigitalTechnology) => digitalTechnology.iconUrl = this.assetsService.getAssetLink(digitalTechnology.iconUrl));
        this.ready = true;
      },
      (error: ErrorResponse) => this.router.navigate(['/'])
    );
  }

  // When mainScreen is loaded, scroll into view if needed
  @ViewChild('mainScreen', { static: false }) set mainScreen(mainScreen: ElementRef) {
    if (mainScreen) {
      setTimeout(
        () => document.querySelector('#' + this.fragment)?.scrollIntoView({ behavior: 'smooth' })
        , 100);
    }
  }

}
