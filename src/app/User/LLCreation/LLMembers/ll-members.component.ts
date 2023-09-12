import {Component, EventEmitter, Inject, Input, OnInit} from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { title } from "process";
import { DynamicModalComponent } from "src/app/ComponentLibrary/DynamicModal/dynamic-modal.component";
import { LLUser } from "src/app/Models/LLUser";
import { UserLivingLab } from "src/app/Models/UserLivingLab";
import { AngularServicesProviderService } from "src/app/Service/angular-services-provider.service";
import { LLUserMembershipService } from "src/app/Service/ll-user-membership.service";
import { Response } from 'src/app/Models/Response/response';
import { LLUserRole } from "src/app/Models/LLUserRole";
import { SuggestedUser } from "src/app/Models/SuggestedUser";
import { MatTableDataSource } from "@angular/material/table";
import { FormControl } from "@angular/forms";
import { UserManagementService } from "../../user-management.service";
import { ErrorResponse } from "src/app/Models/Response/error-response";
import { DynamicModalDialogComponent, ModalButton, ModalConfig } from "src/app/ComponentLibrary/DynamicModalDialog/dynamic-modal-dialog.component";
import { DirtyView } from "src/app/Models/DirtyView";
import {LlUsersManagementComponent} from "../LLUsersManagement/ll-users-management.component";

interface LLMemberShipInput {
    ll: UserLivingLab;
    dyn: DynamicModalComponent;
};

interface LLUserRoleSwitch{
    newRoleId:number;
};
interface LLMemberShipChangeLogger{
    memberInsertions:{ [userId: number] : LLUser } ,
    memberDeletions:{ [userId: number] : LLUser },
    memberRoleSwitches:{ [userId: number] : LLUserRoleSwitch };
};

@Component({
    selector: 'll-members',
    templateUrl: './ll-members.component.html',
    styleUrls: ['../LLUsersManagement/ll-users-management.component.css', './ll-members.css'],
})
export class LLMembersComponent implements DirtyView, OnInit {
    title = "Living Lab Members"
    ready = false;
    users: LLUser[] = [];
    displayedColumns: string[] = ['name', 'role', 'action'];
    dataSource: any;
    allLLUserRoles: LLUserRole[] = [];
    defaultRole: LLUserRole = {} as LLUserRole;
    userToBeAdded = "";
    potentialNewLLMemberYieldResults = false;
    fetchedUsers: SuggestedUser[] = [];
    suggestedUserToBeAdded: SuggestedUser | null = null;
    roleForSuggestedUser: LLUserRole | null = null;

    ctrl:FormControl[] = [];
    errorMessage = "";
    llMinimalRequiredRoles:LLUserRole[] = [];

    //member insertion, member deletion, current member role switch
    changes: LLMemberShipChangeLogger = {memberInsertions:{}, memberDeletions:{}, memberRoleSwitches:{} };
    initialRoles : { [userId : number] : number } = {};

    // @ts-ignore
    @Input() handle: LLMemberShipInput;
    // @ts-ignore
    @Input() dialogRef: MatDialogRef<LlUsersManagementComponent>;

    /*@Input() handle: any;
    @Input() dialogRef: any;*/

    constructor(protected service: LLUserMembershipService,
                protected servicesProviderService: AngularServicesProviderService,
                private userManagementService:UserManagementService) {
    }

    ngOnInit() {
      this.initialize();
      this.dialogRef.disableClose = true;
    }

    reset(): boolean {
        return false;
    }

    save(): boolean {
        return true;
    }

    isDirty():boolean {
       return Object.keys(this.changes.memberDeletions).length !== 0 ||
       Object.keys(this.changes.memberInsertions).length !== 0 ||
       Object.keys(this.changes.memberRoleSwitches).length !== 0
    }

    initialize() {
        this.getLLUsers();
    }


    getLLMinimalRequiredRoles(){
        let inst = this;
        this.service.getLLMinimalRequiredRoles(this.handle.ll.id).subscribe((data:Response<LLUserRole[]>)=>{
            inst.llMinimalRequiredRoles = data.data;
            //console.log(inst.llMinimalRequiredRoles)
            inst.ready = true;
        });
    }

    getUserLabel(u: SuggestedUser) {
        return u.firstName + " " + u.lastName;
    }

