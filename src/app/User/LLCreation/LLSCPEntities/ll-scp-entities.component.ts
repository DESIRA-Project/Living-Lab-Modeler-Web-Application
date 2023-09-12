import { Component, OnDestroy } from "@angular/core";
import { DynamicView } from "src/app/ComponentLibrary/dynamic-view";
import { DynamicModalDialogComponent, ModalButton, ModalConfig } from "src/app/ComponentLibrary/DynamicModalDialog/dynamic-modal-dialog.component";
import { HierarchicalEdgeBundling } from "src/app/living-lab-view-page/tabs/living-lab-view-page-scp-system/HierarchicalEdgeBundling";
import { DirtyView } from "src/app/Models/DirtyView";
import { ObjectOfInterest } from "src/app/Models/ObjectOfInterest";
import { ErrorResponse } from "src/app/Models/Response/error-response";
import { SCPGraphController } from "src/app/Models/SCPGraphController";
import { SCPInputData } from "src/app/Models/SCPInputData";
import { AngularServicesProviderService } from "src/app/Service/angular-services-provider.service";
import { SCPGroupsService } from "src/app/Service/SCPgroups.service";
import { Deepcopy } from "src/app/Utils/deepcopy";
import { ParentComponent } from "../../Admin/LivingLabEntityManagement/parent-component";
import { LLSCPEntity, SCPGroup } from "../../Admin/LivingLabEntityManagement/scp-entity";
import { LLEditConnectionComponent } from "./ll-edit-connection.component";
import { LLNewSCPEntityConnectionComponent } from "./ll-new-connection.component";
//import { LLSCPEntityEditComponent } from "./ll-scp-entity-edit.component";
import { LLSCPEntityModalComponent } from "./ll-scp-entity-modal.component";
import { LLSCPGraphComponent } from "./ll-scp-graph.component";

export interface SCPConnection {
    source: LLSCPEntity | null;
    dest: LLSCPEntity | null;
    description: string;
}

export interface SCPGraphEntity {
    name: string;
    connections: string[];
}

@Component({
    selector: 'll-scp-entities',
    templateUrl: './ll-scp-entities.component.html',
    styleUrls:['../ll-creation.component.css', './ll-scp-entities.css'],
})
export class LLSCPEntitiesComponent implements DynamicView, OnDestroy, DirtyView, SCPGraphController,ObjectOfInterest {
    parent: ParentComponent | null = null;
    title = "Socio-Cyber-Physical System";
    ready: boolean = false;
    groupOptions: SCPGroup[] = [];
    groupColors = ["orange", "blue", "green", "red"];
    allGroups: SCPGroup[] = [];
    entities: { [key: number]: LLSCPEntity[] } = {};
    connections: SCPConnection[] = [];
    currentConnection: SCPConnection = { source: null, dest: null, description: '' } as SCPConnection;
    onNewConnectionMode: boolean = false;

    graph: LLSCPGraphComponent | null = null;
    delimeter: string = ".";

    readonly pillars: SCPGraphEntity[] = [{
        "name": "scp.Physical. ",
        "connections": [
        ]
    },
    {
        "name": "scp.Socio. ",
        "connections": [

        ]
    },
    {
        "name": "scp.Cyber. ",
        "connections": [
        ]
    }];

    readonly entityPrefix = "scp";

    constructor(protected servicesProviderService: AngularServicesProviderService, protected scpGroupsService: SCPGroupsService) {
        this.loadGroups(null);
    }
    notify(): void {
        if(!this.parent) return;
        let data = this.parent.getSharedData();
        if (data === undefined) return;
        this.ready = false;
        if (data["entities"] !== undefined) {
            this.entities = data["entities"];
        }
        if (data["connections"] !== undefined) {
            this.connections = data["connections"];
        }
        this.ready = true;
    }

    onScreenshotLoad(): void {
        this.parent?.storeValue("screenshotLoadAsync", false);
    }
    screenshotReady(): void {
        this.parent?.storeValue("screenshotLoadAsync", true);
    }

