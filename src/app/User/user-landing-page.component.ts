import {AfterViewInit, Component, OnInit, ViewChild} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { JwtHelperService } from "@auth0/angular-jwt";
import { environment } from "src/environments/environment";
import { PageFunction } from "../ComponentLibrary/DynamicSidebar/page-function"
import { UserFunctionContentComponent } from "../ComponentLibrary/DynamicSidebar/user-function-content.component";
import { UserFunctionListComponent } from "../ComponentLibrary/DynamicSidebar/user-function-list.component";
import { UserListManager } from "../ComponentLibrary/DynamicSidebar/user-list-manager";
import { Location } from '@angular/common';
import { UserManagementService } from "./user-management.service";
import { BreadcrumbComponent } from "../Breadcrumb/breadcrumb.component";
import { BreadcrumbController } from "../Breadcrumb/breadcrumb-controller";
import { PageView } from "../ComponentLibrary/DynamicSidebar/page-view";
import { NavigationEvent } from "@ng-bootstrap/ng-bootstrap/datepicker/datepicker-view-model";
import { LocalStorageDefs } from "../Models/LocalStorageDefs";
import { SubscriptionLike } from "rxjs";
//import { BreadcrumbController } from "../Breadcrumb/breadcrumb-controller";
//import { BreadcrumbComponent } from "../Breadcrumb/breadcrumb.component";
import { DynamicContentParent } from "../ComponentLibrary/DynamicModal/dynamic-content-parent";
import { DynamicContent } from "../ComponentLibrary/DynamicModal/dynamic-content.component";
import { LlJoinRequestDispatcherService } from "../Service/ll-join-request-dispatcher.service";
import { LivingLabService } from "../Service/living-lab.service";
import { Response } from "../Models/Response/response";
import { ErrorResponse } from "../Models/Response/error-response";
import { AngularServicesProviderService } from "../Service/angular-services-provider.service";
import { LLUserMembershipService } from "../Service/ll-user-membership.service";
import {MatDrawer} from "@angular/material/sidenav";
import {BootstrapBreakpoints} from "../BootstrapBreakpoints";


@Component({
    selector: 'user-landing',
    templateUrl: './user-landing-page.component.html',
    styleUrls: ['../style/user-landing-page.css'],
})

export class UserLandingPageComponent implements UserListManager, BreadcrumbController, DynamicContentParent {

    public firstName: string = "";
    public lastName: string = "";
    public userId: number = -1;
    public tokenFetched: boolean = false;
    private token: string | null = null;
    public activeItem: number = 0;
    public activeChild: number = 0;
    // private configKey: any = "user_landing_page";
    private pageViews: PageFunction[] = [];
    private currentUserRole: string = "";
    // private currentUserView:number = -1;
    private userFunctionList: UserFunctionListComponent | null = null;
    private userFunctionContent: UserFunctionContentComponent | null = null;
    private breadcrumb: BreadcrumbComponent | null = null;
    private viewIdentified = false;
    private latestState: any = null;
    private onreload = false;
    public subscription: SubscriptionLike = {} as SubscriptionLike;
    currentViewInst: DynamicContent | undefined;
    window = window;
    bootstrapBreakpoints = BootstrapBreakpoints;
    @ViewChild('drawer') drawer?: MatDrawer;


  constructor(
        private joinRequestDispatcher: LlJoinRequestDispatcherService,
        private jwtHelper: JwtHelperService,
        private angularService: AngularServicesProviderService,
        private route: ActivatedRoute,
        private router: Router,
        private userManagementService: UserManagementService,
        private location: Location,
        private membershipService: LLUserMembershipService,
        private livingLabService: LivingLabService) {
        this.token = this.userManagementService.getToken();

        if (this.token !== null) {
            let s = this.userManagementService.getUserInfo();
            this.firstName = s.firstName;
            this.lastName = s.lastName;
            this.userId = s.id;
            this.currentUserRole = s.role;
            this.initializePageViews();
            this.tokenFetched = true;
        }

        let inst = this;
        this.subscription = this.location.subscribe(s => {
            if (s.pop === true) {

                //console.log(s);
                if (s.url) {
                    inst.goToPage(s.url);
                }
                // if (inst.onreload) return;
                if (s.state === undefined) return;
                if (!inst.latestState) return;
                return;
            }
        });

        this.handlePendingJoinRequest();
    }

