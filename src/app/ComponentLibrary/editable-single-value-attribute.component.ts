import { Component, ElementRef, Input, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { environment } from "src/environments/environment";
import { setConstantValue } from "typescript";
import { BackendService } from "../backend.service";
import { UserManagementService } from "../User/user-management.service";
import { ResolutionAwareComponent } from "./resolutionaware.component";
import { SingleValueContainerComponent } from "./single-value-container";
import { ValueContainerComponent } from "./value-container-component";

@Component({
    selector: 'editable-single-value-attribute',
    templateUrl: './editable-single-value-attribute.component.html',
//    styleUrls: ['../style/tool-detailed-view.css'],
    providers: []
})

export class EditableSingleValueAttributeComponent extends ResolutionAwareComponent implements ValueContainerComponent {

    static BooleanValue = class implements SingleValueContainerComponent{
        private value:boolean = false;
        private attrName:string = '';
        private initialValue:boolean  = false;

        constructor(value:any,attrName:string){
            this.value = value;
            this.attrName = attrName;
            this.initialValue = this.value;
        }
       
        isReady(): boolean {
            return true;
        }

        updateValue(): void {
            this.toggleValue();
        }

        isEmpty(){
            return false;
        }

        setValue(): void {

                if(this.value === null){
                    this.value = false;
                }
            
        }
        toggleValue(): void {
           // throw new Error("Method not implemented.");
           if(this.value === null){
            this.value = true;
        }
        else{
            this.value = !this.value;
        }
        }

        getValue() {
         
            if(this.value === null){
                this.value = false;
            }
            return {  name: this.attrName,
                      options: this.value
            };
        }
        valueHasChanged(): boolean {
            if(this.initialValue === null && this.value === true){
                return true;
            }
            if(this.value === false && this.initialValue === null){
                return false;
            }
            return this.initialValue !== this.value;
        
        }
        save(): void {
            this.initialValue = this.value;
        }
        reset(): void {
           // throw new Error("Method not implemented.");
        }
        getType(): string {
            return "boolean-value";
         }
         isValidValue(){
            return true;
        }
        getErrorMessage(){
            return "";
        }

    };

    static StringValue = class implements SingleValueContainerComponent{
        protected value:string = '';
        protected initialValue:string  = '';
        protected attrName:string = '';
        constructor(value:any,attrName:string){
            this.value = value;
            this.attrName = attrName;
            this.initialValue = this.value;
        }
      
        updateValue(): void {
            let el = document.getElementById(this.attrName);
            if(el === null) return;
            this.value =  (<HTMLInputElement>el).value ;
        }

        getType(): string {
           return "value";
        }

        isEmpty(){
            return this.value === null || this.value.length === 0 || this.value === '';
        }

        isReady(): boolean {
            return true;
        }
                
        setValue(): void {
            let el = document.getElementById(this.attrName);
            if(el === null) return;
            (<HTMLInputElement>el).value = this.value;          
        }

        isValidValue(){
            return true;
        }
        
        toggleValue(): void {
          //  throw new Error("Method not implemented.");
        }
        getValue() {
            let el = document.getElementById(this.attrName);
            this.value = (<HTMLInputElement>el).value;
 
            if(this.value === null){
                this.value = "";
            }

 /*           console.log(this.attrName)
            console.log(this.value)*/
            return {  name: this.attrName,
                      options: this.value
            };
      
        }

        getErrorMessage(){
            return "";
        }

        valueHasChanged(): boolean {
            if(this.value === '' &&  this.initialValue === null) return false;
            //console.log(this.value + " != " + this.initialValue)
            return this.value !== this.initialValue;
        }
        save(): void {
            this.initialValue = this.value;
        }
        reset(): void {
            //throw new Error("Method not implemented.");
        }
    };

    static URLValue = class extends EditableSingleValueAttributeComponent.StringValue{
        private validUrl = true;
        constructor(value:any,attrName:string){
            super(value, attrName);
            this.validUrl = this.checkIfValidUrl(this.value);
        }

        getType(): string {
            return "url-value";
         }

         getErrorMessage(){
             return "Not a valid url";
         }

         updateValue(): void {
            let el = document.getElementById(this.attrName);
            if(el === null) return;
            this.value =  (<HTMLInputElement>el).value ;
            let isValid = this.checkIfValidUrl(this.value);
            this.validUrl = isValid;
        }

        isReady(): boolean {
            return true;
        }
    
        private checkIfValidUrl(v:string){
            try{
                let u = new URL(v);
                return true;
            }catch(e){
                return false;
            }
        }

/*        setValue(){
            this.validUrl = this.checkIfValidUrl(this.value);
        }*/

        isValidValue(){
            return this.validUrl;
        }

        getValue() {
            let el = document.getElementById(this.attrName);
            this.value = (<HTMLInputElement>el).value;
 
            if(this.value === null){
                this.value = "";
            }

            return {  name: this.attrName,
                      options: this.value,
                      type:"url",
                      valid:this.validUrl
            };
      
        }
    };

    static InteractiveStringValue = class extends EditableSingleValueAttributeComponent.StringValue{

        private webService:any = {};
        private service:BackendService|null = null;
        private minimumInputLength:number = 5;
        private userManagement:UserManagementService|null = null;
        private token:String|null = null;
        private ready:boolean = true;
        private isValid:boolean = true;
        private errorMsg:string = "";

        constructor(value:any,attrName:string, private parent:EditableSingleValueAttributeComponent){
            super(value, attrName);
            this.webService = this.value;
            if(this.webService && this.webService.inputLengthCondition){
                this.minimumInputLength = this.webService.inputLengthCondition;
            }
            //console.log(this);
            //this.value = this.initialValue;

            if(this.webService.value !== undefined){
                this.initialValue = this.value = this.webService.value;
                /*console.log(this.initialValue);*/
            }
            else{
                this.initialValue = this.value = "";
            }
        }

        getType(): string {
            return "interactive-string-value";
         }

         getErrorMessage(){
             return this.errorMsg;
         }

         setBackendService(service: BackendService): void {
             this.service = service;
         }
         
        setUserManagementService(userManagement:UserManagementService){
            this.userManagement = userManagement;
            this.token = userManagement.getToken();
        }

         updateValue(): void {
             if(!this.ready) return;
            let el = document.getElementById(this.attrName);
            if(el === null) return;
            this.value = (<HTMLInputElement>el).value ;            
            //console.log(this.webService);
            if(this.value === this.initialValue){
                return;
            }
            if(this.value.length < this.minimumInputLength) return;
            let url = environment.env.backend.backend_prefix + this.webService.url;
            if(this.service){
                url = this.service.getPreparedURL(url);
            }
            if(this.token !== null){
                let params = {token:this.token, toolName:this.value, toolId:-1};                
                this.ready = false;
                let inst = this;
                //here
                if(this.parent.parent.currentToolId !== undefined){
                    params.toolId = this.parent.parent.currentToolId;
                }
                this.service?.performPostCall("", params, (result:any)=>{
                    //console.log(result);
                    if(result.responseData && result.responseData.length === 1){
                         //console.log(result.responseData[0].data);
                         if(result.responseData[0].data === false){
                             inst.errorMsg = result.responseData[0].description;                             
                             inst.isValid = false;
                         }
                         else{
                            inst.isValid = true;
                         }
                    }
                    inst.ready = true;
                }, true, url);
            }
        }

        private checkIfValidUrl(v:string){
            try{
                let u = new URL(v);
                return true;
            }catch(e){
                return false;
            }
        }

        isReady(): boolean {
            return this.ready;
        }
        

        isValidValue(){
            //console.log("isValidValue()")
            return this.isValid;
        }

        getValue() {
            let el = document.getElementById(this.attrName);
            this.value = (<HTMLInputElement>el).value;
 
            if(this.value === null){
                this.value = "";
            }

            return {  name: this.attrName,
                      options: this.value,
                      type:"interactive-string",
                      valid:this.isValid
            };
      
        }


        setValue(): void {
            let el = document.getElementById(this.attrName);
            if(el === null) return;
            //console.log(this.value);
            (<HTMLInputElement>el).value = this.value; 
        }
    };

    static ValueFactory = class {
        static getValueContainer(value:any, t:string, attrName:string,backend:BackendService,userManagement:UserManagementService,parent:EditableSingleValueAttributeComponent):SingleValueContainerComponent|null{
             // console.log(t);
              switch(t){
                  case "boolean-value":{
                      return new EditableSingleValueAttributeComponent.BooleanValue(value,attrName);
                  }
                  case "value":{
                      return new EditableSingleValueAttributeComponent.StringValue(value,attrName);
                  }
                  case "multi-line-value":{              
                    return new EditableSingleValueAttributeComponent.StringValue(value,attrName);
                }
                  case "url-value":{
                    return new EditableSingleValueAttributeComponent.URLValue(value,attrName);
                }
                case "interactive-string-value":{
                    let inst = new EditableSingleValueAttributeComponent.InteractiveStringValue(value,attrName,parent);
                    inst.setBackendService(backend);
                    inst.setUserManagementService(userManagement);
                    return inst;
                }
                                
                  default: return null;
              }
        }
    }

   // value:any = null;
    parent:any = null;
    isReadOnly:boolean = false;
   // initialValue:any = null;

    @Input() data:any = null;
    valueContainer:SingleValueContainerComponent|null = null;

    @Input() set setParent(p:any){
        this.parent = p;
        this.parent.addChild(this);
   }

    @ViewChild("editableValue", { static: false })
    input!: ElementRef;


    @Input() set setData(data:any){
        this.data = data;
        this.valueContainer = EditableSingleValueAttributeComponent.ValueFactory.getValueContainer(data.data.data,data.data.type,data.data.attribute, this.service,this.userManagement, this);
    }

    @Input() set setReadonly(isReadonly:boolean){
         this.isReadOnly = isReadonly;
    }

    public hasNonEmptyBooleanValue(){
        if(this.valueContainer === null){
            return false;
        }

        let v = this.valueContainer?.getValue();
        if(this.valueContainer.getType() !== 'boolean-value'){
            return false;
        }
        return v.options !== null && v.options !== false;

    }

    public hasBooleanValue(){
        return this.valueContainer !== null && this.valueContainer.getType() === 'boolean-value';
    }

    ngAfterViewInit() {
        this.setValue();
    }

    getErrorMessage(){
        if(this.valueContainer){
            return this.valueContainer.getErrorMessage();
        }
        return "";        
    }

    isReady(): boolean {
        if(this.valueContainer){
            return this.valueContainer.isReady();
        }
        return true;
    }
    

    getType(){
        if(this.valueContainer){
            return this.valueContainer.getType();
        }
        return "value";
    }

    isValidValue(){
        if(this.getType() !== 'url-value' && this.getType() !== 'interactive-string-value'){
            return true;
        }
        if(this.isEmpty()){
            return true;
        }

        if(this.valueContainer){
            return this.valueContainer.isValidValue();
        }
        return true;
    }


    isEmpty(){
        if(this.valueContainer){
            return this.valueContainer.isEmpty();
        }
        return true;
    }

    onInputChange(e:any){
        let valueHasChanged = false;
        if(this.valueContainer){
            this.valueContainer.updateValue();
            valueHasChanged = this.valueContainer.valueHasChanged();
        }
        if(this.parent !== null && this.parent.notifyForChange !== undefined){
            this.parent.notifyForChange();
        } 
    }

    private setValue():void{
        this.valueContainer?.setValue();
    }

    constructor(private service:BackendService, private userManagement:UserManagementService){
        super();
    }
    reset(): void {
       // throw new Error("Method not implemented.");
    }

    valueHasChanged(): boolean {
        return this.valueContainer !== null ? this.valueContainer.valueHasChanged() : false;
    }

    save(){
        this.valueContainer?.save();
    }

    toggleValue(){
        this.valueContainer?.toggleValue();
        this.parent.notifyForChange();
    }

    disableClick(){
        return false;
    }

    getValue(){
        return this.valueContainer?.getValue();
    }
  
    
}