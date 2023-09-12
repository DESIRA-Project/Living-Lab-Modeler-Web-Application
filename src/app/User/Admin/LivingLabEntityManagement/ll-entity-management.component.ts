import { Component, Input } from "@angular/core";
import { BackendService } from "src/app/backend.service";
import { DynamicContentParent } from "src/app/ComponentLibrary/DynamicModal/dynamic-content-parent";
import { DynamicContent } from "src/app/ComponentLibrary/DynamicModal/dynamic-content.component";
import { DynamicHTMLContentService } from "src/app/ComponentLibrary/DynamicModal/dynamic-html-content.service";
import { DynamicItem } from "src/app/ComponentLibrary/DynamicModal/dynamic-item.components";
import { DynamicModalContainer } from "src/app/ComponentLibrary/DynamicModal/dynamic-modal-container";
import { ModalController } from "src/app/ComponentLibrary/DynamicModal/modal-controller";
import { DynamicModalDialogComponent, ModalButton, ModalConfig } from "src/app/ComponentLibrary/DynamicModalDialog/dynamic-modal-dialog.component";
import { DirtyView } from "src/app/Models/DirtyView";
import { ObjectOfInterest } from "src/app/Models/ObjectOfInterest";
import { ErrorResponse } from "src/app/Models/Response/error-response";
import { MessageResponse, Response } from "src/app/Models/Response/response";
import { SCPInputData } from "src/app/Models/SCPInputData";
import { AngularServicesProviderService } from "src/app/Service/angular-services-provider.service";
import { EntityQueryParameters, SCPEntitiesService } from "src/app/Service/SCPentities.service";
import { SCPGroupsService } from "src/app/Service/SCPgroups.service";
import { AlertSupportingComponent } from "../../alert-supporting-component";
import { DataContainer } from "../../ll-update/data-container";
import { UserManagementService } from "../../user-management.service";
import { ChildComponent } from "./child-component";
import { FilteredSearchParameters } from "./ll-entity-search.component";
import { PaginationConfig, PaginationInfo, QueryResult, TableRepresentation } from "./ll-entity-table.component";
import { PaginatedResponse } from "./paginated-scp-entity-response";
import { ParentComponent } from "./parent-component";
import { SCPEntity, SCPGroup } from "./scp-entity";
import { SCPEntityAction, SCPEntityBulkAction } from "./scp-entity-action";
import { SCPEntityEditComponent } from "./scp-entity-edit.component";
import { SearchableComponent } from "./searchable-component";

@Component({
    selector: 'll-entity-management',
    templateUrl: './ll-entity-management.component.html',
        styleUrls:['./ll-entity-management.component.css'],
})
export class LivingLabEntityManagementComponent extends AlertSupportingComponent implements /* ModalController,*/  DynamicContent, SearchableComponent, ParentComponent {
    data: any;
    protected token: string = "";
    title = "Living Lab Entity Management";
    renderInCard = true;
    value = "";
    searchFieldOptions = ["All Fields", "Entity Name", "Entity Description"];
    contentSearchOptions = ["All Content", "Verified", "Not Verified"];
    groupOptions: SCPGroup[] = [];
    // [{value: "All",color:"green"},{value:"Socio",color:"red"},{value:"Cyber",color:"blue"},{value:"Physical",color:"orange"}];
    groupColors = ["orange", "var(--blue-450)", "var(--green-300)", "var(--red-500)"];
    actions: SCPEntityAction[] = [];
    bulkActions: SCPEntityBulkAction[]  = [];
    bulkOperationsComponent: ChildComponent | null = null;
    ready = false;
    selectedIds: number[] = [];
    selectedGroupIds: number[] = [];
    selectedKeyword: string = "";
    verificationSelection: boolean | undefined = undefined;
    selectedSearchField: string | undefined = "";
    debugMode: boolean = false;

    @Input()
    set debug(isDebugMode: boolean) {
        this.debugMode = isDebugMode;
    }

    latestQueryResult: TableRepresentation<SCPEntity> = {
        displayColumns: ['select', 'name', 'description'/*,'group'*/, 'used in LLs', 'Scope', 'actions'],
        displayData: {
            data: [],
            paginationConfig: {
                info: { pageIndex: 0, previousPageIndex: 0, length: 5, pageSize: 5,
                    sortField:"name",
                    direction:"asc" },
                acceptedSizeOptions: [5, 10, 25],

            }
        }
    };

    constructor(protected service: BackendService, protected userManagementService: UserManagementService, private scpGroupsService: SCPGroupsService,
        private scpEntitiesService: SCPEntitiesService, private servicesProviderService: AngularServicesProviderService) {
        super();
        if (this.userManagementService !== null) {
            const token = this.userManagementService.getToken();
            if (token !== null) {
                this.token = token;
                this.constructActions();
                this.loadData(null);
            }
        }
    }

