import { SelectionModel } from "@angular/cdk/collections";
import { Component, Inject, ViewChild } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { toUnicode } from "punycode";
import { LLStakeholder } from "src/app/Models/LLStakeholder";
import { PageResponse } from "src/app/Models/Response/response";
import { Stakeholder } from "src/app/Models/Stakeholder";
import { StakeholderRole } from "src/app/Models/StakeholderRole";
import { AngularServicesProviderService } from "src/app/Service/angular-services-provider.service";
import { StakeholderService } from "src/app/Service/stakeholder.service";
import { LivingLabEntityTableComponent, PaginationConfig, PaginationInfo, TableRepresentation } from "../../Admin/LivingLabEntityManagement/ll-entity-table.component";

export interface QueryResult {
    data: LLStakeholder[];
    paginationConfig: PaginationConfig;
}

@Component({
    selector: 'stakeholder-paginated-table',
    templateUrl: './stakeholder-paginated-table.component.html',
    /*    styleUrls:['../../style/tables.css'],*/
})

export class StakeholderPaginatedTableComponent extends LivingLabEntityTableComponent<Stakeholder> {

    ready = false;
    keyword:string = "";
    addSelectionParentCB = (x:any)=>{};
    initialData:LLStakeholder[] = [];
    stakeholderRoles:StakeholderRole[] = [];
    selectedStakeholders:{[key:string] : string|null} = {};
    initialSelectedStakeholders:{[key:string] : string|null} = {};
    
    @ViewChild(MatPaginator) paginator: MatPaginator | undefined;
    @ViewChild(MatSort) sort: MatSort | undefined;
    
    tableRepr: TableRepresentation<LLStakeholder> = {
        displayColumns: ['select', 'name', 'description', 'role'],
        displayData: {
            data: [],
            paginationConfig: {
                info: { pageIndex: 0, previousPageIndex: 0, length: 5, pageSize: 5,
                    sortField:"name",
                    direction:"asc" 
                },
                acceptedSizeOptions: [5, 10, 20],
           
            }
        }
    };

    disableClickEventPropagation(e:any){
        e.stopPropagation();

    }

    enableRoleDropDown(s:LLStakeholder){
        if(this.selectedStakeholders[s.id] === undefined){
          this.selectedStakeholders[s.id] = null;
        }
        else{
            delete this.selectedStakeholders[s.id];
        }
    }

    enableAllDropDowns(){
        this.masterToggle();

        let selected = this.selection.selected.length;
        if(selected === 0){
             this.selectedStakeholders = {};
        }
        else{
            for(let i = 0;i<this.selection.selected.length;i++){
                this.selectedStakeholders[this.selection.selected[i].id] = null;
            }

        }

    }

    constructor(private service: StakeholderService, @Inject(MAT_DIALOG_DATA) public data: any, private angularService:AngularServicesProviderService) {
        super();
        this.addSelectionParentCB = this.data.parentCB;
        this.data.parentCB = ()=>{};
        this.stakeholderRoles = this.data.roles;
        this.initialData = this.data.initialData;
        this.onDataChange = this.updateData;
        this.onSortChange = this.sortChange;

        this.loadData();
    }

    onUpdate() : boolean{
        if(this.initialData.length === 0 && this.selection.selected.length > 0) return true;
        let selectedIds:number[] = [];
        for(let i = 0;i<this.selection.selected.length;i++){
            selectedIds.push( parseInt(  this.selection.selected[i].id) );
        }

        let initialIds:number[] = [];
        for(let i = 0;i<this.initialData.length;i++){
            initialIds.push(parseInt( this.initialData[i].id) );
        }

        if(selectedIds.length !== initialIds.length) return true;

        for(let i = 0;i<selectedIds.length;i++){
            if(initialIds.indexOf(selectedIds[i]) === -1){
                return true;
            }
        }

        return (JSON.stringify(this.initialSelectedStakeholders) !== JSON.stringify(this.selectedStakeholders));        
    }


    addStakeholders(){
        let roleAssignments = this.assignRolesToStakeholders();
        if(roleAssignments !== Object.keys(this.selectedStakeholders).length){
          this.angularService.createNewModal().alert(false,"All stakeholders need to be set in order to continue");
          return;
        }
        this.addSelectionParentCB(this.selection.selected);
    }
    
