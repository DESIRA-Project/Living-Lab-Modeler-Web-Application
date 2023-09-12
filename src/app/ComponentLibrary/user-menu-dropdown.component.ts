import { Component, Input } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { BackendService } from "../backend.service";
import { Subscriber } from "../User/subscriber";
import { UserManagementService } from "../User/user-management.service";
import { ResolutionAwareComponent } from "./resolutionaware.component";
import { DynamicContentParent } from "./DynamicModal/dynamic-content-parent";

@Component({
    selector: 'user-menu-dropdown',
    templateUrl: './user-menu-dropdown.component.html',
    styleUrls: ['../style/user-menu-dropdown.css'],
    providers: []
})

export class UserMenuDropdownComponent extends ResolutionAwareComponent implements Subscriber{
    @Input() data:any = null;
    private token:string|null = null;
    public firstName:string|null = null;
    public lastName:string|null = null;
    public tokenFetched:boolean = false;
    public userProfileObject:any = null;


    @Input() parent : DynamicContentParent | null = null;

    @Input() set setUserProfileObject(userProfileObject:any){
         this.userProfileObject = userProfileObject;
    }

    constructor(private service:BackendService, private userManagementService:UserManagementService, private router:Router){
        super();
        this.token = this.userManagementService.getToken();
        this.userManagementService.addSubscriber("userMenuDropDown", this);
        if(this.token !== null){
            let s  = this.userManagementService.getUserInfo();
            this.firstName = s.firstName;
            this.lastName = s.lastName;
            //this.identifyCurrentUserView(this.currentUserRole);
            this.tokenFetched = true;
        }
    }

    update(): void {
        this.tokenFetched = false;
        let s  = this.userManagementService.getUserInfo();
        this.firstName = s.firstName;
        this.lastName = s.lastName;
        this.tokenFetched = true;
    }

    signOut(){
        //console.log("signing out")
        this.userManagementService.clear();
  }

  setFirstName(firstName:string){
       this.firstName = firstName;
  }

  setLastName(lastName:string){
      this.lastName = lastName;
  }

  visitUsersProfile(){
    this.parent?.goToPage("my-profile");
  }
}