    setObjectOfInterest(o: ObjectOfInterest): void {
      
    }

    getSharedDataContainer():DataContainer{
        return {} as DataContainer;
    }
    
    clearValue(key: string): void {
       
    }
    isDirty(): boolean {
        return false;
    }
    setChangeAwareChild(v: DirtyView): void {
    }
    getSharedData() {
        return this.data;
    }
    storeValue(key: string, value: any): void {
        if(this.data === undefined){
            this.data = {};
        }
       this.data[key] = value;
    }
    setParent(parent: DynamicContentParent | undefined){

    }

    loadData(onFinish:Function|null): void {
        let inst = this;
        let params: EntityQueryParameters = {
            token: inst.getUserToken(),
            /*groupIds: inst.selectedGroupIds,*/
            keyword: inst.selectedKeyword,
            size: inst.latestQueryResult.displayData.paginationConfig.info.pageSize,
            pageIndex: inst.latestQueryResult.displayData.paginationConfig.info.pageIndex,
            verified: inst.verificationSelection,
            sortField:inst.latestQueryResult.displayData.paginationConfig.info.sortField,
            direction:inst.latestQueryResult.displayData.paginationConfig.info.direction
        };

       // console.log(params)
        if (inst.debugMode) {
            console.log(params);
        }

        inst.scpEntitiesService.getPaginatedSCPEntitiesWithCriteria(params).subscribe(
            (data: PaginatedResponse) => {
                inst.data = data.data;
                inst.latestQueryResult.displayData.data = data.data;
                inst.latestQueryResult.displayData.paginationConfig.info.length = data.totalCount;
                inst.loadGroups(onFinish);
            },
            (error:ErrorResponse)=>{
                inst.servicesProviderService.createNewModal().alert(false, error.error.message);
                inst.ready = true;
            }
            );
    }

    onSortChange(){
        let inst = this;
        return (sortField:string, direction:string) =>{
            inst.ready =false;
            inst.latestQueryResult.displayData.paginationConfig.info.direction = direction;
            inst.latestQueryResult.displayData.paginationConfig.info.sortField = sortField;
            inst.loadData(()=>{
                inst.latestQueryResult.displayData.paginationConfig.info.direction = inst.latestQueryResult.displayData.paginationConfig.info.direction === "asc" ? "desc" : "asc";
                inst.ready = true;
            });
        }
    }

    onPaginationChange() {
        let inst = this;
        return (pagination: PaginationInfo) => {
            inst.ready = false;

            inst.latestQueryResult.displayData.paginationConfig.info = pagination;
            inst.loadData(null);
        }
    }


    loadGroups(onFinish:Function|null) {
        let inst = this;
        this.scpGroupsService.getSCPGroups().subscribe( (data: any) => {
            let groups = data.data;

            this.groupOptions = [{ value: "All", color: this.groupColors[0], id: 0 }];

            for (let i = 0; i < groups.length; i++) {
                this.groupOptions.push({ value: groups[i]['name'], color: this.groupColors[i + 1], id: groups[i]['id'] } as SCPGroup);
            }
            if(onFinish){
                onFinish();
            }
            else{
                this.ready = true;
            }
        },(error:ErrorResponse)=>{
            inst.servicesProviderService.createNewModal().alert(false, error.error.message);
            inst.ready = true;
        });
    }


    performFilteredSearch() {
        let inst = this;
        return (data: FilteredSearchParameters) => {
            inst.ready = false;
            let params: EntityQueryParameters = {
                token: inst.getUserToken(),
                /*groupIds: data.groupIds,*/
                keyword: data.keyword,
                size: inst.latestQueryResult.displayData.paginationConfig.info.pageSize,
                pageIndex: inst.latestQueryResult.displayData.paginationConfig.info.pageIndex,
                verified: data.needsVerification,
                searchField: data.field,
                direction:data.direction,
                sortField:data.sortField
            };

            inst.verificationSelection = data.needsVerification;
            inst.selectedGroupIds = data.groupIds;
            inst.selectedKeyword = data.keyword;
            inst.selectedSearchField = data.field;

            if (this.debugMode) {
                console.log(params);
            }

            inst.scpEntitiesService.getPaginatedSCPEntitiesWithCriteria(params).subscribe(
                (data: PaginatedResponse) => {

                    inst.data = data.data;
                    inst.latestQueryResult.displayData.data = data.data;
                    inst.latestQueryResult.displayData.paginationConfig.info.length = data.totalCount;
                    inst.latestQueryResult.displayData.paginationConfig.info.pageIndex = 0;
                    inst.ready = true;
                },(error:ErrorResponse)=>{
                    inst.servicesProviderService.createNewModal().alert(false, error.error.message);
                    inst.ready = true;
                });
        };
    }

