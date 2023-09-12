export class User{
    data:any = [];
    public username = "";
    public firstName = "";
    public lastName = "";
    public email = "";
    public position = "";
    public role = "";
    public id = -1;
    public isActive = false;

    constructor(data:any){
         this.data = data.responseData;
         for(let i = 0;i<this.data.length;i++){
             let attrName = this.data[i].attribute;
             switch(attrName){
                 case "id":{
                     this.id = this.data[i].data;
                     break;
                 }
                 case "email":{
                    this.email = this.data[i].data[0];
                    break;
                 }
                 case "firstName":{
                    this.firstName = this.data[i].data;
                    break;

                 }
                 case "lastName":{
                    this.lastName = this.data[i].data;
                    break;
                 }
                 case "position":{
                    this.position = this.data[i].data;
                    break;
                 }
                 case "role":{
                    this.role = this.data[i].data[0];
                    break;
                 }
                 case "active":{
                     this.isActive = this.data[i].data;
                     break;
                 }
                 default: break;
             }
         }
         this.username = this.firstName + " " + this.lastName;
    }
}