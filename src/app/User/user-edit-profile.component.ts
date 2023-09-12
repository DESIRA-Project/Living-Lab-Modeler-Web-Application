import { ChangeDetectorRef, Component } from "@angular/core";
import { BackendService } from "src/app/backend.service";
import { ValueContainerComponent } from "src/app/ComponentLibrary/value-container-component";
import { AttachableButton } from "src/app/ComponentLibrary/attachable-button";
import { DynamicModalComponent } from "src/app/ComponentLibrary/DynamicModal/dynamic-modal.component";
import { AlertSupportingComponent } from "./alert-supporting-component";
import { DynamicContent } from "../ComponentLibrary/DynamicModal/dynamic-content.component";
import { UserManagementService } from "./user-management.service";
import { DynamicItem } from "../ComponentLibrary/DynamicModal/dynamic-item.components";
import { DynamicModalContainer } from "../ComponentLibrary/DynamicModal/dynamic-modal-container";
import { UserProfileService } from "../Service/user-profile.service";
import { ErrorResponse } from "../Models/Response/error-response";
import { Response } from "../Models/Response/response";
import { AngularServicesProviderService } from "../Service/angular-services-provider.service";
import { DynamicContentParent } from "../ComponentLibrary/DynamicModal/dynamic-content-parent";
import {BootstrapBreakpoints} from "../BootstrapBreakpoints";

@Component({
    selector: 'user-edit-profile',
    templateUrl: './user-edit-profile.component.html',
    styleUrls: ['./user-edit-profile.component.css']
})

export class UserEditProfileComponent extends AlertSupportingComponent implements DynamicContent {
    private permission: string = "edit_profile";
    public title = "My Profile";
    private token: string = "";
    public ready: boolean = false;
    public submitButtonText = "Save";
    private children: ValueContainerComponent[] = [];
    private dirty: boolean = false;
    private selectedUserId = -1;
    public isReadonly = false;
    public renderInCard = window.innerWidth > BootstrapBreakpoints.sm;
    data: any = null;
    cancellableModal: any = null;
    checkModalIsOpen:boolean = false;
    modal:DynamicModalComponent | null = null;

    constructor(protected service: BackendService, protected userManagementService: UserManagementService,
                private userProfileService:UserProfileService,
                private servicesProviderService:AngularServicesProviderService,
                private cdr: ChangeDetectorRef) {
        super();
        //console.log("User edit profile ctor()")
        if (this.userManagementService !== null) {
            const token = this.userManagementService.getToken();
            if (token !== null) {
                this.token = token;
            }
        }
    }

    setParent(parent: DynamicContentParent | undefined){

    }

    setDependencies(dependencies: DynamicItem[]): void {
        if (dependencies) {
            this.cancellableModal = dependencies[0];
        }
    }

    userCanChangeRole(): boolean {
        return this.userManagementService === null ? false : this.userManagementService.userHasPermission("change_role");
    }

    ngAfterViewInit() {
        if (this.data === null && this.token !== "") {
            this.loadData();
        }
    }

    public addChild(c: any): void {
        this.children.push(c);
        if (c.setUserToken !== undefined) {
            c.setUserToken(this.token);
        }
    }

    private loadData() {
        let inst = this;
        this.checkModalIsOpen = false;
        this.ready = false;
        this.service.isInitialized().subscribe(backendInitialized => {
            if (this.selectedUserId === -1) {

                this.userProfileService.getUserProfile().subscribe( (resp:Response<any>)=>{
                    let responseData = resp.data;
                    //console.log(results);
                    this.data = [];
                    for (const key in responseData['responseData']) {
                        //console.log(responseData['responseData'][key]);
                        if (responseData['responseData'][key]["attribute"] === 'active') continue;
                        this.data.push({ name: responseData['responseData'][key]["attribute"], data: responseData['responseData'][key] });
                    }
                    this.ready = true;
                    this.cdr.detectChanges();

                }, (error:ErrorResponse)=>{
                    inst.servicesProviderService.createNewModal().alert(false, error.error.message);
                } )
            }
            else {
                this.data = [];
                //this.isReadonly = true;
                this.userProfileService.requestUserProfile(this.selectedUserId).subscribe( (resp: Response<any>) => {
                    let responseData = resp.data;
                    //  this.data = [];
                    for (const key in responseData['responseData']) {
                        //console.log(responseData['responseData'][key]);
                        if (responseData['responseData'][key]["attribute"] === 'active') continue;
                        this.data.push({ name: responseData['responseData'][key]["attribute"], data: responseData['responseData'][key] });
                    }
                    this.ready = true;
                    this.cdr.detectChanges();
                }, (error:ErrorResponse)=>{
                    inst.servicesProviderService.createNewModal().alert(false, error.error.message);
                });
            }
        });
    }

