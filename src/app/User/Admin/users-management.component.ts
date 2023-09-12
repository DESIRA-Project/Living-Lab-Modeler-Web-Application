import {AfterViewInit, Component, Input, ViewChild} from "@angular/core";
import { BackendService } from "src/app/backend.service";
import { DynamicContent } from "src/app/ComponentLibrary/DynamicModal/dynamic-content.component";
import { DynamicContentService } from "src/app/ComponentLibrary/DynamicModal/dynamic-content.service";
import { DynamicHTMLContentService } from "src/app/ComponentLibrary/DynamicModal/dynamic-html-content.service";
import { DynamicItem } from "src/app/ComponentLibrary/DynamicModal/dynamic-item.components";
import { DynamicModalContainer } from "src/app/ComponentLibrary/DynamicModal/dynamic-modal-container";
import { ModalController } from "src/app/ComponentLibrary/DynamicModal/modal-controller";
import { ErrorResponse } from "src/app/Models/Response/error-response";
import { Response } from "src/app/Models/Response/response";
import { AngularServicesProviderService } from "src/app/Service/angular-services-provider.service";
import { UserProfileService } from "src/app/Service/user-profile.service";
import { AlertSupportingComponent } from "../alert-supporting-component";
import { User } from "../user";
import { UserManagementService } from "../user-management.service";
import {MatTableDataSource} from "@angular/material/table";
import {MatSort, Sort} from "@angular/material/sort";
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import { DynamicContentParent } from "src/app/ComponentLibrary/DynamicModal/dynamic-content-parent";
@Component({
    selector: 'users-management-component',
    templateUrl: './users-management.component.html',
    styleUrls:['../../style/tables.css', './users-management.component.css'],
})
export class UsersManagementComponent extends AlertSupportingComponent implements ModalController, DynamicContent, AfterViewInit {
    data: any;
    ready = false;
    protected token:string = "";
    users:User[] = [];
    title="Users Management";
    private dependencies:any;
    private selectedUserProfileContent:any;
    private modalTitle = "";
    public modal:any = null;
    public modalIsOpen = false;
    cancellableOperationModalIsOpen = false;
    public cancellableOperationContent:any;
    displayedColumns: string[] = ['user', 'email', 'role', 'actions'];
    dataSource = new MatTableDataSource(this.users);

    defaultResultLength = 10;
    // @ts-ignore
    @ViewChild(MatSort) sort: MatSort;

    // @ts-ignore
    @ViewChild(MatPaginator) paginator: MatPaginator;

    @Input() set userToken(token:string){
        this.token = token;
        this.loadData();
    }

    constructor(protected service:BackendService, protected userManagementService:UserManagementService, private userProfileService:UserProfileService,
        private servicesProviderService:AngularServicesProviderService){
        super();
        if(this.userManagementService !== null){
            const token = this.userManagementService.getToken();
            if(token !== null){
                this.token = token;
                this.loadData();
            }
        }
    }

    ngAfterViewInit(): void {
      this.dataSource.paginator = this.paginator;
    }

    setParent(parent: DynamicContentParent | undefined){

    }

    public loadData(){
        this.ready = false;
        this.users = [];
        let inst = this;
        this.service.isInitialized().subscribe(backendInitialized=>{
            this.userProfileService.getUsers().subscribe( (results:Response<any>)=>{
                let responseData = results.data;
                for(let i = 0;i<responseData.responseData.length;i++){
                    let u = new User(responseData.responseData[i]);
                    this.users.push(u);
                }
                this.dataSource.data = this.users.slice(0,this.defaultResultLength);
                this.ready = true;
            },(error:ErrorResponse)=>{
                inst.servicesProviderService.createNewModal().alert(false, error.error.message);
            });
        });
    }

    onPaginateChange(e: PageEvent): void {
      if (this.paginator) {
        this.dataSource.data = this.users.slice(this.paginator.pageIndex * this.paginator.pageSize, (this.paginator.pageIndex + 1) * this.paginator.pageSize);
      }
    }

