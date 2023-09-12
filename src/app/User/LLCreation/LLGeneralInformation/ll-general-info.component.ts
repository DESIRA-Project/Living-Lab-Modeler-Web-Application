import { Component, OnDestroy } from "@angular/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { DynamicView } from "src/app/ComponentLibrary/dynamic-view";
import { DirtyView } from "src/app/Models/DirtyView";
import { ParentComponent } from "../../Admin/LivingLabEntityManagement/parent-component";
import {ChildComponent} from "../../Admin/LivingLabEntityManagement/child-component";
import {LLLocationComponent} from "../LLLocation/ll-location.component";
import { ObjectOfInterest } from "src/app/Models/ObjectOfInterest";
import { ScreenshotCapturer } from "src/app/Models/ScreenshotCapturer";
import { DataContainer } from "../../ll-update/data-container";
import { AngularEditorConfig } from "@kolkov/angular-editor";

@Component({
    selector: 'll-general-info',
    templateUrl: './ll-general-info.component.html',
    /*    styleUrls:['../../style/tables.css'],*/
    styleUrls: ['../ll-creation.component.css', 'll-general-info.component.css']
})

/**
 *
 * LL Name*

· Description*


· Focal question*
 */

export class LLGeneralInformationComponent implements  DynamicView, OnDestroy, DirtyView, ParentComponent,ObjectOfInterest, ScreenshotCapturer {
    data: any;
    llName: string = "";
    llDescription: string = "";

    
    llLogo: any = null;
    llFocalQuestion: string = "";
    title: string = "Living Lab General Information";
    parent: ParentComponent | null = null;
    fileToUpload: File | null = null;
    thumbnail: string | null = null;
    isPublic = false;
    locationFetched = false;
    locationComponent: ChildComponent | null = null;
    htmlContent = "";
    editorConfig: AngularEditorConfig = {   
        editable:true,
        sanitize:false,
        toolbarHiddenButtons: [

            [],[ 'insertImage',
            'insertVideo','toggleEditorMode']

       ]
    };

    setComponent(childComponent: ChildComponent): void {
      this.locationComponent = childComponent;
    }

    getSharedData(): any {
      return this.parent?.getSharedData();
    }

    storeValue(key: string, value: any) {
/*        console.log(value);*/
      this.parent?.storeValue(key, value);
    }

    setChangeAwareChild(v: DirtyView) {
    }

    transform(v:string):SafeHtml {
        return this.sanitizer.bypassSecurityTrustHtml(v);
      }

    constructor(private sanitizer: DomSanitizer) {

    }
    onScreenshotLoad(): void {
        this.parent?.storeValue("mapScreenshotLoadAsync", false);
    }
    screenshotReady(): void {
        this.parent?.storeValue("mapScreenshotLoadAsync", true);
    }

    setObjectOfInterest(o: ObjectOfInterest): void {
      
    }

    
    getSharedDataContainer():DataContainer{
        return this.parent ? this.parent?.getSharedDataContainer() : {} as DataContainer;
    }


    notify(): void {
        if(!this.parent) return;
        let data = this.parent.getSharedDataContainer();
        if (data === undefined) return;

        if (data.getLogo() !== undefined && data.getLogo().trim() !== '') {
            this.thumbnail = data.getLogo();
        }
    }
    clearValue(key: string): void {

    }

    clearLLName(){
        this.llName = '';
        this.saveGeneralInfo()
    }

    clearLLDescription(){
        this.llDescription = '';
        this.saveGeneralInfo()
    }

    clearLLFocalQuestion(){
      this.llFocalQuestion = '';
      this.saveGeneralInfo()
    }



    save(): boolean {
       if(this.llName !== ""){
            this.parent?.storeValue("name", this.llName);
       }
       if(this.llDescription !== ""){
           this.parent?.storeValue("description", this.llDescription);
       }
       this.parent?.storeValue("logo", this.thumbnail ?? undefined);
       if(this.llFocalQuestion !== ""){
           this.parent?.storeValue("focalQuestion", this.llFocalQuestion);
       }

       this.locationComponent?.save();

       return true;
    }

    saveGeneralInfo(): boolean {
        this.parent?.storeValue("name", this.llName);
        this.parent?.storeValue("description", this.llDescription);
        this.parent?.storeValue("focalQuestion", this.llFocalQuestion);        
        return true;
    }

    reset(): boolean {
        this.llName = '';
        this.llDescription = '';
        this.llLogo = null;
        this.llFocalQuestion = '';
        this.fileToUpload = null;
        this.thumbnail = null;
        this.isPublic = false;
        return true;
    }

    public isDirty():boolean{
        return (this.llName !== "" || this.llDescription !== "" || this.llLogo !== null || this.llFocalQuestion !== "" || this.isPublic || this.thumbnail != null)
    }

    keepParentUptoDate(s:any){
/*        console.log("---------------------------------->");
        console.log(this.llDescription);*/

        this.transform(s);

//        console.log (  );
        this.saveGeneralInfo();
    }

    initialize(parent: ParentComponent): void {
        this.parent = parent;
        this.parent.setChangeAwareChild(this);
        this.parent.setObjectOfInterest(this);
        let data = this.parent.getSharedDataContainer();

        if (data === undefined){
            this.locationFetched = true;
            return;
        }

        this.llName = data.getName();
        this.llDescription = data.getDescription();
        this.llFocalQuestion = data.getFocalQuestion();
        this.isPublic = data.getIsPublic();

        if(data.getLogo() !== undefined && data.getLogo().trim() !== ''){
            this.notify();
        }
        this.locationFetched = true;
    }


    clearImage() {
        if (this.thumbnail) {
            this.thumbnail = null;
        }
        if (this.fileToUpload) {
            this.fileToUpload = null;
        }
        this.save();
    }

    handleFileInput(event: Event) {
        let files = (event.target as HTMLInputElement).files;
        if (files && files.length) {
            this.fileToUpload = files[0];

            const reader = new FileReader();
            /*console.log(this.fileToUpload);*/
            reader.readAsDataURL(this.fileToUpload);
            reader.onload = this._handleReaderLoaded.bind(this);
            this.save();
        }
    }

    _handleReaderLoaded(readerEvt: any) {
        let binaryString = readerEvt.target.result;
        this.thumbnail = binaryString;
        this.parent?.storeValue("logo", this.thumbnail);
    }

    ngOnDestroy() {
        //this.save();
    }
}