    initialize(parent: DynamicModalContainer): void {
        /*        alert("initialize user-edit-prof")
                console.log(this.data);*/
        this.selectedUserId = this.data.userId;
        this.isReadonly = !this.data.edit;
        if (this.selectedUserId !== -1) {
            this.data = [];
            this.children = [];
            this.title = "";
            this.renderInCard = false;
            if (!this.isReadonly && !this.renderInCard) {
                let inst = this;
                let onChange = () => {
                    return inst.onChange();
                };
                let save = () => {
                    inst.save(() => {
                        if (parent.getParent()) {
                            parent.getParent()?.loadData();
                        }
                        if (parent) {
                            parent.closeModal();
                        }
                    });
                    //      console.log(parent)
                }
                //console.log(parent)
                let b: AttachableButton = new AttachableButton(this.submitButtonText, onChange, save, "blue-text");
                parent.addButton(b);
            }
            this.loadData();
        }
    }
    getUserToken(): string | null {
        return this.userManagementService !== null ? this.userManagementService.getToken() : null;
    }

    initializeWithAuthData(userToken: string): void {
        //        alert("initialize with data user-edit-prof")

        this.token = userToken;
        this.data = null;
    }

    onChange(): boolean {
        return this.dirty;
    }

    save(onFinish: Function | null): void {
        let inst = this;

        let applySave = () => {
            let changes: any = {};
            for (let i = 0; i < this.children.length; i++) {
                if (inst.children[i].valueHasChanged()) {
                    //console.log ( this.children[i].getValue() );
                    let change = inst.children[i].getValue();
                    let key: string = change.name;
                    if (key !== undefined && key !== null) {
                        changes[key] = change.options;
                        inst.children[i].save();
                    }
                }
            }
            //console.log(changes);
            inst.ready = false;

            if (inst.selectedUserId !== -1) {
                let params = { /*token: inst.token,*/ changes: changes, userId: inst.selectedUserId };

                inst.userProfileService.requestUpdateUserProfile(params).subscribe ((results: any) => {
                    inst.closeModal();
                    inst.dirty = false;
                    inst.servicesProviderService.createNewModal().alert(true, results.data.responseData[0].description);
                    inst.data = [];
                    inst.loadData();

                    if (onFinish) {
                        onFinish();
                    }
                },(error:ErrorResponse)=>{
                    inst.servicesProviderService.createNewModal().alert(false, error.error.message);
                });

            } else {
                let params = { /*token: inst.token,*/ changes: changes };

                inst.userProfileService.updateUserProfile(params).subscribe((results: any) => {
                    inst.closeModal();
                    if(inst.modal){
                        inst.modal.closeModal();
                    }

                    inst.dirty = false;
                    if (results.data.responseData !== null && results.data.responseData.length == 2) {
                        inst.userManagementService.updateToken(results.data.responseData[1]);
                    }
                    inst.servicesProviderService.createNewModal().alert(true, results.data.responseData[0].description);
                    inst.data = [];
                    inst.loadData();
                },(error:ErrorResponse)=>{
                    inst.servicesProviderService.createNewModal().alert(false, error.error.message);
                });
            }
        };
        let objectData = {msg: this.selectedUserId !== -1 ? "Would you really like to update the user's profile?" :
        "Would you really like to update your user's profile?",title:"Update User Profile",onSubmit:applySave,acceptButtonText:"Update"};
        if(this.cancellableModal){
            this.cancellableModal.setData(objectData);
            this.openModal();
       }
       else{
           applySave();
       }
    }

    closeModal(){
        this.checkModalIsOpen = false;
    }

    openModal(){
        this.checkModalIsOpen = true;
    }

    onModalClose():Function{
        let inst = this;
        return ()=>{
             inst.checkModalIsOpen = false;
        }
    }

    notifyForChange() {
        //console.log("notify for change")
        this.dirty = false;
        for (let i = 0; i < this.children.length; i++) {
            if (this.children[i].valueHasChanged()) {
                this.dirty = true;
            }
        }
    }

}