    save(): boolean {
        this.parent?.storeValue("entities", this.entities);
        this.parent?.storeValue("connections", this.connections);

/*        if (this.hasEntities()) {
            this.parent?.storeValue("entities", this.entities);
        }
        else{
            this.parent?.clearValue("entities");
        }
        if (this.connections.length > 0) {
            this.parent?.storeValue("connections", this.connections);
        }
        else{
            this.parent?.clearValue("connections");
        }*/
        return true;
    }

    reset(): boolean {
        this.groupOptions = [];
        this.allGroups = [];
        this.entities = {};
        this.connections = [];
        this.currentConnection = { source: null, dest: null } as SCPConnection;
        this.onNewConnectionMode = false;
        this.graph = null;
        return true;
    }


    isDirty(): boolean {
        /*        console.log(this.connections);
                console.log(this.hasEntities());*/
        return this.connections.length > 0 || this.hasEntities();
    }


    setSCPGraph(graph: LLSCPGraphComponent): void {
        this.graph = graph;

        if(this.containsInitialData()){
            this.redraw();
        }
    }

    containsInitialData(){
        if(!this.parent) return false;
        let data = this.parent.getSharedDataContainer();
        if (data === undefined) return;
/*        console.log(data.getEntities());
        console.log(data.getConnections());

        console.log( this.hasInitialValues(data.getEntities() ));*/
        return ( this.hasInitialValues(data.getEntities() ));
    }

    hasInitialValues(e:{ [id: string] : LLSCPEntity[]; }){
        if(Object.keys(e).length === 0) return false;
        let keys = Object.keys(e);
        for(let i = 0;i<keys.length;i++){
            if(e[keys[i]].length > 0) return true;
        }
        return false;
    }


    redraw() {

        if (this.graph) {
            this.graph.redraw(this.getEntityGraphFormat());
        }
    }

    entityInvolvedInConnections(e: LLSCPEntity) {
        console.log(this.connections);
        console.log(e);

        if (this.connections.length === 0) return false;
        for (let i = 0; i < this.connections.length; i++) {
            let c = this.connections[i];
            if (this.inConnection(c, e)) return true;
        }
        return false;
    }

    inConnection(c:SCPConnection, e:LLSCPEntity){
        return c && ( ( c.source && c.source.groupId === e.groupId && c.source.name === e.name ) || ( c.dest && c.dest.groupId === e.groupId && c.dest.name === e.name ));
    }

    inSrcConnection(c:SCPConnection, e:LLSCPEntity){
        return c && ( ( c.source && c.source.groupId === e.groupId && c.source.name === e.name ) );
    }

    inDestConnection(c:SCPConnection, e:LLSCPEntity){
        return c && (  ( c.dest && c.dest.groupId === e.groupId && c.dest.name === e.name ));
    }

    removeConnection(i: number) {
        if (i >= this.connections.length || i < 0) {
            this.servicesProviderService.createNewModal().alert(false, "Couldn't remove the SCP connection");
            return;
        }

        let dyn: DynamicModalDialogComponent = this.servicesProviderService.createNewModal();
        let buttons: ModalButton[] = [{ color: 'red', label: 'REMOVE' }, { color: 'grey', label: 'CANCEL' }];
        let config: ModalConfig = { text: 'Do you want to remove the current entity connection?', buttons: buttons };
        let inst = this;
        let obs = (option: number) => {
            if (option === undefined) {
                return;
            }

            switch (option) {
                case 0:
                    inst.ready = false;
                    inst.connections.splice(i, 1);
                    inst.redraw();
                    inst.save();
                    inst.servicesProviderService.createNewModal().alert(true, "The SCP connection was removed successfully.");
                    inst.ready = true;

                    break;
                case 1:
                    break;
            }
        };

        dyn.performAction(config, (currentDyn: DynamicModalDialogComponent) => {
            currentDyn.afterClosed(obs);
        });

    }

