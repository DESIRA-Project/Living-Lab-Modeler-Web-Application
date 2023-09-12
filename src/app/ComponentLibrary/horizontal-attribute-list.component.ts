import { Component, Input } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { BackendService } from "../backend.service";
import { ResolutionAwareComponent } from "../ToolFilterPage/resolutionaware.component";

@Component({
    selector: 'horizontal-attribute-list',
    templateUrl: './horizontal-attribute-list.component.html',
    styleUrls: ['../style/tool-detailed-view.css'],
    providers: []
})

export class HorizontalAttributeList extends ResolutionAwareComponent{
    @Input() parent:any;
    @Input() data:any;
    @Input() pageData:any = null;
    constructor(){
        super();
    }

    performQuery(value:any){
        let url:string|null = this.getSearchUrl();
        if(url !== null){
/*            console.log(value);
            console.log(this.data);*/
            let fullTextSearchable = this.data.data.fullTextSearchable;
            if(fullTextSearchable === true){
                let v = value.value;
                if(v.indexOf(" ") !== -1){
                    v = '"' + v + '"';
                }
                url = url+"?terms="+ ( v+"&types=0&operator=0");
            }
            else{
                url = url+"?"+this.data.data.attribute+"="+ ( value.id );
            }
            
            //http://localhost:4200/kbt/search?terms=olive&types=0&operator=0
//            url = url+"?terms="+ ( value.value+"&types=0&operator=0");
            //http://localhost:4200/kbt/search?terms=Social%20Media%20And%20Social%20Networks+plants&types=0+0&operator=0

            //this.openBrowserTab(encodeURI( url ));
            this.openBrowserTab( ( url ));
            
        }
    }

    getSearchUrl():string|null{
        if(this.pageData.search_url !== undefined){
             let tokens = window.location.pathname.split("/");
             tokens.pop();
             tokens.pop();

             let newPath = tokens.join("/") + this.pageData.search_url;
             let url = window.location.origin + newPath ;
             return url;
        }
        return null;
    }

    
}