    private handlePendingJoinRequest() {
        if (!this.joinRequestDispatcher.hasJoinRequest()) {
            return;
        }
        let llId: number = this.joinRequestDispatcher.getLastJoinRequest();
        if (llId === -1) {
            return;
        }
        let inst = this;

        //check if the LL exists
        this.livingLabService.livingLabIdIsValid(llId).subscribe(
            (response: Response<Boolean>) => {
                if (response.data === true) {
                    //check if he/she is a member already
                    /*console.log(inst.userId)
                    console.log(llId);*/
                    inst.membershipService.checkUserLivingLabMembership(inst.userId, llId).subscribe((response: Response<Boolean>) => {
                        if (response.data === true) {
                            inst.angularService.createNewModal().alert(true, "You are already member of the Living Lab you requested to join.");
                            //redirect to my living labs
                            inst.goToPage('/my-living-labs');
                            inst.joinRequestDispatcher.clearJoinRequest();
                        }
                        else {
                            //check if he already sent a join request
                            inst.membershipService.checkUserHasAlreadyRequestedJoin(inst.userId, llId).subscribe((response: Response<Boolean>) => {
                                if (response.data === true) {
                                    inst.angularService.createNewModal().alert(true, "You are have already requested to join that Living Lab.");
                                    inst.goToPage('/all-living-labs');
                                    inst.joinRequestDispatcher.clearJoinRequest();
                                }
                                else {
                                    inst.goToPage('/all-living-labs');
                                }
                            },
                                (error: ErrorResponse) => console.log(error.error.message)
                            );
                        }
                    },
                        (error: ErrorResponse) => console.log(error.error.message)
                    );
                }
                else {
                    console.log("The Living Lab with id " + llId + " is not valid.");
                    inst.angularService.createNewModal().alert(false, "Please retry joining the Living Lab.");
                    inst.joinRequestDispatcher.clearJoinRequest();
                }
            },
            (error: ErrorResponse) => console.log(error.error.message)
        );

    }

    ngOnDestroy() {
        // alert("unsubscribe")
        this.subscription.unsubscribe();
    }


    goToMyLivingLabs() {
        let st = history.state;
        this.latestState = st;
        let url = this.latestState.u = '/my-living-labs';

        window.history.pushState({ u: url }, 'current', url);
        this.location.replaceState(url, undefined, st);

        history.back();
    }


