import { Component, ElementRef, HostListener, Input } from "@angular/core";
import { environment } from "src/environments/environment";
import { BackendService } from "../backend.service";
import { AlertSupportingComponent } from "../User/ToolSuggestion/alert-supporting-component";
import { ValueContainerComponent } from "./value-container-component";

@Component({
    selector: 'interactive-keyword-container',
    templateUrl: './interactive-keyword-container.component.html',
    providers: []
})

export class InteractiveKeywordContainerComponent  extends AlertSupportingComponent implements ValueContainerComponent{
    public attributeName = null;
    public _data:any = null;
    public _parent:any = null;
    public ready = false;
    public selectedKeywords:any[] = [];
    public fetchedResults:any[] = [];
    private interactionSettings:any = null;
    public currentValue = "";
    private previousValue = "";
    private userToken:any = null;
    public fetchedResultsReady = false;
    private initialSelection:any[] = [];
    public isReadOnly:boolean = false;
    
    @Input()
    public set data(d: any) {
      this._data = d;
      this.attributeName = this._data.name;
      this.interactionSettings = this._data.data.data;
      
      if(this.interactionSettings.selected !== undefined){
           this.interactionSettings.selected = JSON.parse(this.interactionSettings.selected);
           for(let i = 0;i<this.interactionSettings.selected.length;i++){
             let keyword:any = this.interactionSettings.selected[i].keyword;
             this.selectedKeywords.push(keyword);
           }
      }
      this.initialSelection = [];

      for(let i = 0;i<this.selectedKeywords.length;i++){
        this.initialSelection.push(this.selectedKeywords[i]);
      }
      
      this.ready = true;
    }

    @Input() set setReadonly(isReadonly:boolean){
      this.isReadOnly = isReadonly;
 }

    @Input()
    public set parent(p: any) {
      this._parent = p;
      this._parent.addChild(this);
    }

    constructor(private service:BackendService,private eRef: ElementRef){
         super();
      //   this.errorAlert = {msg:"te egene"};
    }
  reset(): void {
   // throw new Error("Method not implemented.");
  }
  save(): void {
  }
  valueHasChanged(): boolean {
    if(this.initialSelection.length !== this.selectedKeywords.length){
      return true;
    }
    for(let i = 0;i<this.initialSelection.length;i++){
      if(this.selectedKeywords.indexOf(this.initialSelection[i]) === -1){
        return true;
      }
    }
    return false;
  }

    @HostListener('document:click', ['$event'])
    clickout(event:any) {
      
      if(this.eRef.nativeElement.contains(event.target)) {
      } else {
        if(this.fetchedResultsReady === true){
            this.fetchedResultsReady = false;
        }
      }
    }
 

    addNewKeywordIfPossible(){
      
      let lowercase = this.currentValue.toLowerCase().trim();
/*      console.log(this.selectedKeywords)
      console.log(this.selectedKeywords.indexOf(lowercase));
      console.log(lowercase)
*/
      let existingKeywordsLowerCase = [];
      for(let i = 0;i<this.selectedKeywords.length;i++){
        existingKeywordsLowerCase.push(this.selectedKeywords[i].toLowerCase());
      }
      
         if(existingKeywordsLowerCase.indexOf(lowercase) === -1){
                // we add it
                this.selectedKeywords.push(this.currentValue);
                this.previousValue = this.currentValue = "";
                this.fetchedResults = [];
                if(this._parent !== null && this._parent.notifyForChange !== undefined){
                  this._parent.notifyForChange();
                }
                this.fetchedResultsReady = false;
    
              }
         else{
           this.raiseErrorAlertWithMessage("'"+lowercase+"' exists.")
         }
    }

    getValue() {
        return {  name: this.attributeName,
            options: this.selectedKeywords
        };
    }

    setUserToken(token:any){
         this.userToken = token;
    }


    selectElement(index:number){
      
        if(index >= 0 && index < this.fetchedResults.length){
            let value = this.fetchedResults[index];
            if(this.selectedKeywords.indexOf(value) !== -1){
              return;
            }
            this.selectedKeywords.push(this.fetchedResults[index]);
            this.previousValue = this.currentValue = "";
            this.fetchedResults = [];
            if(this._parent !== null && this._parent.notifyForChange !== undefined){
              this._parent.notifyForChange();
            }
            this.fetchedResultsReady = false;
        }
    }

    removeSelectedKeyword(index:number){
      if(index >= 0 && index < this.selectedKeywords.length){
        this.selectedKeywords.splice(index, 1);

        if(this._parent !== null && this._parent.notifyForChange !== undefined){
          this._parent.notifyForChange();
        }
      }

    }

    fetchResults(value:string){
      if(this.userToken !== null){
          this.fetchedResultsReady = false;
          let prefix = environment.env.backend.backend_prefix;
          this.service.getToolKeywords(prefix + this.interactionSettings.url,value,this.userToken,(res:any)=>{
              this.fetchedResults = [];
              if(res.responseData && res.responseData.length === 1){
                  this.fetchedResults = res.responseData[0];
                  for(let i = 0;i<this.selectedKeywords.length;i++){
                    let index = this.fetchedResults.indexOf ( this.selectedKeywords[i]);
                    if(index !== -1 ){
                      console.log("delete "+this.fetchedResults[index])
                      //remove the dup elem between the 2 lists
                        this.fetchedResults.splice(index, 1);
                    }
                  }
                  this.fetchedResultsReady = true;
                  //console.log(this.fetchedResults)
              }
          });
      }

    }

    inputUpdated(){
   
      //console.log("input Updated")
      if(this.currentValue !== null && 
         this.interactionSettings !== null && 
         this.interactionSettings.inputLengthCondition &&
         this.currentValue.length >= this.interactionSettings.inputLengthCondition && 
         this.interactionSettings.url){

            if(this.currentValue !== this.previousValue){
                this.previousValue = this.currentValue;
                this.fetchResults(this.currentValue);
          }
      }
      if( (this.currentValue === "" || this.currentValue.length < this.interactionSettings.inputLengthCondition ) && this.fetchedResultsReady === true){
        this.fetchedResultsReady = false;
        this.fetchedResults = [];
      }

    }


}