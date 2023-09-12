//import { Input } from "@angular/core";
import { Component } from "@angular/core";
import { PageConfigService } from "../pageconfig.service";
//import { MatSelectionListChange } from "@angular/material/list/selection-list";

@Component({
  selector: 'app-footer',
  templateUrl: './menu-footer.component.html',
  styleUrls:['../style/footer.css']
})

export class FooterComponent {
    public pageData:any = null;
    private configKey:string = "footer";
    public cookiesModalIsOpen:boolean = false;

    constructor(private configService:PageConfigService){

    }

    ngOnInit(){
        this.configService.getConfigData().subscribe((value) => {
            if(value === null){
                return;
            }
            if(this.configKey in value){
                this.pageData = value[this.configKey];
            }
        });
    }

    openBrowserTab(url:string){
        if(url !== null && url.length !== 0){
            window.open(url);
        }
    }

    toggleCookiesModal(){
        this.cookiesModalIsOpen = !this.cookiesModalIsOpen;
        return false;
    }

    onCookiesModalClose():Function{
        let parentRef = this;
        return (()=>{
            console.log("onCookiesModalClose");
            parentRef.cookiesModalIsOpen = false;
        });
    }
}