    suggestedUserSelected(u: SuggestedUser) {
        this.potentialNewLLMemberYieldResults = true;
        this.suggestedUserToBeAdded = u;
    }

    checkRoleSwitchValidity(e:any,role:LLUserRole){
          console.log(e);
          console.log(role);
    }

    getLLUsers() {
        let inst = this;
        this.service.getLLUserMembers(this.handle.ll.id).subscribe((data: Response<LLUser[]>) => {
            inst.users = data.data;
            //console.log(inst.users[0])
            let userInfo = inst.users[0];//inst.userManagementService.getUserInfo();
            inst.users.unshift({ id: userInfo.id, firstName: userInfo.firstName, lastName: userInfo.lastName, roleId: 0, role: "owner"} as LLUser);
            //inst.users.unshift({ id: -1, firstName: "", lastName: "", roleId: 0, role: ""} as LLUser);

            inst.dataSource = inst.users;
            inst.initializeRoleFormControls();
            inst.initializeRoles();
            inst.getLLUserRoles();
        });
    }

    initializeRoles(){
        for(let i = 0;i<this.users.length;i++){
              this.initialRoles[this.users[i].id] =  this.users[i].roleId;
        }
    }

    initializeRoleFormControls(){
        this.ctrl = [];
        for(let i = 0;i<this.users.length;i++){
            let f = new FormControl(null);
            this.ctrl.push(f);
            f.setValue(this.users[i].role);
        }
    }

    getLLUserRoles() {
        let inst = this;
        this.service.getLLUserRoles().subscribe((data: Response<LLUserRole[]>) => {
            inst.allLLUserRoles = data.data;
            /*console.log(inst.users);
            console.log(inst.allLLUserRoles);*/
            inst.getLLDefaultRole();
        })
    }

    findRole(id:number):LLUserRole|null{
         for(let i = 0;i<this.allLLUserRoles.length;i++){
            if(this.allLLUserRoles[i].id === id) return this.allLLUserRoles[i];
         }
         return null;
    }

    getLLDefaultRole() {
        let inst = this;
        this.service.getLLDefaultRole(this.handle.ll.id).subscribe((data: Response<LLUserRole>) => {
            inst.defaultRole = data.data;
            inst.getLLMinimalRequiredRoles();
        })
    }

    addCurrentUser() {
        if (this.suggestedUserToBeAdded) {
            this.ready = false;
            let newUser: LLUser = {
                firstName: this.suggestedUserToBeAdded.firstName,
                lastName: this.suggestedUserToBeAdded.lastName,
                id: this.suggestedUserToBeAdded.id,
                role: this.roleForSuggestedUser !== null ? this.roleForSuggestedUser.role : this.defaultRole.role,
                roleId: this.roleForSuggestedUser !== null ?  this.roleForSuggestedUser.id  : this.defaultRole.id
            };
            this.users.push(newUser);
            this.dataSource = this.users;
            this.dataSource = new MatTableDataSource(this.users);
            this.clearNewLLUsersName();
            this.initializeRoleFormControls();

            this.roleForSuggestedUser = {
                id:this.defaultRole.id,
                role:this.defaultRole.role,
                description:this.defaultRole.description   } as LLUserRole;

            this.changes.memberInsertions[newUser.id] = newUser;

            this.ready = true;
        }
    }

    setUserRoleForNewUser(roleId:number){
//         this.suggestedUserSelected.role:
        let role = this.findRole(roleId);
        if(role === null){
            return;
        }
        this.roleForSuggestedUser = {
            id:role.id,
            role:role.role,
            description:role.description   } as LLUserRole;

    }

    setUserRole(u:LLUser,newRoleId:number){
        for(let i = 0;i<this.users.length;i++){
            if(u.id === this.users[i].id){
                this.users[i].roleId = newRoleId;
                break;
            }
        }
    }

    checkRoleValidity(u:LLUser,newRoleId:number){

        this.setUserRole(u, newRoleId);

        let initialRole = this.initialRoles[u.id];
        if(initialRole === newRoleId){
            //lets remove it from the changes on roles
            delete this.changes.memberRoleSwitches[u.id];
        }
        else{
            this.changes.memberRoleSwitches[u.id] = {
                newRoleId:newRoleId
            };
        }

/*        if(!this.isRoleSwitchCorrect()){
            this.errorMessage = "A Living Lab needs to have at least one Living Lab Owner or Living Lab Administrator."
        }
        else{
            this.errorMessage = "";
        }*/
    }

