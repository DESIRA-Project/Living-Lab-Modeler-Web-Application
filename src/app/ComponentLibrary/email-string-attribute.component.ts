import { Component, Input } from "@angular/core";

@Component({
    selector: 'email-string-attribute',
    templateUrl: './email-string-attribute.component.html',
//    styleUrls: ['../style/.css'],
    providers: []
})

export class EmailStringAttribute{
    _data:any = null;
    _p:any = null;
    _content:string = "";

    @Input()
    public set parent(p: any) {
      this._p = p;
      this._p.addChild(this);
    }

    @Input()
    public set data(d: any) {
      this._data = d;
//      console.log(this._data);
    }

    getValue():string{
       return this._content;
    }

    getAttribute():string{
        if(this._data === null) return "";
        return this._data.attributeName;
    }

    validate(){
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
      }
  }

}