    removeEntity(index: number, groupId: number) {
        let e = this.entities[groupId][index];
        let hasConnections = this.entityInvolvedInConnections(e);
        let extraMessage = hasConnections ? " and its involved connections" : "";
        let dyn: DynamicModalDialogComponent = this.servicesProviderService.createNewModal();
        let buttons: ModalButton[] = [{ color: 'red', label: 'REMOVE' }, { color: 'grey', label: 'CANCEL' }];
        let config: ModalConfig = { text: 'Are you sure you want to remove the entity with name ' + e.name + "'" + extraMessage + "?", buttons: buttons };
        let inst = this;
        let obs = (i: number) => {
            if (i === undefined) {
                return;
            }

            switch (i) {
                case 0:
                    inst.ready = false;
//                    console.log(JSON.stringify(inst.entities[groupId]));
console.log(index + "  " + groupId )
                    inst.entities[groupId].splice(index, 1);
                    console.log(e);
                    console.log(index);

  //                  console.log(JSON.stringify(inst.entities[groupId]));
   //                 console.log(hasConnections);
                    if (hasConnections) {
                        let i = 0;
                        while (true) {
                            if (i === inst.connections.length) break;
                            let c = inst.connections[i];
                            if (this.inConnection(c,e) ) {
                                inst.connections.splice(i, 1);
                                i = 0;
                            } else {
                                i++;
                            }
                        }
                    }
                    console.log("END-------------->");

                    inst.save();
                    inst.redraw();
                    inst.servicesProviderService.createNewModal().alert(true, "The SCP entity was deleted successfully.");
                    inst.ready = true;

                    break;
                case 1:
                    break;
            }
        };

        dyn.performAction(config, (currentDyn: DynamicModalDialogComponent) => {
            currentDyn.afterClosed(obs);
        });
    }

    editEntity(i: number, groupId: number) {
        let e = this.entities[groupId][i];
        let inst = this;
        let dyn = this.servicesProviderService.createNewModalWithType(LLSCPEntityModalComponent);

        let onSuccess = () => {
            inst.ready = false;
            // inst.loadData(null);
        };

        let getData = () => {
            return { entity: null, llEntity: e, handle: dyn, groups: inst.groupOptions, currentlySelected: inst.entities, onEditErrorCallback: () => { }, onEditSuccessCallback: onSuccess, showGroups:true, initialPosition:{i:i,groupId:groupId} } as SCPInputData
        };
        dyn.getObservableFromConfirmableOperation(getData, () => { }).subscribe((entity: LLSCPEntity) => {
            if (entity) {
                console.log("updated entity")
                console.log(entity);
                if (inst.entities[entity.groupId] === undefined) {
                    inst.entities[entity.groupId] = [];
                }

                if(inst.diffOnDescriptionOnly(e,entity)){
                    inst.entities[entity.groupId][i].description = entity.description;
                    inst.entities[entity.groupId][i].usesGlobalDescription = entity.usesGlobalDescription;
                    inst.save();
                    inst.servicesProviderService.createNewModal().alert(true, "The SCP entity was updated successfully.");
                    return;
                }

                if (!inst.entityInvolvedInConnections(e)) {
                    //delete first and the put to the list
                    inst.entities[groupId].splice(i, 1);
                    inst.entities[entity.groupId].push(entity);
                }
                else {
                    inst.showConfirmableConnectionUpdateOnEntityEdit(i, groupId, e, entity);
                    return;
                }
/*                console.log(inst.entities)*/
                inst.save();
                inst.redraw();
                inst.servicesProviderService.createNewModal().alert(true, "The SCP entity was updated successfully.");
            }
            else {
            }
        });
    }

    diffOnDescriptionOnly(old:LLSCPEntity, newNode:LLSCPEntity):boolean{
         if(old.groupId === newNode.groupId && old.name === newNode.name  && ( old.usesGlobalDescription !== newNode.usesGlobalDescription || old.description.trim() !== newNode.description.trim() ) ){
/*console.log("diff change!")
            console.log(old);
            console.log(newNode);
    */
            return true;
        }
        return false;
    }

    checkSameGroupConnectionExists(newGroupId: number, oldNode: LLSCPEntity) {
        for (let i = 0; i < this.connections.length; i++) {
            let c = this.connections[i];
            if (c && c.source === oldNode) {
                if (c.dest?.groupId === newGroupId) return true;
            }

            if (c && c.dest === oldNode) {
                if (c.source?.groupId === newGroupId) return true;
            }
        }
        return false;

    }

