import { Component } from "@angular/core";
import { RuntimeObjectsService } from "../Service/runtimeobjects.service";
import { SingleSelectionListComponent } from "./single-selection-list.component";

@Component({
    selector: 'searchable-dropdown',
    templateUrl: './dropdown-with-search.component.html',
    styleUrls: ['../style/options-list.css','../style/dropdown-with-search.css']
})

export class SearchableDropDownComponent extends SingleSelectionListComponent{

    public menuIsOpen = false;
    public searchText = "";
    public searchName = "";
    public rendered:any[] = [];
    public ready = false;

    constructor(protected rts: RuntimeObjectsService){
        super(rts);
    }

    getSelection(){
        return this.currentSelectionIndex;
    }

    openMenu(){
        //alert("openMenu")
       this.menuIsOpen = !this.menuIsOpen;
    }

    onInputChange(e:any){
        let el = document.getElementById(this.searchName);
        let value = (<HTMLInputElement>el).value;

        this.rendered = [];
        for(let i = 0;i<this._data.data.length;i++){
            if(this._data.data[i].name.toLowerCase().startsWith(value)){
                 this.rendered.push(this._data.data[i]);
            }
        }
    }

    ngAfterViewInit(){
        this.searchName = this.attributeName + "Search";
        //console.log(this)
        for(let i = 0;i<this._data.data.length;i++){
            this.rendered.push(this._data.data[i]);

            // Sort by name
            this.rendered.sort((x: any, y: any) => x.name < y.name ? -1 : 1);
        }

        this.ready = true;
    }
}