    assignRolesToStakeholders():number{
        let keys = Object.keys(this.selectedStakeholders);
        let roleAssignments = 0;
        for(let i = 0;i<keys.length;i++){
            let id = keys[i];
            let roleId = this.selectedStakeholders[id];
            if(roleId === null) continue;
            for(let j = 0;j<this.stakeholderRoles.length;j++){
/*                console.log("---------------->")
                console.log(roleId);
                console.log(this.stakeholderRoles[j].id);
                console.log( parseInt ( roleId.toString() ) === parseInt ( this.stakeholderRoles[j].id.toString()) );
                console.log("<---------------->")*/
                
                if( parseInt ( roleId.toString() ) === parseInt ( this.stakeholderRoles[j].id.toString())){
                    for(let k = 0;k<this.selection.selected.length;k++){
                        if(this.selection.selected[k].id === id){
                            this.selection.selected[k].role = this.stakeholderRoles[j];
                            //console.log(this.selection.selected[k].role)
                            roleAssignments ++;
                            break;
                        }
                    }
                }
            }
        }
        //console.log("Role Assignments "+roleAssignments)
        return roleAssignments;
    }

    clearValue(){
         this.keyword = "";
         this.ready = false;
         this.loadData();
    }

    search(){
          this.ready = false;
          this.loadData();
    }

    getInitialSelection(selected:LLStakeholder[], allStakeholders:LLStakeholder[]):LLStakeholder[]{
         if(selected.length === 0) return [];
         let found:LLStakeholder[] = [];
         for(let i = 0;i<selected.length;i++){
            let s = selected[i];
            for(let j = 0;j<allStakeholders.length;j++){
                if(s.id === allStakeholders[j].id){
                    let o = allStakeholders[j];

                    if(this.selectedStakeholders[s.id] === undefined){
                        if(s && s.role){
                            this.selectedStakeholders[ parseInt ( s.id.toString() )] = s.role.id.toString();                            
                        }
                    }
                    o.role = s.role;
                    found.push(o);
                    break;
                }
            }
         }

         this.initialSelectedStakeholders = {...this.selectedStakeholders};
         return found;
    }

    getStakeholderRole(stakeholder:LLStakeholder):string{
        if(stakeholder.role === null){
            return "Not set";
        }
        return stakeholder.role.name;
    }


    loadData() {        

        if(this.selection !== null && this.selection.selected.length > 0){
            this.selectedStakeholders = {};
            this.masterToggle();
       }
       
                let inst = this;
                inst.ready = false;
                this.service.getModeratedStakeholders(inst.keyword === "" ? null : inst.keyword,
                inst.tableRepr.displayData.paginationConfig.info.sortField,
                inst.tableRepr.displayData.paginationConfig.info.direction,
                inst.tableRepr.displayData.paginationConfig.info.pageIndex,
                inst.tableRepr.displayData.paginationConfig.info.pageSize).subscribe((response: PageResponse<Stakeholder>)=>{
/*                    for(let i = 0;i<response.data.length;i++){
                     response.data[i].iconUrl = 'undefined';
                    }*/
                       inst.data =  response;
                       //console.log(response);

                       inst.tableRepr.displayData.data = []
                       for(let i = 0;i<response.data.length;i++){
                        let stakeholder:Stakeholder = response.data[i];

                        inst.tableRepr.displayData.data.push({  
                            id: stakeholder.id,
                            name: stakeholder.name,
                            description: stakeholder.description,
                            moderated: true,
                            lastAddedAt: stakeholder.lastAddedAt,
                            iconUrl: stakeholder.iconUrl,
                            role : null
                        } as LLStakeholder);

                       }
                       //console.log(inst.initialData)
                       inst.dataSource = new MatTableDataSource<LLStakeholder>(inst.tableRepr.displayData.data);
/*                       console.log("--------------------->");
                       console.log(inst.tableRepr.displayData.data);
                       console.log(inst.initialData);
                       console.log("--------------------->");*/
                       
                       inst.selection = new SelectionModel<LLStakeholder>(true, inst.getInitialSelection(inst.initialData, inst.tableRepr.displayData.data) );

                       //console.log(inst.selection.selected)
                       inst.displayedColumns = inst.tableRepr.displayColumns;
               
                       inst.tableRepr.displayData.paginationConfig.info.length = response.totalCount;
                       inst.resultsLength = inst.tableRepr.displayData.paginationConfig.info.length;
                       inst.paginationConfig = inst.tableRepr.displayData.paginationConfig;
                       inst.pageSize = inst.tableRepr.displayData.paginationConfig.info.pageSize
                       inst.pageIndex = inst.tableRepr.displayData.paginationConfig.info.pageIndex;
                       


                       //console.log(inst)
                       inst.data = inst.tableRepr;
                       inst.parentCB = () =>{};
                      
                       inst.ready = true;

            });
            
    }

    sortChange(sortField:string, direction:string){
        let inst = this;
        inst.tableRepr.displayData.paginationConfig.info.sortField = sortField;
        inst.tableRepr.displayData.paginationConfig.info.direction = inst.tableRepr.displayData.paginationConfig.info.direction === "asc" ? "desc" : "asc";
        inst.ready =false;
        inst.loadData();

    }

    updateData(p:PaginationInfo){
         this.tableRepr.displayData.paginationConfig.info = p;

         this.ready = false;
         this.loadData();
    }
}

