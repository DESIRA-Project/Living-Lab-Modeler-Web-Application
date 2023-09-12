import { Input } from "@angular/core";
import { Component } from "@angular/core";
import { RuntimeObjectsService } from "../Service/runtimeobjects.service";
import { ValueContainerComponent } from "./value-container-component";

@Component({
  selector: 'options-list',
  templateUrl: './options-list.component.html',
//  styleUrls:['../style/options-list.css','../style/tool-filter-holder.css']
})

export class OptionsList implements ValueContainerComponent{
  @Input() name: string = "";
  @Input() description: string = "";

  _data: any = {};
  public attributeName: string = "";
  protected selectedOptions: any = [];
  protected initiallySelectedOptions:any = [];
  protected initialized: boolean = false;
  protected _parent: any = null;
  public dataReady: boolean = false;
  public valueMap: any = {};
  public showAll: boolean = false;
  public defaultMaxItemsOnViewLess: number = 5;
  public maxItemsOnViewLess: number = 5;
  public _toggleable:boolean = false;
  public _id:number = -1;
  public isReadOnly: boolean = false;
  public showingAmounts:boolean = true;

  constructor(protected rts:RuntimeObjectsService){

  }
  reset(): void {
   // throw new Error("Method not implemented.");
  }
  save(): void {
   
  }

  @Input() set setReadonly(isReadonly:boolean){
    this.isReadOnly = isReadonly;
}

@Input() set showAmounts(b:boolean){
      this.showingAmounts = b;
}

  valueHasChanged(): boolean {
    if(this.initiallySelectedOptions.length !== this.selectedOptions.length){
      return true;
    }
/*    console.log(this.initiallySelectedOptions);
    console.log(this.selectedOptions);*/
    for(let i = 0;i<this.initiallySelectedOptions.length;i++){
          if(this.selectedOptions.indexOf(this.initiallySelectedOptions[i]) === -1){
              return true;
          }
    }
    return false;
  }
  
  @Input()
  public set parent(p: any) {
    //console.log("Parent = "+p + " This.parent == " + this._parent);
    this._parent = p;
    this._parent.addChild(this);
  }

  @Input()
  public set toggleable(toggleable: boolean) {
      this._toggleable = toggleable;
  }

  @Input()
  public set id(_id: number) {
      this._id = _id;
  }

  @Input()
  public set data(d: any) {
    this._data = d;
    
    this.attributeName = this._data.attribute;

    let filters = this._parent && this._parent._parent ? this._parent._parent.getCurrentFilters() : [];
    let hasFilter: boolean = this.attributeName in filters;
    let selectedChanges = [];
    let minSelectedItemIndex:number = -1;
    //console.log(this._data);

    for (var i = 0; i < this._data.data.length; i++) {
      let id = this._data.data[i]["id"];
      this.valueMap[id] = this._data.data[i]['name'];

      if (hasFilter && filters[this.attributeName].indexOf(id) !== -1) {
        this._data.data[i]["selected"] = true;
        minSelectedItemIndex = i;
        this.selectedOptions.push(id);
        selectedChanges.push({
           id: id,
           value:this.valueMap[id],
           attributeName:this.attributeName
        });
      }
      else {
        if(this._data.data[i]["selected"] !== undefined && this._data.data[i]["selected"] === true){
          this.selectedOptions.push(id);
        }
          if(this._data.data[i]["selected"] === undefined){
              this._data.data[i]["selected"] = false;
          }
      }
    }
   
    if(minSelectedItemIndex + 1 >= this.maxItemsOnViewLess ){
        this.viewAll();
    }
    if(this._data.data.length <= this.maxItemsOnViewLess){
      this.showAll = true;
    }
    //console.log("called");

    this.rts.storeValueIfNotForgotten("selected"+this.attributeName,selectedChanges);
    this.rts.triggerAndForgetForever("selected"+this.attributeName);

    this.initiallySelectedOptions = [];
    for(let i = 0;i<this.selectedOptions.length;i++){
      this.initiallySelectedOptions.push(this.selectedOptions[i]);
    }

    this.dataReady = true;
  }

  public getLabel(opt:any){
      if(opt.value === undefined){
        return opt.name;
      }
      if(!this.showingAmounts){
           return opt.name;
      }

      return opt.name+ "("+opt.value+")";
  }

  public isToggled(){
    let key = "list"+this._id;
    let value = this.rts.getValue(key);
    //console.log(value);
    if(value === null) return false;
    if(value.toggle === undefined) return false;
    return value.toggle;   
  }

  public toggleList(){
       let key = "list"+this._id;
       let value = this.rts.getValue(key);
       if(value === null){
           let settings:any = {};
           settings.toggle = true;
           this.rts.storeValue(key, settings);
/*           console.log("storing info for "+key);
           console.log(settings);*/
       }
       else{
          if(value.toggle === undefined){
              value.toggle = true;
              this.rts.storeValue(key, value);
          }
          else{
              value.toggle = !value.toggle;
              this.rts.storeValue(key, value);
          }
       }
  }

  viewAll() {
     this.showAll = true;
     this.maxItemsOnViewLess = this._data.data.length;
 }

  viewLess(){
    this.showAll = false;
    this.maxItemsOnViewLess = this.defaultMaxItemsOnViewLess;
  }

  onOptionClicked(id:any,selected:boolean) {
//console.log(this.attributeName);
    let selection: boolean = !selected;
    let index: any = this.selectedOptions.indexOf(id);
    if (index !== -1) {
      if (selection === false) {
        this.selectedOptions.splice(index, 1);
      }
    }
    else {
      if (selection === true) {
        this.selectedOptions.push(id);

      }
    }
    
    for(let i = 0;i<this._data.data.length;i++){
      if(this._data.data[i].id === id){
        this._data.data[i].selected = selection;
        break;
      }
    }

    this._parent.triggerChange({
      name: this.attributeName,
      options: this.selectedOptions
    }, {
      id: id,
      value: this.valueMap[id],
      attributeName: this.attributeName,
      added: selection

    });
  }

  getValue(){
      return {  name: this.attributeName,
                options: this.selectedOptions
      };
  }

  update() {
    this.dataReady = false;
  }

}