    connectionSourceInSameGroup(dest: LLSCPEntity) {
        if (this.currentConnection === null) {
            return false;
        }
        if (this.currentConnection && this.currentConnection.source === null) {
            return false;
        }
        if (this.currentConnection && this.currentConnection.source) {
            if (dest.groupId === this.currentConnection.source.groupId) {
                return true;
            }
        }
        return false;
    }

    handleConnectionExistenceOnSameGroupAfterEdit(i: number, groupId: number, oldNode: LLSCPEntity, newNode: LLSCPEntity) {
        let dyn: DynamicModalDialogComponent = this.servicesProviderService.createNewModal();
        let buttons: ModalButton[] = [{ color: 'red', label: 'REMOVE CONNECTIONS' }, { color: 'grey', label: 'CANCEL' }];
        let config: ModalConfig = {
            text: "By changing the entity's group, there will be connections with other entities that fall under the same group," +
                "something that is not allowed in the SCP system. Would you like to update entity '" + newNode.name + "' and remove these connections?"
            , buttons: buttons
        };
        let inst = this;
        let obs = (i: number) => {
            if (i === undefined) {
                return;
            }

            switch (i) {
                case 0:

                    inst.entities[groupId].splice(i, 1);
                    inst.entities[newNode.groupId].push(newNode);

                    i = 0;
                    while (true) {
                        if (i === inst.connections.length) break;
                        let c = inst.connections[i];
                        if (c.source === oldNode && c.source && c.dest) {
                            if (c.dest.groupId === newNode.groupId) {
                                //delete
                                inst.connections.splice(i, 1);
                                i = 0;
                                continue;
                            }
                            else {
                                c.source = newNode;
                            }
                        }
                        if (c.dest === oldNode && c.dest && c.source) {
                            if (c.source.groupId === newNode.groupId) {
                                //delete
                                inst.connections.splice(i, 1);
                                i = 0;
                                continue;
                            }
                            else {
                                c.dest = newNode;
                            }
                        }
                        i++;
                    }
                    console.log(inst.connections);
                    inst.save();
                    inst.redraw();
                    inst.servicesProviderService.createNewModal().alert(true, "The SCP entity was updated along with its connections successfully.");
                    break;
                case 1:
                    break;
            }
        };

        dyn.performAction(config, (currentDyn: DynamicModalDialogComponent) => {
            currentDyn.afterClosed(obs);
        });

    }

    showConfirmableConnectionUpdateOnEntityEdit(index: number, groupId: number, oldNode: LLSCPEntity, newNode: LLSCPEntity) {
        let dyn: DynamicModalDialogComponent = this.servicesProviderService.createNewModal();
        let buttons: ModalButton[] = [{ color: 'red', label: 'UPDATE' }, { color: 'grey', label: 'CANCEL' }];
        let config: ModalConfig = { text: "The entity '" + oldNode.name + "' is involved in connections with other entities. Would you like to proceed in updating the entity information?", buttons: buttons };
        let inst = this;
        let obs = (option: number) => {
            if (option === undefined) {
                return;
            }

            switch (option) {
                case 0:

                    //nodes that belong to the same group cannot be connected!!!
/*                    if (oldNode.groupId !== newNode.groupId) {
                        if (inst.checkSameGroupConnectionExists(newNode.groupId, oldNode)) {
                            inst.handleConnectionExistenceOnSameGroupAfterEdit(i, groupId, oldNode, newNode);
                            return;
                        }
                    }*/

                    inst.entities[groupId].splice(index, 1);
                    inst.entities[newNode.groupId].push(newNode);

                    for (let i = 0; i < inst.connections.length; i++) {
                        let c = inst.connections[i];
                        if (c &&  this.inSrcConnection(c,oldNode)) {
                            c.source = newNode;
                        }

                        if (c && this.inDestConnection(c,oldNode)) {
                            c.dest = newNode;
                        }
                    }

                    console.log(inst.entities);
                    inst.save();
                    inst.redraw();
                    inst.servicesProviderService.createNewModal().alert(true, "The SCP entity was updated along with its connections successfully.");

                    break;
                case 1:
                    break;
            }
        };

        dyn.performAction(config, (currentDyn: DynamicModalDialogComponent) => {
            currentDyn.afterClosed(obs);
        });

    }


