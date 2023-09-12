import { DebugElement } from "@angular/core";
import { ComponentFixture } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { type } from "os";
import { LlUpdateComponent } from "src/app/User/ll-update/ll-update.component";

export class ValueLogger{
    data:{[pageId:string] : {[valueId:string ] : any } } = {};

    constructor(){

    }

    captureValue(pageId:string, valueId:string, value:any){
         if(this.data[pageId] === undefined){
            this.data[pageId] = {};
         }
         if(this.data[pageId][valueId] === undefined){
            this.data[pageId][valueId] = "";
         }
         this.data[pageId][valueId] = value;
    }
    logValue(  component: LlUpdateComponent, fixture: ComponentFixture<LlUpdateComponent>){
      let generalInfoCollectInputValue = ((e: DebugElement, fixture: ComponentFixture<LlUpdateComponent>, elms: { debugElement: DebugElement, initialValue: string }[]) => {
         let formField = e.queryAll(By.css('textarea[name="title"]'));
         if (formField.length === 0) {
           formField = e.queryAll(By.css('input[name="title"]'));
         }
         if (formField.length === 0) {
           formField = e.queryAll(By.css('input'));
         }
         expect(formField.length).toEqual(1);
     
         let el = formField[0];
     
         let initialStringValue = el.nativeElement.value;
         elms.push({ debugElement: el, initialValue: initialStringValue });
     
         return elms;
       });

         let name = component.currentComponentName;
         switch (name) {
           case "llGeneralInfo": {
             let elms: { debugElement: DebugElement, initialValue: string }[] = [];
             let formFields = fixture.debugElement.queryAll(By.css('.form-field'));
             for (let i = 0; i < formFields.length; i++) {
               elms = generalInfoCollectInputValue(formFields[i], fixture, elms);
             }
             for(let i = 0;i<elms.length;i++){
               let name = elms[i].debugElement.attributes.dbgName;
               if(name === undefined || name === null) continue;
               this.captureValue("llGeneralInfo",name, elms[i].initialValue);
             }
             break;
           }
           case "llDTs": {
             let cards = fixture.debugElement.queryAll(By.css('.mat-card'));
             for(let i = 0;i<cards.length;i++){
               //console.log(cards[i].attributes["ng-reflect-disabled"]);
               let title = cards[i].query(By.css('.mat-card-title'));       
               let name = title.childNodes[0].nativeNode.attributes.title; 
               
               this.captureValue("llDTs", name.value ,cards[i].attributes["ng-reflect-disabled"]);
             }
             break;
           }
           case "llSDGs": {
             let cards = fixture.debugElement.queryAll(By.css('.mat-card'));
             for(let i = 0;i<cards.length;i++){
               let title = cards[i].query(By.css('.mat-card-title'));       
               let name = title.childNodes[0].nativeNode.attributes.title;           
               this.captureValue("llSDGs", name.value ,cards[i].attributes["ng-reflect-disabled"]);
             }
             break;
           }
           case "llDomains": {
             let checkBoxes = fixture.debugElement.queryAll(By.css('.mat-checkbox'));
             for(let i = 0;i<checkBoxes.length;i++){
               let checked = checkBoxes[i].classes['mat-checkbox-checked'];
               if(checked){
                 if(checkBoxes[i].nativeNode.attributes['data-dbgName'] === undefined) continue;
                 let name = checkBoxes[i].nativeNode.attributes['data-dbgName'].value;
                 this.captureValue("llDomains", name, true);
               }
             }
             break;
           }
           case "llStakeholders": {
             break;
           }
           case "llSCPEntities": {
             let entityBuckets = fixture.debugElement.queryAll(By.css('.entityBucket'));
             for(let i = 0;i<entityBuckets.length;i++){
               let divs = entityBuckets[i].childNodes;
               for(let j = 0;j<divs.length;j++){
                 if(divs[j].nativeNode.attributes === undefined) continue;
                 let value = divs[j].nativeNode.attributes['data-dbgName'].value;
                 this.captureValue("llSCPEntities", value, true);
               }
             }
             break;
             }
           case "llActivities": {
             break;
           }
           default: break;
         }
         return;
    }
    
    diff(other:ValueLogger){
      if(Object.keys(this.data).length !== Object.keys(other.data).length ) return true;
      let keys1 = Object.keys(this.data);
      keys1 = keys1.sort((one, two) => (one > two ? -1 : 1));
      let keys2 = Object.keys(other.data);
      keys2 = keys2.sort((one, two) => (one > two ? -1 : 1));
      for(let i = 0;i<keys1.length;i++){
         if(keys1[i] !== keys2[i]) return true;
      }
      for(let i = 0;i<keys1.length;i++){
         let v1 = this.data[keys1[i]];
         let v2 = other.data[keys1[i]];

         let kk1 = Object.keys(v1);
         kk1 = kk1.sort((one, two) => (one > two ? -1 : 1));
         let kk2 = Object.keys(v2);
         kk2 = kk2.sort((one, two) => (one > two ? -1 : 1));

         if(kk1.length !== kk2.length) return true;
         for(let j = 0;j<kk1.length;j++){
            if(kk1[j] !== kk2[j]) return true;
         }
         for(let j = 0;j<kk1.length;j++){
            let vv1 = v1[kk1[j]];
            let vv2 = v2[kk2[j]];
            //console.log(kk1[j] + kk2[j]);
            if(vv1 !== vv2) return true;   
         }         
      }
      return false;
    }

    diffExplained(other:ValueLogger):string[]{
      let areDiff = false;
      let changes = [];
      if(Object.keys(this.data).length !== Object.keys(other.data).length ) return ["diff keys length, first level"];
      let keys1 = Object.keys(this.data);
      keys1 = keys1.sort((one, two) => (one > two ? -1 : 1));
      let keys2 = Object.keys(other.data);
      keys2 = keys2.sort((one, two) => (one > two ? -1 : 1));
      for(let i = 0;i<keys1.length;i++){
         if(keys1[i] !== keys2[i]) return ["keys different, first level"];
      }
      for(let i = 0;i<keys1.length;i++){
         let v1 = this.data[keys1[i]];
         let v2 = other.data[keys1[i]];

         let kk1 = Object.keys(v1);
         kk1 = kk1.sort((one, two) => (one > two ? -1 : 1));
         let kk2 = Object.keys(v2);
         kk2 = kk2.sort((one, two) => (one > two ? -1 : 1));

         if(kk1.length !== kk2.length) return ["diff keys length, second level"];
         for(let j = 0;j<kk1.length;j++){
            if(kk1[j] !== kk2[j]) return ["keys different, second level"];
         }
         for(let j = 0;j<kk1.length;j++){
            let vv1 = v1[kk1[j]];
            let vv2 = v2[kk2[j]];
            //console.log(kk1[j] + kk2[j]);
            if(vv1 !== vv2){
               changes.push(keys1[i]+":"+kk1[j]+":"+vv1+"!="+vv2);
            }
         }         
      }
      return changes;
    }
};