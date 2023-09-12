import { Component, Input, InputDecorator } from "@angular/core";
import { ValueContainerComponent } from "./value-container-component";

@Component({
    selector: 'selectable-drop-down',
    templateUrl: './selectable-drop-down.component.html',
    providers: []
})

export class SelectableDropDownComponent implements ValueContainerComponent{
    public _data:any = null;
    public _parent:any = null;
    public ready = false;
    public selectedIndex = 0;
    public attributeName = null;
    private initiallySelectedIndex = 0;
    public isReadOnly:boolean = false;
    public isRequired:boolean = false;
    public validationActive:boolean = false;

    @Input()
    public set data(d: any) {
      this._data = d;
      this.attributeName = this._data.name;
      this.checkForSelectionInitialization();
      if(this._data.data.isRequired !== undefined){
          this.isRequired = this._data.data.isRequired;
      }      
      this.ready = true;
    }

    reset(): void {

    }
          
    save(): void {
    }

    valueHasChanged(): boolean {
        return this.selectedIndex !== this.initiallySelectedIndex;
    }

    @Input() set setReadonly(isReadonly:boolean){
        this.isReadOnly = isReadonly;
   }

    private checkForSelectionInitialization():void{
        if(this._data.data.data === undefined) return;
        for(let i = 0;i<this._data.data.data.length;i++){
            let node = this._data.data.data[i];
            if(node.selected !== undefined && node.selected === true){  
                this.initiallySelectedIndex = this.selectedIndex = i;
                return;
            }
        }
    }

    onInputChange(){
         if(this._parent !== null && this._parent.notifyForChange !== undefined){
            this._parent.notifyForChange();
         }
    }

    @Input()
    public set parent(p: any) {
      this._parent = p;
      this._parent.addChild(this);
    }

    selectElement(index:number){
        if(this._data === null) return;
        if(index < 0 || index >= this._data.data.length) return;

         this.selectedIndex = index;

         if(this.isRequired && !this.validationActive){
             this.validationActive = true;
         }
         this.onInputChange();
    }

    getValue() {
        return {  
            name: this.attributeName,
            valid:this._data.data.data[this.selectedIndex].id !== -1,
            options: this.ready && this._data.data && this.selectedIndex >= 0 && this._data.data.data && this.selectedIndex < this._data.data.data.length ?  this._data.data.data[this.selectedIndex] : null
        };    
    }

}