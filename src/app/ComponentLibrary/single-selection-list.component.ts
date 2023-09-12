import { Component, Input } from "@angular/core";
import { RuntimeObjectsService } from "../Service/runtimeobjects.service";
import { OptionsList } from "./options-list.component";

@Component({
    selector: 'single-selection-list',
    templateUrl: './single-selection-list.component.html',
    styleUrls: ['../style/options-list.css']
})

export class SingleSelectionListComponent extends OptionsList {

    protected isSingleSelectionList: boolean = false;
    public currentSelectionIndex: number = -1;
    protected initialSelectionIndex:number = -1;

    @Input()
    public set data(d: any) {
        this._data = d;
        this.attributeName = this._data.attribute;

        let selectedChanges = [];
        let minSelectedItemIndex: number = -1;

        if (this._data.data.selection !== undefined) {
            this.isSingleSelectionList = true;
            this._data = d.data;
        }

        if (this._data.selection !== undefined) {
            this.currentSelectionIndex = this._data.selection;
        }

        for (var i = 0; i < this._data.data.length; i++) {
            let id = this._data.data[i]["id"];
            this.valueMap[id] = this._data.data[i]['name'];

            if (this._data.data[i]["selected"] === undefined) {
                this._data.data[i]["selected"] = false;
            }
        }

        if(this.currentSelectionIndex !== -1 && this._data && this._data.data && this.currentSelectionIndex <= this._data.data.length - 1){
            this._data.data[this.currentSelectionIndex]['selected'] = true;
        }

/*        if (minSelectedItemIndex + 1 >= this.maxItemsOnViewLess) {
            this.viewAll();
        }
        if (this._data.data.length <= this.maxItemsOnViewLess) {
            this.showAll = true;
        }*/

        this.initialSelectionIndex = this.currentSelectionIndex;
        this.dataReady = true;
    }

    constructor(protected rts: RuntimeObjectsService) {
        super(rts);
    }

    ngAfterViewInit(){
        if(this.currentSelectionIndex !== -1){
            let id:any = -1;
            let offset = 0;
            if(this.currentSelectionIndex > 5){
                offset = 5;
            }
            else{
                // we dont need to scroll, the item located in the start of the list
                return;
            }
            id = this._data.data[this.currentSelectionIndex - offset].id;
            if(id){
                let el = document.getElementById(id);
                console.log(el?.parentElement);
                if(el){
                    el.scrollIntoView();
                    window.scrollTo(0, 0);
                //    el.parentElement?.parentElement?.parentElement?.scrollTo(0, 0);
                }
            }
        }
    }

    onOptionClicked(id: any, selected: boolean) {
        let selection: boolean = !selected;
        //set clicked to !selected
        for (let i = 0; i < this._data.data.length; i++) {
            if (this._data.data[i].id === id) {
                this._data.data[i].selected = selection;

                if (this.currentSelectionIndex !== -1) {
                    this._data.data[this.currentSelectionIndex].selected = false;
                }

                if (selection === false) {
                    this.currentSelectionIndex = -1;
                }
                else
                    this.currentSelectionIndex = i;
                break;
            }
        }
        if (this._parent && this._parent.notifyForChange) {
            this._parent.notifyForChange();
        }
    }

    getValue() {
        return {
            name: this.attributeName,
            options: this.currentSelectionIndex === -1 ? -1 : this._data.data[this.currentSelectionIndex].id
        };
    }

    valueHasChanged(): boolean {
        return this.initialSelectionIndex !== this.currentSelectionIndex;
    }
}