    onSortChange(e: Sort): void {

      // Direction ascending
      if (e.direction === "asc") {
        // If sort by user, use firstname and lastname fields
        if (e.active === 'user') {
          this.users.sort((a: any, b: any) => a.firstName.toLowerCase() + a.lastName.toLowerCase() < b.firstName.toLowerCase() + b.lastName.toLowerCase() ? -1 : 1);
        }
        // Else, use selected field (e.active)
        else {
          this.users.sort((a: any, b: any) => a[e.active] < b[e.active] ? -1 : 1);
        }
      }

      // Direction descending
      else if (e.direction === 'desc') {
        // Same for desc
        if (e.active === 'user') {
          this.users.sort((a: any, b: any) => a.firstName.toLowerCase() + a.lastName.toLowerCase() >= b.firstName.toLowerCase() + b.lastName.toLowerCase() ? -1 : 1);
        }
        // Same for desc
        else {
          this.users.sort((a: any, b: any) => a[e.active] >= b[e.active] ? -1 : 1);
        }
      }

      // Direction none
      else {
        return;
      }

      this.dataSource.data = this.users.slice(this.paginator.pageIndex * this.paginator.pageSize, (this.paginator.pageIndex + 1) * this.paginator.pageSize);
      this.paginator.firstPage();
    }

    userCanViewAllUsers(){
        return this.userManagementService === null ? false : this.userManagementService.userHasPermission("view_all_users");
    }

    userCanEditAllUsers(){
        return this.userManagementService === null ? false : this.userManagementService.userHasPermission("edit_all_users");
    }

    initialize(parent: DynamicModalContainer): void {
        //throw new Error("Method not implemented.");
    }
    getUserToken(): string | null {
        throw this.token;
    }

    getDynamicContent(){
        return this.selectedUserProfileContent;
    }
    getModalTitle(){
         return this.modalTitle;
    }

    initializeWithAuthData(userToken: string): void {
       // throw new Error("Method not implemented.");
       this.token = userToken;
       this.users = [];
    }

    getCancellableContent(){
        return this.cancellableOperationContent;
    }

    setDependencies(dependencies: DynamicItem[]): void {
       this.dependencies = dependencies;
       this.cancellableOperationContent = dependencies[0];
       this.selectedUserProfileContent = dependencies[1];
    }

    userIsBlocked(i:number){
        return !this.users[i].isActive;
    }
    userIsActive(i:number){
        return this.users[i].isActive;
    }

    activateUser(i:number){

        let inst = this;
        let acceptUserActivation = ()=>{
            if(inst.modal !== null){
              //  console.log(inst.modal)
                inst.modal.closeModal();
            }
            let isActive = inst.users[i].isActive;
            let params = {/*token:inst.token,*/ userId:inst.users[i].id, active: !isActive};

            inst.cancellableOperationModalIsOpen = false;
            inst.modalIsOpen = false;

            inst.userProfileService.requestUserActivation(params).subscribe((results:any)=>{
                //console.log(results);
                inst.servicesProviderService.createNewModal().alert(true, results.message);

                inst.users = [];
                inst.loadData();
          },(error:ErrorResponse)=>{
            inst.servicesProviderService.createNewModal().alert(false, error.error.message);
          });
        };

        let isActive = this.users[i].isActive;
        //construct data for dynamic view
        let objectData = {msg:isActive ? "Would you really like to block the user?" : "Would you really like to activate the user?",
                          title:isActive ? "Block User" : "Activate User" , onSubmit:acceptUserActivation,acceptButtonText: isActive ?"Block User" :"Activate User" };
        if(this.cancellableOperationContent !== undefined){
             this.cancellableOperationContent.setData(objectData);
             this.cancellableOperationModalIsOpen = true;
        }
    }

    viewUserInfo(i:number){
        this.modalTitle = "View User Information"
        let objectData = {token:this.token, userId:this.users[i].id, edit:false};

        if(this.selectedUserProfileContent !== undefined){
            //console.log(this.selectedUserProfileContent)
            this.selectedUserProfileContent.setData(objectData);
            this.modalIsOpen = true;
        }
    }

    editUserInfo(i:number){
        this.modalTitle = "Edit User Information"
        let objectData = {token:this.token, userId:this.users[i].id,edit:true};

        if(this.selectedUserProfileContent !== undefined){
            this.selectedUserProfileContent.setData(objectData);
            this.modalIsOpen = true;
        }
    }

    openModal(): void {
        throw new Error("Method not implemented.");
    }
    onModalClose(): Function {
        let parentRef = this;

        return (() => {
            parentRef.modalIsOpen = false;
            parentRef.cancellableOperationModalIsOpen = false;
            //  parentRef.cookiesModalIsOpen = false;
        });
    }
    setContent(content: DynamicItem): void {
        throw new Error("Method not implemented.");
    }
    setDynamicHTMLContentService(serv: DynamicHTMLContentService): void {
        throw new Error("Method not implemented.");
    }
    getDynamicHTMLContentService(): DynamicHTMLContentService {
        throw new Error("Method not implemented.");
    }
    notifyUser(success: boolean, message: string): void {
        throw new Error("Method not implemented.");
    }

}
