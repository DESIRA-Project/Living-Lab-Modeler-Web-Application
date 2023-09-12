export class AlertSupportingComponent{
    public alert:any = null;
    public errorAlert:any = null;    
    private alertDismissTimeout:number = 5000;

    public getLimitedString(value:string, limit:number){
        if(value.length < limit){
            return value;
        }
        return value.substring(0, limit)+"...";
    }
    
    public raiseAlertWithMessage(msg:string){       
        if(this.alert !== null){
            return;
        } 
        this.alert = {msg: msg};
        setTimeout(()=>{ 
            this.alert = null;
       }, this.alertDismissTimeout);
    }

    
    public raiseErrorAlertWithMessage(msg:string){       
        if(this.errorAlert !== null){
            return;
        } 
        this.errorAlert = {msg: msg};
        setTimeout(()=>{ 
            this.errorAlert = null;
       }, this.alertDismissTimeout);
    }

    closeErrorAlert(){
        this.errorAlert = null;
      }
}