    getLimitedString(s: string, limit: number) {
        if (!s) return "";
        if (s.length < limit) return s;
        return s.substring(0, limit) + "...";

    }
    getConnectionName(name: string) {
        return this.getLimitedString(name, 30);
    }

    getConnectionMiniName(name: string) {
        return this.getLimitedString(name, 23);
    }

    loadGroups(onFinish: Function | null) {
        let inst = this;
        this.scpGroupsService.getSCPGroups().subscribe((data: any) => {
            let groups = data.data;
            this.groupOptions = [{ value: "All", color: this.groupColors[0], id: 0 }];

            for (let i = 0; i < groups.length; i++) {
                this.groupOptions.push({ value: groups[i]['name'], color: this.groupColors[i + 1], id: groups[i]['id'] } as SCPGroup);
                this.allGroups.push({ value: groups[i]['name'], color: this.groupColors[i + 1], id: groups[i]['id'] } as SCPGroup);
            }
            if (onFinish) {
                onFinish();
            }
            else {
                this.ready = true;
            }
        }, (error: ErrorResponse) => {
            inst.servicesProviderService.createNewModal().alert(false, error.error.message);
            inst.ready = true;
        });
    }

    hasEntities() {
        for (let i = 0; i < this.allGroups.length; i++) {
            if (this.entities[this.allGroups[i].id] === undefined) continue;
            if (this.entities[this.allGroups[i].id].length > 0) return true;
        }
        return false;
    }

    hasMoreThanOneEntity() {
        let sum = 0;
        for (let i = 0; i < this.allGroups.length; i++) {
            if (this.entities[this.allGroups[i].id] === undefined) continue;
            sum += this.entities[this.allGroups[i].id].length;
        }
        return sum > 1;
    }


    hasEntitiesFromOneGroup(){
        //let cnt : {[groupId:number] : number} = {};
        if(!this.hasEntities()){
            return true;
        }
        let lastSum = -1;
        for (let i = 0; i < this.allGroups.length; i++) {
            if (this.entities[this.allGroups[i].id] === undefined){
          //      cnt[this.allGroups[i].id] = 0;
                continue;
            }
           // cnt[this.allGroups[i].id] = this.entities[this.allGroups[i].id].length;
            if(lastSum === -1){
                if(this.entities[this.allGroups[i].id].length > 0){
                    lastSum = this.entities[this.allGroups[i].id].length;
                }
            }
            else{
                if(this.entities[this.allGroups[i].id].length !== 0){
                    return false;
                }
            }

        }
        return true;

    }

    newConnectionMode() {
        //this.onNewConnectionMode = true;

        let inst = this;
        let dyn = this.servicesProviderService.createNewModalWithType(LLNewSCPEntityConnectionComponent);
        let onSuccess = () => {
            inst.ready = false;
            // inst.loadData(null);
        };

        let getData = () => {
            return { entity: null, handle: dyn, groups: inst.groupOptions,
                currentConnections:inst.connections,
                currentlySelected: inst.entities, onEditErrorCallback: () => { }, onEditSuccessCallback: onSuccess, showGroups:true } as SCPInputData
        };

        dyn.getObservableFromConfirmableOperation(getData, () => { }).subscribe((con: SCPConnection) => {
            if (con) {
                inst.currentConnection = con;
                inst.saveCurrentConnection();
            }
            else {
            }
        });
    }

    editConnection(i:number) {
        //this.onNewConnectionMode = true;

        let inst = this;
        let dyn = this.servicesProviderService.createNewModalWithType(LLEditConnectionComponent);
        let onSuccess = () => {
            inst.ready = false;
            // inst.loadData(null);
        };

        let getData = () => {
            return { entity: null, handle: dyn, groups: inst.groupOptions,
                currentConnections:inst.connections,
                currentConnection:inst.connections[i],
                currentlySelected: inst.entities, onEditErrorCallback: () => { }, onEditSuccessCallback: onSuccess, showGroups:true } as SCPInputData
        };

        dyn.getObservableFromConfirmableOperation(getData, () => { }).subscribe((con: SCPConnection) => {
            if(con){
                inst.connections[i].description = con.description;
                inst.parent?.storeValue("connections", inst.connections);
                inst.servicesProviderService.createNewModal().alert(true, "The SCP connection was updated successfully.");
            }
        });
    }