    editEntity(e: SCPEntity) {
        let dyn: DynamicModalDialogComponent = this.servicesProviderService.createNewModalWithType(SCPEntityEditComponent);
        let inst = this;

        let onSuccess = () => {
            inst.ready = false;
            inst.loadData(null);
        };

        let getData = () => {
            return { entity: e, handle: dyn, groups: inst.groupOptions, onEditErrorCallback: () => { }, onEditSuccessCallback: onSuccess, showGroups:false } as SCPInputData
        };

        dyn.performConfirmableOperationCustom('editSCPLabelModal',getData, () => { }, () => {
            inst.ready = false;
            inst.loadData(null);
        })
    }

    public setComponent(bulkOperationsComponent: ChildComponent) {
        this.bulkOperationsComponent = bulkOperationsComponent;
    }

    public switchBulkOperationsComponentDisabilityState(isDisabled: boolean) {
        this.bulkOperationsComponent?.setDisability(isDisabled);
    }

    onEntitySelection() {
        let inst = this;
        return (ids: number[]) => {
            inst.switchBulkOperationsComponentDisabilityState(ids.length === 0);
            inst.selectedIds = ids;
        }
    }

    deleteEntity(e: SCPEntity) {
        let dyn: DynamicModalDialogComponent = this.servicesProviderService.createNewModal();
        let buttons: ModalButton[] = [{ color: 'red', label: 'DELETE' }, { color: 'grey', label: 'CANCEL' }];
        let config: ModalConfig = { text: 'Are you sure you want to delete this LL Entity?', buttons: buttons };
        let inst = this;

        let obs = (i: number) => {
            if (i === undefined) {
                return;
            }

            switch (i) {
                case 0:

                    this.scpEntitiesService.deleteBulk([e.id]).subscribe((data: MessageResponse) => {

                        inst.ready = false;
                        inst.loadData(null);

                        inst.servicesProviderService.createNewModal().alert(true, data.message);

                    },(error:ErrorResponse)=>{
                        inst.servicesProviderService.createNewModal().alert(false, error.error.message);
                    });

                    break;
                case 1:
                    break;
            }
        };

        dyn.performActionCustom('deleteSCPLabelModal', config, (currentDyn: DynamicModalDialogComponent) => {
            currentDyn.afterClosed(obs);
        });
    }

    switchEntityModeration(e: SCPEntity) {
        this.ready = false;
        let inst = this;
        this.scpEntitiesService.switchEntityModeration(e.id).subscribe( (response: Response<Boolean>) => {
            inst.servicesProviderService.createNewModal().alert(true, e.needsModeration ? "The entity is available in the global list of entities." : "The entity was removed from the global list of entities.");
            this.loadData(null);
        },(error:ErrorResponse)=>{
            inst.servicesProviderService.createNewModal().alert(false, error.error.message);
            inst.ready = true;
        });

    }

    constructActions() {
        let inst = this;
        this.actions.push({
          label: (e: SCPEntity): string => { return !e.needsModeration ? "radio_button_checked" : "radio_button_unchecked"; },
          tooltip: (e: SCPEntity): string => { return !e.needsModeration ? "Change scope to local" : "Change scope to global"; },
          actionCb: (e: SCPEntity) => {
            inst.switchEntityModeration(e);
          },
          color: (e: SCPEntity): string => { return !e.needsModeration ? "var(--green)" : "var(--red)"; },
          reprCondition:(e:SCPEntity):boolean =>{return true;}
        });
        this.actions.push({
            label: (e: SCPEntity): string => { return "Edit"; },
            tooltip: (): string => "Edit",
            actionCb: (e: SCPEntity) => {
                inst.editEntity(e);
            },
            color: () => "var(--blue)",
            reprCondition:(e:SCPEntity):boolean =>{return true;}
        });
        this.actions.push({
            label: (e: SCPEntity): string => { return "Delete"; },
            tooltip: () => "Delete",
            actionCb: (e: SCPEntity) => {
                inst.deleteEntity(e);
            },
            color: () => "var(--red)",
            reprCondition:(e:SCPEntity):boolean =>{
                return e.labCount === 0;
            }
        });

        this.bulkActions.push({
            label: (e: SCPEntity[]): string => { return "Delete Entities"; },
            actionCb: (e: SCPEntity[]) => {
                let canBeDeleted:number[] = [];
                for(let i = 0;i<inst.selectedIds.length;i++){
                    for(let j = 0;j<this.data.length;j++){
                        let id = this.data[j].id;
                        if(id === inst.selectedIds[i] && this.data[j].labCount === 0){
                            canBeDeleted.push(id);
                            break;
                        }
                    }
                }

                if(canBeDeleted.length === 0 && inst.selectedIds.length > 0){
                    //cannot delete them, their lab count is not 0
                    inst.servicesProviderService.createNewModal().alert(false, "Cannot delete the selected SCP Entities, they are referenced in some Living Labs.");
                    return;
                }

                inst.deleteEntities(canBeDeleted);
            },
            color: "var(--red)"
        });

        this.bulkActions.push({
            label: (e: SCPEntity[]): string => { return "Set Scope Public"; },
            actionCb: () => {
                inst.setEntityVerification(inst.selectedIds, true);
            },
            color: "var(--green)"
        });

        this.bulkActions.push({
            label: (e: SCPEntity[]): string => { return "Set Scope Private"; },
            actionCb: () => {
                inst.setEntityVerification(inst.selectedIds, false);
            },
            color: "var(--green)"
        });

    }

