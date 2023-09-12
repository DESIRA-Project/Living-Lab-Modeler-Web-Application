import { Injectable } from '@angular/core';


@Injectable({
    providedIn: 'root'
})
export class ScreenshotService {

    private data:  { [id: string] : string; } = {};
    private isDisabled = false;

    constructor() {

    }

    disable(){
          this.isDisabled = true;
    }

    isServiceDisabled(){
        return this.isDisabled;
    }

    get(key:string): string | undefined{
        return this.data[key];
    }

    add(key:string, data:string){
        this.data[key] = data;
    }

    clearAll(){
        this.data = {};
    }

    clearData(key:string){
        if(this.data[key]){
            //console.log("Cleaning screenshot with key "+key);
            this.data[key] = "";
            delete this.data[key];
        }
    }

    assignCallback(){
/*
        let key = this.data.locationState.latestSelection.data.screenshot ;
        let data = this.screenshotService.get(key);
        console.log(data);

        this.data.locationState.latestSelection.data.screenshot = data;
        return this.data;*/
    }
}