    cancelConnectionMode() {
        this.onNewConnectionMode = false;
        this.currentConnection = { source: null, dest: null, description: "" };
    }

    connectionExists(c: SCPConnection) {
        for (let i = 0; i < this.connections.length; i++) {
            let saved = this.connections[i];
            if(saved.source === null || saved.dest === null) continue;
            if ( c.source && c.dest   &&
                ( c.source.name === saved.source.name && c.dest.name === saved.dest.name && c.source.groupId === saved.source.groupId && c.dest.groupId === saved.dest.groupId  ) ) {
                return true;
            }
        }
        return false;
    }

    invertedConnectionExists(c: SCPConnection) {
        return this.connectionExists({ source: c.dest, dest: c.source, description:c.description });
    }

    saveCurrentConnection() {
        //check first if the connection is unique
        if (this.connectionExists(this.currentConnection)) {
            this.servicesProviderService.createNewModal().alert(false, "The current SCP connection exists already.");
            return;
        }
        if (this.invertedConnectionExists(this.currentConnection)) {
            this.servicesProviderService.createNewModal().alert(false, "SCP Connections can exist only from one way to another, they cannot be bidirectional.");
            return;
        }

        this.connections.push({ source: this.currentConnection.source, dest: this.currentConnection.dest, description: this.currentConnection.description });
        this.currentConnection = { source: null, dest: null, description: "" };
        this.onNewConnectionMode = false;
        this.save();
        this.redraw();
        this.servicesProviderService.createNewModal().alert(true, "The SCP connection was stored successfully.");
    }

    selectNode(node: LLSCPEntity) {
        if (this.currentConnection.source === null) {
            this.currentConnection.source = node;
        }
        else {
            if (this.currentConnection.source === node) {
                this.currentConnection.dest = this.currentConnection.source = null;
                return;
            }
            if (this.currentConnection.dest !== null && this.currentConnection.dest === node) {
                this.currentConnection.dest = null;
                return;
            }
            this.currentConnection.dest = node;
            console.log("Connection ready!")
        }
    }

    groupIsActive(group: SCPGroup) {
        if (this.currentConnection.source !== null) {
            if (this.currentConnection.source.groupId !== group.id) {
                if (this.entities[group.id] === undefined) return false;
                if (this.entities[group.id].length === 0) return false;
                return true;
            }
        }
        return false;
    }

    ngOnDestroy(): void {
/*        console.log("save")*/

      //  this.save();
    }

    initialize(parent: ParentComponent): void {
        this.parent = parent;
        this.parent.setChangeAwareChild(this);
        this.parent.setObjectOfInterest(this);

        let data = this.parent.getSharedDataContainer();
        if (data === undefined) return;

        let entities = data.getEntities();
        if ( Object.keys(entities).length > 0) {
            this.entities = Deepcopy.copy(entities);
        }
        let connections = data.getConnections();
        if (connections.length > 0) {
            this.connections = Deepcopy.copy(connections);
        }
       // console.log(JSON.stringify(this.connections) );
    }

    entityUserDefined(es: LLSCPEntity) {
        return es.id === 0;
    }

    addNewEntity() {
        let inst = this;
        let dyn = this.servicesProviderService.createNewModalWithType(LLSCPEntityModalComponent);

        let onSuccess = () => {
            inst.ready = false;
            // inst.loadData(null);
        };

        let getData = () => {
            return { entity: null, handle: dyn, groups: inst.groupOptions, currentlySelected: inst.entities, onEditErrorCallback: () => { }, onEditSuccessCallback: onSuccess, showGroups:true } as SCPInputData
        };

        dyn.getObservableFromConfirmableOperation(getData, () => {}).subscribe((entity: LLSCPEntity) => {
            if (entity) {
                //console.log(entity);
                if (inst.entities[entity.groupId] === undefined) {
                    inst.entities[entity.groupId] = [];
                }
                //console.log(inst.entities);

                inst.entities[entity.groupId].push(entity);
                inst.save();
                inst.redraw();
                this.servicesProviderService.createNewModal().alert(true, "The SCP entity was added successfully.");
            }
            else {
            }
        });
    }

