import { Component, Input } from "@angular/core";
import { environment } from "src/environments/environment";
import { BackendService } from "../backend.service";
import { ReCaptchaService } from "../ReCaptchaService/recaptcha.service";

@Component({
    selector: 'form-tab',
    templateUrl: './form-tab.component.html',
    styleUrls: ['../style/contact.css'],
    providers: []
})

export class FormTab{
    _data:any = null;
    _children:any[] = [];
    alert:any = null;
    alertDismissTimeout:number = 3000;
    alertId = "kbtAlert";
    requestStatusClass = "";
    recaptchaClicked = false;
    usesRecaptcha = environment.env.backend.use_recaptcha;

    @Input()
    public set data(d: any) {
      this._data = d;
      //console.log(this._data.action);
    }

    constructor(private service : BackendService, private recaptcha:ReCaptchaService){
    
    }

    ngOnInit(){
        let inst = this;
        this.service.isInitialized().subscribe(isInit=>{
            if(isInit !== true){
                return;
            }
            if(!inst.usesRecaptcha) return;
            inst.recaptcha.isInitialized().subscribe(rcInit=>{
                if(rcInit !== true){
                    return;
                }
                inst.recaptcha.injectPluginScript();
                inst.recaptcha.isInjected().subscribe((val:any)=>{
                       if(val === true){
                           inst.recaptcha.execute((v:any)=>{
                               inst.recaptchaClicked = true;
                           })
                       }
                });
            });

        });
    }

    addChild(c:any){
        this._children.push(c);
    }

    performValidation(){
        let forms = document.getElementsByClassName('needs-validation');
        
        for(let i:number = 0;i<forms.length;i++){
            let form = <HTMLFormElement>forms[i];
            let isValid:boolean = form.checkValidity();
            if (isValid === false) {
              form.classList.add("invalid")  ;
            }
            else{
                form.classList.add("valid");  
            }
            form.classList.add('was-validated');
            if(isValid){
                this.performQuery();
            }
        }
    }

    private performQuery():void{
        let params:any = {};
        for(let i:number = 0;i<this._children.length;i++){
            params[this._children[i].getAttribute()] = this._children[i].getValue();            
        }

        let inst = this;

        let cleanAlert = ()=>{
             setTimeout(()=>{
              inst.alert = null;
             },inst.alertDismissTimeout);
        };

        let onFinish = (result:boolean)=>{
           inst.alert = {};

           if(result === true){
                inst.alert.msg = inst._data.action.onSuccessMessage;
                inst.requestStatusClass = "alert-success";
                cleanAlert();
                
           }
           else{
               inst.alert = {};
               inst.alert.msg = inst._data.action.onFailureMessage;
               inst.requestStatusClass = "alert-danger";
               cleanAlert();
           }
        };

/*        let performPost = ()=>{
            inst.service.performPostCall(this._data.action.value, params, onFinish);
        };*/
        inst.service.performPostCall(this._data.action.value, params, onFinish);

 //       this.recaptcha.execute(performPost);

    }
}