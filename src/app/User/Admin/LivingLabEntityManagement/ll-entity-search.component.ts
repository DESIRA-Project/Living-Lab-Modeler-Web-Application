import { Component, HostListener, Input } from "@angular/core";
import { SCPEntitiesService } from "src/app/Service/SCPentities.service";
import { AlertSupportingComponent } from "../../alert-supporting-component";
import { SearchableComponent } from "./searchable-component";

export interface FilteredSearchParameters {
    groupIds: number[], keyword: string, needsVerification: boolean, field: string;
    sortField?:string, direction?:string
};

@Component({
    selector: 'll-entity-search',
    templateUrl: './ll-entity-search.component.html',
    styleUrls: ['./ll-entity-search.component.css']
    /*    styleUrls:['../../style/tables.css'],*/
})
export class LivingLabEntitySearchComponent extends AlertSupportingComponent {
    data: any;
    parent: SearchableComponent | null = null;
    searchFieldOptions = [{ key: "All Fields", value: null }, { key: "Entity Name", value: "name" }, { key: "Entity Description", value: "description" }];
    contentSearchOptions = [{ key: "All Content", value: null }, { key: "Public", value: true }, { key: "Local", value: false }];
    groupOptions: any[] = [];

    groupColors = ["orange", "var(--blue-400)", "var(--green-300)", "var(--red-400)"];
    value = "";
    options: any = {};
    selectedBadges: any = {};
    searchFieldInitialValue: string = "";
    contentSearchInitialValue: string = "";
    groupSearchInitialValue: string = "";
    parentSearchCallback: Function = () => { };
    debugMode: boolean = false;

    @HostListener('document:keypress', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
        if(event.code === 'Enter' && this.value.trim() !== ""){
            this.search();
        }
    }


    clearValue(){
      this.clear();
    }

    @Input()
    set debug(isDebugMode: boolean) {
        this.debugMode = isDebugMode;
    }

    @Input()
    set setParent(parent: SearchableComponent) {
        this.parent = parent;
    }

    @Input()
    set setGroupingData(data: any) {
        this.groupOptions = data;
        if (this.groupOptions.length > 0) {
           this.groupSearchInitialValue = this.groupOptions[0].value;
        }
    }

    @Input()
    set parentSearch(cb: Function) {
        this.parentSearchCallback = cb;
    }

    constructor(private service: SCPEntitiesService) {
        super();
        this.searchFieldInitialValue = this.searchFieldOptions[0].key;
        this.contentSearchInitialValue = this.contentSearchOptions[0].key;
    }

    selectFromList(item: any, label: string) {
        this.options[label] = item;
    }

    selectBadge(o: any) {
        //console.log(o);
        /*if (this.selectedBadges[o.id] !== undefined) {
            //it exists, we need to remove it
            this.selectedBadges[o.id] = null;
            delete this.selectedBadges[o.id];

            if (o.id !== 0 && this.selectedBadges[0] !== undefined) {
                //we need to remove the all badge
                this.selectedBadges[0] = null;
                delete this.selectedBadges[0];
            }
            else{
                this.selectedBadges = {};
            }
            return;
        }*/
        if (o.id === 0) {
            this.selectedBadges = {};
            //this.selectedBadges[o.id] = o;
            for (let i = 0; i < this.groupOptions.length; i++) {
                this.selectedBadges[this.groupOptions[i].id] = this.groupOptions[i];
            }
        }
        else {
            // First clear all other
            this.selectedBadges = {};
            // And then select current
            this.selectedBadges[o.id] = o;
        }
    }

    search() {
        let groupIds: number[] = [];
        let keyword = this.value;
        let needsVerification = undefined;
        let field = undefined;
        let keys = Object.keys(this.selectedBadges);
        for (let i = 0; i < keys.length; i++) {
            if (+keys[i] === 0) {
                continue;
            }
            groupIds.push(+keys[i]);
        }

        if (this.debugMode) {
            console.log("Selected Badges");
            console.log(this.selectedBadges);
            console.log("Group ids")
            console.log(groupIds);
            console.log(this.options);
            console.log("Keyword = " + this.value);
        }
        if (this.options["needsVerification"] !== undefined) {
            needsVerification = this.options["needsVerification"].value;
        }
        if (this.options["searchField"] !== undefined) {
            //console.log(this.options);
            if (this.options["searchField"].value === null) {
                field = undefined;
            }
            else {
                field = this.options["searchField"].value;
            }
        }
        if (this.debugMode) {
            console.log("Verification");
            console.log(needsVerification);
            console.log("Field");
            console.log(field);
        }

        if (needsVerification === null) {
            needsVerification = undefined;
        }

        let params = { groupIds: groupIds, keyword: keyword, needsVerification: needsVerification, field: field } as FilteredSearchParameters;
        this.parentSearchCallback(params);
    }

    clear() {
        this.value = "";
        this.options = {};
        this.selectedBadges = {};
        this.searchFieldInitialValue = this.searchFieldOptions[0].key;
        this.contentSearchInitialValue = this.contentSearchOptions[0].key;
        this.groupSearchInitialValue = this.groupOptions[0].value;

        this.search();
    }
}