    getGroupName(id: number): string | null {
        for (let i = 0; i < this.allGroups.length; i++) {
            if (this.allGroups[i].id === id) {
                return this.allGroups[i].value;
            }
        }
        return null;
    }

    getEntityGraphFormat(): any {
        let g: SCPGraphEntity[] = [];
        let groups = Object.keys(this.entities);

        for (let i = 0; i < groups.length; i++) {
            let l: LLSCPEntity[] = this.entities[parseInt(groups[i])];
            for (let j = 0; j < l.length; j++) {
                let n: LLSCPEntity = l[j];
                /*console.log(l[j])*/
                let name = this.getNodeName(n);
                if (name === null) {
                    continue;
                }

                let connections = this.getEntityConnectionNames(n);
                let node: SCPGraphEntity = { name: name, connections: connections } as SCPGraphEntity;
                g.push(node);
            }
        }

        g = this.addPillarOnMissingGroup(g);
        return g;
    }

    addPillarOnMissingGroup(g: SCPGraphEntity[]) {
        //console.log(g)
        if (g.length === 0) {
            for (let i = 0; i < this.pillars.length; i++) {
                g.push({ ...this.pillars[i] });
            }
            return g;
        }
        let pillarExistence: { [key: string]: boolean } = {};
        //console.log(this.pillars)
        for (let i = 0; i < this.pillars.length; i++) {
            let name = this.pillars[i].name;
            let c = this.getNameSubstring(name);//name.split(".");
            let pillarName = c[1];
            pillarExistence[pillarName] = false;
        }
        //console.log(pillarExistence)

        for (let i = 0; i < g.length; i++) {
            let name = g[i].name;
            let c = this.getNameSubstring(name);
            let pillarName = c[1];
            pillarExistence[pillarName] = true;
        }

        for (let i = 0; i < this.pillars.length; i++) {
            let name = this.pillars[i].name;
            let c = this.getNameSubstring(name);
            let pillarName = c[1];
            if (!pillarExistence[pillarName]) {
                g.push({ ...this.pillars[i] });
                //console.log("Added "+ pillarName)
            }
        }
        return g;
    }

    getCharCountInString(s: string, delim: string) {
        if (!s) {
            return 0;
        }
        let count = 0;
        for (let i = 0; i < s.length; i++) {
            if (s[i] === delim) {
                count++;
            }
        }
        return count;
    }
    getNameSubstring(s: string) {
        let c = this.getCharCountInString(s, this.delimeter);
        if (c === 2) {
            return s.split(this.delimeter);
        }
        let st = s.split(this.delimeter);
        let b = st[2];
        for (let i = 3; i < st.length; i++) {
            b += this.delimeter + st[i];
        }
        let tmp = [];
        for (let i = 0; i < 2; i++) {
            tmp.push(st[i]);
        }
        tmp.push(b);
      //  console.log(tmp);
        return tmp;
    }

    getNodeName(n: LLSCPEntity): string | null {
        let name = this.entityPrefix + this.delimeter
        let groupName = this.getGroupName(n.groupId);
        if (groupName === null) {
            //console.log("couldn't find group name");
            return null;
        }
        name += groupName + this.delimeter + n.name;
        //console.log(name)
        return name;
    }

    getEntityConnectionNames(node: LLSCPEntity): string[] {
        let connections: string[] = [];
        for (let i = 0; i < this.connections.length; i++) {
            let con = this.connections[i];
/*            console.log(con);
            console.log(con.source);
            console.log(node);*/
            if (con.source && con.source.name === node.name && con.source.groupId === node.groupId) {
                let dest = con.dest;
                if (!dest) continue;
                let name = this.getNodeName(dest);
                if (!name) continue;
                connections.push(name);
            }
        }
        return connections;
    }
}