    isRoleSwitchCorrect(){
       let sumMinimalRequiredRoles = 0;
       for(let i = 0;i<this.users.length;i++){
        if(this.userRoleInMinimalRequiredRoles(this.users[i])){
            sumMinimalRequiredRoles++;
        }
       }
      // console.log("sum minimal required roles = " + sumMinimalRequiredRoles );
        return sumMinimalRequiredRoles !== 0;
    }


    isLLOwner(){
       return ( this.handle.ll.creatorId === this.userManagementService.getUserInfo().id);
    }

    isUserLLOwner(userId:number){
        return ( this.handle.ll.creatorId === userId);
    }

    userRoleInMinimalRequiredRoles(u:LLUser):boolean{
       for(let i = 0;i<this.llMinimalRequiredRoles.length;i++){
         if(u.roleId === this.llMinimalRequiredRoles[i].id){
            return true;
         }
       }
       return false;
    }


    removeUser(userId:number){
        this.ready = false;
        //we need also to check if removal is allowed
        if(this.changes.memberInsertions[userId] !== undefined){
            //a new user that was just added, we want to remove him
            delete this.changes.memberInsertions[userId];
            //we need to update the table as well
            this.removeUserFromLLMemberList(userId);
        }
        else{
            let deletedUser = this.findUserWithId(userId);
            if(deletedUser){
                //then he was a known LL user
                this.changes.memberDeletions[userId] = deletedUser;
            }
        }

        this.ready = true;
    }

    undoDeletion(userId:number){
        delete this.changes.memberDeletions[userId];
    }

    userInDeletions(userId:number){
        return this.changes.memberDeletions[userId] !== undefined;
    }

    findUserWithId(userId:number):LLUser|null{
        for(let i = 0;i<this.users.length;i++){
            if(userId === this.users[i].id){
                return this.users[i];
            }
        }
        return null;
    }

    removeUserFromLLMemberList(userId:number){
        for(let i = 0;i<this.users.length;i++){
            if(userId === this.users[i].id){
                this.users.splice(i, 1);
                break;
            }
        }
        this.dataSource = this.users;
        this.dataSource = new MatTableDataSource(this.users);
    }

    canSaveChanges(){
        return this.errorMessage === "" && this.isDirty();
    }

    getRole(e: any) {
        //console.log(e)
        return e.role;
    }

    saveChanges(){
        let inst = this;
        if(!this.canSaveChanges())return;
        this.service.saveLLMembership(this.handle.ll.id, this.changes).subscribe((data:Response<boolean>)=>{
            inst.servicesProviderService.createNewModal().alert(true, "The Living Lab has been updated successfully!");
            inst.dialogRef.close();
        }), (error:ErrorResponse)=>{
                    inst.servicesProviderService.createNewModal().alert(false, error.error.message);
                } ;
    }

    getTitle() {
        return this.title;
    }

    clearNewLLUsersName() {
        this.userToBeAdded = "";
        this.suggestedUserToBeAdded = null;
        this.potentialNewLLMemberYieldResults = false;
    }

    fillNewLLUsersName(e: any) {
        let inst = this;
        if (this.userToBeAdded.length >= 3) {
            this.service.getLLPotentialMembers(this.userToBeAdded, this.handle.ll.id).subscribe((data: Response<SuggestedUser[]>) => {
//console.log(data.data);
                inst.fetchedUsers = inst.filterOutCurrentlyAddedSuggestedUsers(data.data);
                /*            console.log(inst.fetchedUsers)*/
/*                console.log( inst.fetchedUsers );
*/
            })
        }
    }

    filterOutCurrentlyAddedSuggestedUsers(fetched: SuggestedUser[]) {
        let filtered: SuggestedUser[] = [];
        for (let i = 0; i < fetched.length; i++) {
            let found = false;
            for (let j = 0; j < this.users.length; j++) {
                if (fetched[i].id === this.users[j].id) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                filtered.push(fetched[i]);
            }
        }
        return filtered;
    }

}