    createNewSCPEntity() {
        let dyn: DynamicModalDialogComponent = this.servicesProviderService.createNewModalWithType(SCPEntityEditComponent);
        let inst = this;

        let onSuccess = () => {
            inst.ready = false;
            inst.loadData(null);
        };

        let getData = () => {
            return { entity: null, handle: dyn, groups: inst.groupOptions, onEditErrorCallback: () => { }, onEditSuccessCallback: onSuccess, showGroups : false } as SCPInputData
        };

        dyn.performConfirmableOperationCustom('addNewSCPLabelModal',getData, () => { }, () => {
            inst.ready = false;
            inst.loadData(null);
        })
    }

    deleteEntities(ids: number[]) {
        let dyn: DynamicModalDialogComponent = this.servicesProviderService.createNewModal();
        let buttons: ModalButton[] = [{ color: 'red', label: 'DELETE' }, { color: 'grey', label: 'CANCEL' }];
        let msg = ids.length > 1 ? 'Are you sure you want to delete the selected ' + ids.length + ' LL Entities ?' : 'Are you sure you want to delete the selected LL Entity?'
        let config: ModalConfig = { text: msg, buttons: buttons };
        let inst = this;

        let obs = (i: number) => {
            if (i === undefined) {
                return;
            }

            switch (i) {
                case 0:

                    this.scpEntitiesService.deleteBulk(ids).subscribe( (data: MessageResponse) => {
                        inst.servicesProviderService.createNewModal().alert(true, data.message);
                        inst.ready = false;
                        inst.loadData(null);

                    },(error:ErrorResponse)=>{
                        inst.servicesProviderService.createNewModal().alert(false, error.error.message);
                    });

                    break;
                case 1:
                    break;
            }
        };

        dyn.performActionCustom('deleteSCPLabelModal',config, (currentDyn: DynamicModalDialogComponent) => {
            currentDyn.afterClosed(obs);
        });

    }

    setEntityVerification(ids: number[], result: boolean) {

        let dyn: DynamicModalDialogComponent = this.servicesProviderService.createNewModal();
        let buttons: ModalButton[] = [{ color: 'green', label: 'UPDATE' }, { color: 'grey', label: 'CANCEL' }];
        let msg = ids.length > 1 ? 'Are you sure you want to update the selected ' + ids.length + ' LL Entities ?' : 'Are you sure you want to update the selected LL Entity?'
        let config: ModalConfig = { text: msg, buttons: buttons };
        let inst = this;

        let obs = (i: number) => {
            if (i === undefined) {
                return;
            }

            switch (i) {
                case 0:

                    this.scpEntitiesService.switchBulkModeration(ids, result).subscribe( (data: MessageResponse) => {

                        inst.ready = false;
                        inst.loadData(null);

                        inst.servicesProviderService.createNewModal().alert(true, data.message);

                    }, (error:ErrorResponse)=>{
                        inst.servicesProviderService.createNewModal().alert(false, error.error.message);
                    });

                    break;
                case 1:
                    break;
            }
        };

        dyn.performAction(config, (currentDyn: DynamicModalDialogComponent) => {
            currentDyn.afterClosed(obs);
        });


    }


    setNotReady(): void {
        this.ready = false;
    }
    setReady(): void {
        this.ready = true;
    }
    setData(data: any): void {
        this.ready = false;
        this.data = data.data;
        this.ready = true;
    }

    getColor(groupName: string): string {
        for (let i = 0; i < this.groupOptions.length; i++) {
            if (groupName === this.groupOptions[i].value) {
                return this.groupOptions[i].color;
            }
        }
        return "red";
    }
    getLimitAwareString(s: string, limit: number): string {
        if (s === null) return "";
        if (s.length > limit) { return s.substring(0, limit - 3) + "..."; }
        return s;
    }

    initialize(parent: DynamicModalContainer): void {
        throw new Error("Method not implemented.");
    }
    getUserToken(): string | null {
        return this.token;
    }
    initializeWithAuthData(userToken: string): void {
        //   throw new Error("Method not implemented.");
    }
    setDependencies(dependencies: DynamicItem[]): void {
        //  throw new Error("Method not implemented.");
    }
}