    setLabel(label: string): void {
        if (this.breadcrumb !== null) {
            this.breadcrumb.setLabel(label);
        }
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

    setBreadcrumb(inst: BreadcrumbComponent): void {
        if (inst !== null) {
            this.breadcrumb = inst;
        }
    }

    identifyCurrentView(): number[] {
        /*console.log("identify current view");*/
        let url = this.router.url.split('?')[0];  // Added the split['?'] in order to ignore get parameters
        let tokens = url.split("\/");
        tokens = tokens.filter((e) => {
            return e !== ""
        });

        //console.log(url);
        if (tokens.length === 1) {
            url = "/" + tokens[0];

            for (let i = 0; i < this.pageViews.length; i++) {
                if (url === this.pageViews[i].url) {
                    this.setLabel(this.pageViews[i].breadcrumb_label);
                    this.setPath(this.pageViews[i].breadcrumb_path);
                    /*console.log("identify current view calls set active item "+i)*/
                    this.setActiveItem(i);
                    this.viewIdentified = true;
                    return [i];
                }

                let children = null;
                if ((children = this.pageViews[i].children) !== undefined) {
                    for (let j = 0; j < children.length; j++) {
                        if (children[j].url === url) {
                            this.setLabel(children[j].breadcrumb_label);
                            this.setPath(children[j].breadcrumb_path);
                            this.setActiveChild([i, j]);
                            this.userFunctionList?.openParentNodeIfClosed(i);
                            this.viewIdentified = true;
                            return [i, j];
                        }
                    }
                }
            }
        }
        else{
            let initialURL = url;
            url = "/" + tokens[0];

            let params = initialURL.split(url)[1];
            //console.log(params);

            for (let i = 0; i < this.pageViews.length; i++) {
                if (url === this.pageViews[i].url) {
                    this.setLabel(this.pageViews[i].breadcrumb_label);
                    this.setPath(this.pageViews[i].breadcrumb_path);
                    /*console.log("identify current view calls set active item "+i)*/
                    this.setActiveItemWithParams(i,params);
                    this.viewIdentified = true;
                    return [i];
                }

                let children = null;
                if ((children = this.pageViews[i].children) !== undefined) {
                    for (let j = 0; j < children.length; j++) {
                        if (children[j].url === url) {
                            this.setLabel(children[j].breadcrumb_label);
                            this.setPath(children[j].breadcrumb_path);
                            this.setActiveChild([i, j]);
                            this.userFunctionList?.openParentNodeIfClosed(i);
                            this.viewIdentified = true;
                            return [i, j];
                        }
                    }
                }
            }
        }

        return [];

    }

    identifyCurrentViewForUrl(url: string): number[] {
        /*console.log("identify current view");*/
        let tokens = url.split("\/");
        tokens = tokens.filter((e) => {
            return e !== ""
        });
        /*console.log(url);
        console.log(tokens)*/
        if (tokens.length === 1) {
            url = "/" + tokens[0];

            for (let i = 0; i < this.pageViews.length; i++) {
                if (url === this.pageViews[i].url) {
                    this.setLabel(this.pageViews[i].breadcrumb_label);
                    this.setPath(this.pageViews[i].breadcrumb_path);
                    /*console.log("identify current view calls set active item "+i)*/
                    this.setActiveItem(i);
                    this.viewIdentified = true;
                    return [i];
                }

                let children = null;
                if ((children = this.pageViews[i].children) !== undefined) {
                    for (let j = 0; j < children.length; j++) {
                        if (children[j].url === url) {
                            this.setLabel(children[j].breadcrumb_label);
                            this.setPath(children[j].breadcrumb_path);
                            this.setActiveChild([i, j]);
                            this.userFunctionList?.openParentNodeIfClosed(i);
                            this.viewIdentified = true;
                            return [i, j];
                        }
                    }
                }
            }
        }
        else{
            let initialURL = url;
            url = "/" + tokens[0];

            let params = initialURL.split(url)[1];
            /*console.log(url)
            console.log(params);*/

            for (let i = 0; i < this.pageViews.length; i++) {
                if (url === this.pageViews[i].url) {
                    this.setLabel(this.pageViews[i].breadcrumb_label);
                    this.setPath(this.pageViews[i].breadcrumb_path);
                    /*console.log("identify current view calls set active item "+i)*/
                    //console.log("set active item with params "+params)
                    this.setActiveItemWithParams(i,params);
                    this.viewIdentified = true;
                    return [i];
                }

                let children = null;
                if ((children = this.pageViews[i].children) !== undefined) {
                    for (let j = 0; j < children.length; j++) {
                        if (children[j].url === url) {
                            this.setLabel(children[j].breadcrumb_label);
                            this.setPath(children[j].breadcrumb_path);
                            this.setActiveChild([i, j]);
                            this.userFunctionList?.openParentNodeIfClosed(i);
                            this.viewIdentified = true;
                            return [i, j];
                        }
                    }
                }
            }
        }

        return [];



    }

    setFunctionList(u: UserFunctionListComponent): void {
        this.userFunctionList = u;
        this.setupFunctionManagers();
    }
    setFunctionContentComponent(c: UserFunctionContentComponent): void {
        this.userFunctionContent = c;
        this.setupFunctionManagers();
    }

    setupFunctionManagers() {
        if (this.userFunctionList !== null && !this.viewIdentified && this.userFunctionContent !== null) {

            let items: number[] = this.identifyCurrentView();
            if (items.length < 2) {
                this.userFunctionList.initialize(this.activeItem);
                //   this.userFunctionContent.setActiveItem(this.activeItem);
                return;
            }
            this.userFunctionList.setActiveChild(items);
            //this.userFunctionContent.setActiveChild(items);
        }

    }

    getToken(): string {
        if (this.token !== null) {
            return this.token;
        }
        return '';
    }

    goToPage(name: string): void {
        //console.log("go to page " + (this.userFunctionList !== null && this.userFunctionContent !== null));
/*        console.log("go to page");
        console.log(this.userFunctionList !== null && this.userFunctionContent !== null);*/
        if (this.userFunctionList !== null && this.userFunctionContent !== null) {
            let items: number[] = this.identifyCurrentViewForUrl(name);
            //console.log(items)
            if (items.length < 2) {
                this.userFunctionList.initialize(this.activeItem);
                //   this.userFunctionContent.setActiveItem(this.activeItem);
                return;
            }
            this.userFunctionList.setActiveChild(items);
            //this.userFunctionContent.setActiveChild(items);
        }
    }


    setActiveItemWithParams(i: number, p:string) {
        //    if(this.activeItem === i) return;
        /*console.log("USER LANDING set active item " + i);*/
        /*        console.log(this.userFunctionContent);*/
        this.activeItem = i;
        let url = this.pageViews[this.activeItem].url + p;
/*        console.log("url to access")
        console.log(url);*/
        this.setLabel(this.pageViews[this.activeItem].breadcrumb_label);
        this.setPath(this.pageViews[this.activeItem].breadcrumb_path);

        let st = history.state;
        //console.log("OLD ST "+JSON.stringify(st));
        if (st !== null && st.u !== undefined) {

            // we are coming from a navigation action
            if (st.u === url) {

                if (this.userFunctionContent !== null) {
                    /*console.log("user function content not null")*/
                    this.userFunctionContent.setActiveItem(i, this);
                }
                return;
            }
        }

        if (st && st.u === undefined) {
            st.u = url;
        }

        if (st === null) {
            st = { u: url };
        }


        this.latestState = st;
        this.latestState.u = url;

        //console.log("NEW ST "+JSON.stringify(  this.latestState ));

        window.history.pushState({ u: url }, 'current', url);
        this.location.replaceState(url, undefined, st);
        //console.log("url set "+url)
        if (this.userFunctionContent !== null) {
            //console.log(this)
            this.userFunctionContent.setActiveItem(i, this);
        }
    }


    setActiveItem(i: number) {
        //    if(this.activeItem === i) return;
        /*console.log("USER LANDING set active item " + i);*/
        /*        console.log(this.userFunctionContent);*/
        this.activeItem = i;
        let url = this.pageViews[this.activeItem].url;
        this.setLabel(this.pageViews[this.activeItem].breadcrumb_label);
        this.setPath(this.pageViews[this.activeItem].breadcrumb_path);

        let st = history.state;

        if (st !== null && st.u !== undefined) {

            // we are coming from a navigation action
            if (st.u === url) {

                if (this.userFunctionContent !== null) {
                    /*console.log("user function content not null")*/
                    this.userFunctionContent.setActiveItem(i, this);
                }
                return;
            }
        }

        if (st && st.u === undefined) {
            st.u = url;
        }

        if (st === null) {
            st = { u: url };
        }



        this.latestState = st;
        this.latestState.u = url;

        window.history.pushState({ u: url }, 'current', url);
        this.location.replaceState(url, undefined, st);


        if (this.userFunctionContent !== null) {
            //console.log(this)
            this.userFunctionContent.setActiveItem(i, this);
        }
    }

    setActiveChild(indices: number[]): void {

        this.activeItem = indices[0];
        this.activeChild = indices[1];
        let childIndex = indices[1];
        let p: PageFunction = this.pageViews[this.activeItem];
        if (!p.children) return;
        let c = p.children[childIndex];

        let url = c.url;
        this.setLabel(c.breadcrumb_label);
        this.setPath(c.breadcrumb_path);
        this.location.replaceState(url);
        if (this.userFunctionContent !== null) {
            this.userFunctionContent.setActiveChild(indices);
        }

    }


    private initializePageViews() {
        if ("user_landing_page" in environment.env) {
            this.pageViews = environment.env.user_landing_page.views;
        }
    }

    public getCurrentUserView(): PageFunction[] | null {
        return this.pageViews;
    }


    setCurrentViewInst(inst: DynamicContent) {
        this.currentViewInst = inst;
    }


    checkCurrentViewDirty(): boolean {
        if (this.currentViewInst && this.currentViewInst.isDirty) {
            return this.currentViewInst.isDirty();
        }
        else {
            return false;
        }
    }
}
