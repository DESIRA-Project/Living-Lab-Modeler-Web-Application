import { Component, Input } from "@angular/core";
import { ChildComponent } from "./child-component";
import { ParentComponent } from "./parent-component";

@Component({
    selector: 'll-entity-bulk-operations ',
    templateUrl: './ll-entity-bulk-operations.component.html',
    styleUrls: ['ll-entity-bulk-operations.component.css']
})
export class LivingLabEntityBulkOperationsComponent implements ChildComponent {
    actions:any [] = [];
    ready: boolean = false;
    isDisabled : boolean = true;
    parent : ParentComponent|null = null;

    @Input()
    set setParent(parent: ParentComponent){
        this.parent = parent;
        this.parent.setComponent (this);
    }

    save(): boolean {
        return true;
    }

    reset(): boolean {
        this.actions = [];
        return true;
    }

    isDirty(): boolean {
        return false;
    }

    @Input()
    set setActions(actions:any){
        this.actions = actions;
        this.ready = true;
    }

    setDisability(isDisabled: boolean): void {
        this.isDisabled = isDisabled;
    }

}
