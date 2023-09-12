import L from "leaflet";
import { Activity } from "src/app/Models/Activity";
import { LLData, LightWeightLLData } from "src/app/Models/LLData";
import { LLDataChanges } from "src/app/Models/LLDataChanges";
import { LLStakeholder } from "src/app/Models/LLStakeholder";
import { Deepcopy } from "src/app/Utils/deepcopy";
import { LLSCPEntity } from "../Admin/LivingLabEntityManagement/scp-entity";
import { LLCreationComponent } from "../LLCreation/ll-creation.component";
import { LLLocationComponent, LocationSelection, LocationState } from "../LLCreation/LLLocation/ll-location.component";
import { SCPConnection } from "../LLCreation/LLSCPEntities/ll-scp-entities.component";
import { SDGImpactNode } from "../LLCreation/LLSDGs/sdg-impact-modal/sdg-impact-modal.component";
import { LlUpdateComponent } from "./ll-update.component";
import {Outcome} from "../../Models/Outcome";
import {OutcomeTag} from "../../Models/OutcomeTag";
import {AssetResourceDetails} from "../../Models/AssetResourceDetails";

export class DataContainer {
  data: LLData = {} as LLData;
  initialData: LLData = {} as LLData;

  changes: LLDataChanges = {} as LLDataChanges;
  dataHaveChanged: boolean = false;
  hasPendingAsyncTasks: boolean = false;

  asyncTasks: { [id: string]: boolean } = {};

  parent: LLCreationComponent = {} as LLCreationComponent;
  debug = false;

  private testing = false;

  constructor(parent: LLCreationComponent,debug:boolean) {
    this.parent = parent;
    this.debug = debug;
  }

public setOnTestMode(){
  this.testing = true;
}

public getOnTestMode(){
  return this.testing;
}

public buildLightWeightLLDataObject(d: LLData): LightWeightLLData {
  let light = {} as LightWeightLLData;
  if (d.changes === null) return light;
  let changes = d.changes;

  light.name = changes.name ? d.name : undefined;
  light.focalQuestion = changes.focalQuestion ? d.focalQuestion : undefined;
  light.description = changes.description ? d.description : undefined;
  light.logo = changes.logo ? d.logo : undefined;
  light.locationState = changes.locationState ? d.locationState : undefined;
  light.selectedDTs = changes.selectedDTs ? d.selectedDTs : undefined;
  light.selectedSDGs = changes.selectedSDGs || changes.selectedSDGImpact ? d.selectedSDGs : undefined;

/*  console.log(changes.selectedSDGImpact);
  console.log(d.selectedSDGImpact);*/
  

  light.selectedSDGImpact = changes.selectedSDGImpact ? d.selectedSDGImpact : undefined;
  light.selectedTax = changes.selectedTax ? d.selectedTax : undefined;
  light.selectedExistingStakeholders = changes.selectedExistingStakeholders ? d.selectedExistingStakeholders : undefined;

  if (changes.newlyCreatedStakeholders) {
    light.newlyCreatedStakeholders = d.newlyCreatedStakeholders;
    light.selectedExistingStakeholders = d.selectedExistingStakeholders;
  }

  if(changes.connections || changes.entities){
       light.entities =  d.entities;
       light.connections = d.connections;
       d.changes.entities = true;
       d.changes.connections = true;
  }
//  light.entities = changes.entities ? d.entities : undefined;
 // light.connections = changes.connections ? d.connections : undefined;
  light.activities = changes.activities ? d.activities : undefined;
  light.activityIdsToBeDeleted = changes.activityIdsToBeDeleted ? d.activityIdsToBeDeleted : undefined;
  light.public = d.public;
  light.isPublished = changes.isPublished ? d.isPublished : undefined;

  light.status = d.status;
  light.outcomes = changes.outcomes ? d.outcomes : undefined;

  light.changes = d.changes;
  //console.log(light.changes.selectedSDGImpact)
  return light;
}


  public clear(){
    this.changes.livingLabId = false;
    this.changes.name = false;
    this.changes.focalQuestion = false;
    this.changes.description = false;
    this.changes.logo = false;
    this.changes.locationState = false;

    this.changes.selectedDTs = false;
    this.changes.selectedSDGs = false;
    this.changes.selectedSDGImpact = false;
    this.changes.selectedTax = false;
    this.changes.selectedExistingStakeholders = false;
    this.changes.newlyCreatedStakeholders = false;
    this.changes.entities = false;
    this.changes.connections = false;
    this.changes.activities = false;
    this.changes.activityIdsToBeDeleted = false;
    this.changes.isPublic = false;
    this.changes.isPublished = false;
    this.changes.outcomes = false;
  }

  public defaultInitialization():void{
    this.initialData = {} as LLData;
    this.initialData.name = "";
    this.initialData.description = "";
    this.initialData.focalQuestion = "";
    this.initialData.livingLabId = 0;
    this.initialData.selectedTax = {0:{},1:{},2:{}} ;
    this.initialData.selectedDTs = {};
    this.initialData.selectedSDGs = {};
    this.initialData.selectedSDGImpact = {};
    this.initialData.newlyCreatedStakeholders = [];
    this.initialData.selectedExistingStakeholders = [];
    this.initialData.entities = {};
    this.initialData.connections = [];

    this.initialData.locationState = {
      locationChoice: -1,
      citySearchString: "",
      countrySearchString: "",
      userdefinedlocation: "",
      locationSelection: null,
      currentConfig: LLLocationComponent.defaultConfig,
      latestSelection:{} as LocationSelection,
      initializeInUpdateMode: false
    };
    this.initialData.activities = [];
    this.initialData.activityIdsToBeDeleted = [];
    this.initialData.isPublic = false;
    this.initialData.isPublished = false;
    this.initialData.logo = "";
    this.initialData.outcomes = [];

    this.data = Deepcopy.copy(this.initialData);

    this.initializeChangeState();
  }

  public initialize(processedData: LLData): void {
    this.data = Deepcopy.copy(processedData);
    this.data.selectedTax = Deepcopy.copy(processedData.selectedTax);
    this.initialData = Deepcopy.copy(processedData);
    this.initialData.selectedTax = Deepcopy.copy(processedData.selectedTax);
    this.initialData.selectedDTs = Deepcopy.copy(processedData.selectedDTs);
    this.initialData.livingLabId = processedData.livingLabId;
    this.initialData.selectedSDGs = Deepcopy.copy(processedData.selectedSDGs);
    this.initialData.selectedSDGImpact = processedData.selectedSDGImpact ? Deepcopy.copy(processedData.selectedSDGImpact) : {};
    this.initialData.newlyCreatedStakeholders = processedData.newlyCreatedStakeholders !== undefined ? Deepcopy.copy(processedData.newlyCreatedStakeholders) : [];
    this.initialData.selectedExistingStakeholders = processedData.selectedExistingStakeholders !== undefined ? Deepcopy.copy(processedData.selectedExistingStakeholders) : [];
    this.initialData.entities = processedData.entities !== undefined ? Deepcopy.copy(processedData.entities) : {};
    this.initialData.connections = processedData.connections !== undefined ? Deepcopy.copy(processedData.connections) : [];
    this.initialData.locationState = processedData.locationState !== undefined ? Deepcopy.copy(processedData.locationState) : {};
    this.initialData.activities = processedData.activities !== undefined ? Deepcopy.copy(processedData.activities) : [];
    this.initialData.activityIdsToBeDeleted = processedData.activityIdsToBeDeleted !== undefined ? Deepcopy.copy(processedData.activityIdsToBeDeleted) : [];
    this.initialData.isPublic = processedData.isPublic === undefined ? false : processedData.isPublic;
    this.initialData.isPublished = processedData.isPublished === undefined ? false : processedData.isPublished;
    this.initialData.logo = processedData.logo === undefined ? "" : processedData.logo;
    this.initialData.outcomes = processedData.outcomes !== undefined ? Deepcopy.copy(processedData.outcomes) : [];
    // console.log(JSON.stringify(this.initialData.activities));

    /*console.log(JSON.stringify(processedData.selectedExistingStakeholders));*/
    this.initializeChangeState();
  }

  private initializeChangeState(){
    this.changes.livingLabId = false;
    this.changes.name = false;
    this.changes.focalQuestion = false;
    this.changes.description = false;
    this.changes.logo = false;
    this.changes.locationState = false;

    this.changes.selectedDTs = false;
    this.changes.selectedSDGs = false;
    this.changes.selectedSDGImpact = false;
    this.changes.selectedTax = false;
    this.changes.selectedExistingStakeholders = false;
    this.changes.newlyCreatedStakeholders = false;
    this.changes.entities = false;
    this.changes.connections = false;
    this.changes.activities = false;
    this.changes.activityIdsToBeDeleted = false;
    this.changes.isPublic = false;
    this.changes.isPublished = false;
    this.changes.outcomes = false;
  }

  public clearValue(key: string): void {
    switch (key) {
      case ("isPublic"): {
        this.data.isPublic = undefined;
        break;
      }
      case ("name"): {
        this.data.name = "";
        break;
      }
      case ("description"): {
        this.data.description = "";
        break;
      }
      case ("logo"): {
        this.data.logo = "";
        break;
      }
      case ("focalQuestion"): {
        this.data.focalQuestion = "";
        break;
      }
      case ("locationState"): {
        this.data.locationState = {

          locationChoice: 0,
          citySearchString: "",
          countrySearchString: "",
          userdefinedlocation: "",
          locationSelection: null,
          currentConfig: {
            center: new L.LatLng(0, 0),
            zoom: 3,
            currentMarker: undefined,
            maxZoom: 0,
            minZoom: 0
          },
          latestSelection: {} as LocationSelection,
          initializeInUpdateMode: undefined

        };

        break;
      }
      case ("selectedDTs"): {
        this.data.selectedDTs = {};
        break;
      }
      case ("selectedSDGs"): {
        this.data.selectedSDGs = {};
        break;
      }
      case ("selectedExistingStakeholders"): {
        this.data.selectedExistingStakeholders = [];
        break;
      }
      case ("newlyCreatedStakeholders"): {
        this.data.newlyCreatedStakeholders = [];
        break;
      }

    }
  }

  public getDataHaveChanged(): boolean {
    return this.dataHaveChanged;
  }

  public getHasPendingAsyncTasks(): boolean {
    return this.hasPendingAsyncTasks;
  }

  private handleAsyncTask(key: string, value: any) {
    if (this.asyncTasks[key] === undefined) {
      //new value
      if (value !== false) {
        //do nothing, we expect initially false
        return;
      }
      this.asyncTasks[key] = value;
    }
    else {
      if (value !== true) {
        //do nothin
        return;
      }

      delete this.asyncTasks[key];
    }

    this.hasPendingAsyncTasks = Object.keys(this.asyncTasks).length > 0;
    /*console.log(this.hasPendingAsyncTasks);*/
    this.parent.readhasPendingAsyncTasks();

  }

  public storeValue(key: string, value: any) {
    if(this.debug){
        console.log(key);
        console.log(value);
    }
    if (key.endsWith("LoadAsync")) {
      this.handleAsyncTask(key, value);
      return;
    }
    switch (key) {
      case ("isPublic"): {
        this.data.isPublic = value;
        if (this.data.isPublic === undefined) {
          if (value) {
            this.changes.isPublic = true;
          }
        }
        else{
          this.changes.isPublic = this.initialData.isPublic !== value;
        }
        break;
      }
      case ("isPublished"): {
        this.data.isPublished = value;
        if (this.initialData.isPublished === undefined) {
          if (value) {
            this.changes.isPublished = true;
          }
        }
        else{
          this.changes.isPublished = this.initialData.isPublished !== value;
        }
        break;
      }


      case ("name"): {
        this.data.name = value;
        this.changes.name = this.initialData.name.trim() !== value.trim();
        break;
      }
      case ("description"): {
        this.data.description = value;
        this.changes.description = this.initialData.description.trim() !== value.trim();
        break;
      }
      case ("logo"): {
/*        console.log("prev "+this.data.logo);
        console.log("initial "+this.initialData.logo);
        console.log("current "+value);*/
        if(value === undefined){
          value = "";
        }
        if(this.data.logo === undefined){
          this.data.logo = "";
        }

        this.data.logo = value;
        this.changes.logo = this.initialData.logo.trim() !== value.trim();

/*        if(!this.initialData.logo && value){
          alert("compare1 !")

            this.changes.logo = true;
        }
        else if(this.initialData.logo && value){
          alert("compare 2!")
           this.changes.logo = this.initialData.logo.trim() !== value.trim();
        }
        else if (!this.initialData.logo && !value){
          alert("compare 3!")

        }
        else if(this.initialData.logo && !value){
          this.changes.logo = true;
          alert("compare 4!")

        }*/
//        this.changes.logo = (!this.initialData.logo || (this.initialData.logo && this.initialData.logo.trim() !== value.trim())) ? true : false;
        break;
      }
      case ("focalQuestion"): {
        this.data.focalQuestion = value;
        this.changes.focalQuestion = this.initialData.focalQuestion.trim() !== value.trim();
        break;
      }
      case ("locationState"): {
        /*console.log(JSON.stringify(this.initialData.locationState));
        console.log(JSON.stringify(value));*/
        this.data.locationState = value;
        this.changes.locationState = this.locationsDiffer(this.initialData.locationState, value);
        break;
      }
      case ("selectedTax"): {
        this.data.selectedTax = value;
        this.changes.selectedTax = this.taxDiffer(this.initialData.selectedTax, value);
        break;
      }
      case ("selectedDTs"): {
        this.data.selectedDTs = value;
        /*console.log(JSON.stringify(this.initialData.selectedDTs));
        console.log(JSON.stringify(value) );*/
        this.changes.selectedDTs = this.selectionDiffers(this.initialData.selectedDTs, value);
        break;
      }
      case ("selectedSDGs"): {
        this.data.selectedSDGs = value;
/*        console.log(JSON.stringify(this.initialData.selectedSDGs));
        console.log(JSON.stringify(value) );*/
        this.changes.selectedSDGs = this.selectionDiffers(this.initialData.selectedSDGs, value);
  //      console.log(this.changes.selectedSDGs);
        break;
      }
      case ("selectedExistingStakeholders"): {
        this.data.selectedExistingStakeholders = value;
        this.changes.selectedExistingStakeholders = this.existingStakeholderListDiffers(this.initialData.selectedExistingStakeholders, value);
        break;
      }
      case ("newlyCreatedStakeholders"): {
        this.data.newlyCreatedStakeholders = value;
        this.changes.newlyCreatedStakeholders = this.newlyCreatedStakeholderListDiffers(this.initialData.newlyCreatedStakeholders, value);

        break;
      }
      case ("entities"): {
        this.data.entities = value;
        this.changes.entities = this.entitiesDiffer(this.initialData.entities, value);
        break;
      }
      case ("connections"): {
        this.data.connections = value;
        this.changes.connections = this.connectionsDiffer(this.initialData.connections, value);
        break;
      }
      case ("locationState"): {
        this.data.locationState = value;
        this.changes.locationState = this.locationsDiffer(this.initialData.locationState, value.locationState);
        break;
      }
      case("activities"):{
        this.data.activities = value;
        this.changes.activities = this.activityArraysDiffer(this.initialData.activities, value);
/*        console.log(this.changes.activities);*/
        break;
      }
      case("activityIdsToBeDeleted"):{
        this.data.activityIdsToBeDeleted = value;
        this.changes.activityIdsToBeDeleted = this.arrayOfNumbersDiff(this.initialData.activityIdsToBeDeleted, value);
        break;
      }
      case("selectedSDGImpact"):{
        this.data.selectedSDGImpact = value;
       // console.log(this.initialData.selectedSDGImpact);
        this.changes.selectedSDGImpact = this.SDGImpactDiff(this.initialData.selectedSDGImpact, value);
        console.log(this.changes.selectedSDGImpact);
        break;
      }
      case("outcomes"):{
        this.data.outcomes = value;
        this.changes.outcomes = this.outcomeArraysDiffer(this.initialData.outcomes, value);
        break;
      }
      default: {
        console.log("UNKNOWN KEY " + key);
        break;
      }
    }

    this.evaluateChange();
    this.parent.readDataUpdateValue();
  }

  private evaluateChange() {
    if (this.changes.isPublic ||
      this.changes.isPublished ||
      this.changes.name ||
      this.changes.description ||
      this.changes.logo ||
      this.changes.focalQuestion ||
      this.changes.locationState ||
      this.changes.selectedTax ||
      this.changes.selectedDTs ||
      this.changes.selectedSDGs ||
      this.changes.newlyCreatedStakeholders ||
      this.changes.selectedExistingStakeholders ||
      this.changes.entities ||
      this.changes.connections ||
      this.changes.locationState ||
      this.changes.activities ||
      this.changes.activityIdsToBeDeleted ||
      this.changes.outcomes ||
      this.changes.activityIdsToBeDeleted ||
      this.changes.selectedSDGImpact
    ) {
      this.dataHaveChanged = true;
    }
    else {
      this.dataHaveChanged = false;
    }
  }

  private SDGImpactDiff(a:{[key:string]: SDGImpactNode},b:{[key:string]: SDGImpactNode}  ){
    let k1 = Object.keys(a);
    let k2 = Object.keys(b);
    if(k1.length !== k2.length) return true;
    let sort = (a:string,b:string)=>{
      return parseInt(a) - parseInt(b);
    };
    k1 = k1.sort(sort);
    k2 = k2.sort(sort);

    for(let i = 0;i<k1.length;i++){
      if(k1[i] !== k2[i]) return true;
      //check per node
      let res = this.SDGImpactNodeDiff(a[k1[i]], b[k1[i]]);
      if(res) return true;
    }


    return false;
  }

  private SDGImpactNodeDiff(a:SDGImpactNode,b:SDGImpactNode){
    if(a.currentlyPositive !== b.currentlyPositive) return true;
    if(a.futurePositive !== b.futurePositive) return true;

    if(a.futureImpactDescription === null && b.futureImpactDescription !== null) return true;
    if(a.futureImpactDescription !== null && b.futureImpactDescription === null) return true;
    if(a.futureImpactDescription !== null && b.futureImpactDescription !== null && a.futureImpactDescription.trim() !== b.futureImpactDescription.trim()) return true;

    if(a.impactDescription === null && b.impactDescription !== null) return true;
    if(a.impactDescription !== null && b.impactDescription === null) return true;
    if(a.impactDescription !== null && b.impactDescription !== null && a.impactDescription.trim() !== b.impactDescription.trim()) return true;

    return false;
  }


  private arrayOfNumbersDiff(a:number[],b:number[]){
    if(a === undefined){
      a = [];
    }
    if(b === undefined){
      b = [];
    }
    if(a.length !== b.length) return true;
    let sort = (a:number,b:number)=>{
      return a - b;
    };

    a = a.sort(sort);
    b = b.sort(sort);
    for(let i = 0;i<a.length;i++){
      if(a[i] !== b[i]) return true;
    }
    return false;
  }

  private newlyCreatedStakeholderListDiffers(l1: LLStakeholder[] | undefined, l2: LLStakeholder[]): boolean {
    if (l1 === undefined) {
      l1 = [];
    }
    if (l2 === undefined) {
      l2 = [];
    }
    /*      console.log(l1);
          console.log(l2);
      */
    if (l1.length !== l2.length) return true;
    for (let i = 0; i < l1.length; i++) {
      //       console.log(l1[i]);
      let s = l1[i];
      let name = s.name.trim();
      let description = s.description === null ? "" : s.description.trim();
      let link = s.link?.trim() ?? "";
      let role = s.role;
      for (let j = 0; j < l2.length; j++) {
        let s2 = l2[j];
        let otherName = s2.name.trim();
        let otherDescription = s2.description === null ? "" : s2.description.trim();
        let otherLink = s2.link?.trim() ?? "";
        let otherRole = s2.role;
        if (name === otherName) {
          /*                  console.log(description);
                            console.log(otherDescription);*/

          if (description !== otherDescription) {
            return true;
          }
          if (link !== otherLink) {
            return true;
          }
          if (role !== null && otherRole !== null) {
            if (role.id !== otherRole.id) {
              return true;
            }
          }
          if (role === null && otherRole !== null) return true;
          if (role !== null && otherRole === null) return true;
          break;
        }
      }
    }
    return false;
  }

  private existingStakeholderListDiffers(l1: LLStakeholder[] | undefined, l2: LLStakeholder[]): boolean {
    if (l1 === undefined) {
      l1 = [];
    }
    if (l2 === undefined) {
      l2 = [];
    }
    if (l1.length !== l2.length) return true;
    for (let i = 0; i < l1.length; i++) {
      let s = l1[i];
      let id = s.id;
      let other: any = null;
      for (let j = 0; j < l2.length; j++) {
        if (l2[j].id === id) {
          other = l2[j];
          break;
        }
      }
      if (other) {

        if (s.name !== other.name || s.description !== other.description) return true;
        if ((s.link ?? "") !== (other.link?.trim() ?? "")) return true;
        if (s.role === null && other.role !== null) return true;
        if (s.role !== null && other.role === null) return true;
        if (s.role !== null && other.role !== null) {
          if (s.role.id !== other.role.id) return true;
        }
        if (s.usesGlobalDescription !== other.usesGlobalDescription) return true;

      }
      else{
        //wasnt found
        return true;
      }
    }
    return false;
  }


  private taxIsEmpty(tax: any): boolean {
    let keys = Object.keys(tax);
    for (let i = 0; i < keys.length; i++) {
      let k1 = Object.keys(tax[keys[i]]);
      if (k1.length === 0) continue;
      return false;
    }
    return true;
  }


  private arrayDiffers(c1: any, c2: any) {
    if (c1 === undefined && c2 === undefined) {
      return false;
    }
    if (c1 !== undefined && c2 === undefined) {
      if (c1.length === 0) {
        return false;
      }
    }
    if (c2 !== undefined && c1 === undefined) {
      if (c2.length === 0) {
        return false;
      }
    }
    return this.attributesDiffer(c1, c2);

  }

  private taxDiffer(tax1: { [id: string]: { [id: string]: boolean; } }, tax2: { [id: string]: { [id: string]: boolean; } }) {
    if (tax1 === undefined && tax2 === undefined) return false;
    if (tax1 === undefined && tax2 !== undefined) {
      /*      console.log(tax2);
            console.log("Tax is empty 2 " +this.taxIsEmpty(tax2));*/
      return true;
    }

    if (tax2 === undefined && tax1 !== undefined) {
      /*      console.log(tax1);
            console.log("Tax is empty 1 " +this.taxIsEmpty(tax1));*/
      return true;
    }
    let t1 = JSON.stringify(tax1);
    let t2 = JSON.stringify(tax2);

    let T1 = JSON.parse(t1);
    let T2 = JSON.parse(t2);

    let keys1 = Object.keys(T1);
    let keys2 = Object.keys(T2);
    if (keys1.length !== keys2.length) return true;
    for (let i = 0; i < keys1.length; i++) {
      let k = keys1[i];
      if (keys2.indexOf(k) === -1) return true;
    }

    for (let i = 0; i < keys1.length; i++) {
      let k = keys1[i];
      let keys1SecondLevel = Object.keys(T1[k]);
      let keys2SecondLevel = Object.keys(T2[k]);

      if (keys1SecondLevel.length !== keys2SecondLevel.length) return true;
      for (let j = 0; j < keys1SecondLevel.length; j++) {
        if (keys2SecondLevel.indexOf(keys1SecondLevel[j]) === -1) return true;
      }
      for (let j = 0; j < keys1SecondLevel.length; j++) {
        if (tax1[k][keys1SecondLevel[j]] !== tax2[k][keys1SecondLevel[j]]) return true;
      }
    }
    return false;
  }


  private locationsDiffer(locationState1: any, locationState2: any): boolean {
    //console.log("loc diff 1");
    if (locationState1 === locationState2) {
      return false;
    }
    /*
    * Special handling for when ll initial data has undefined location state
    * and ll current data have latestSelection.locationChoice === ""
    * and/or latestSelection.data === null
    * which is equivalent to null/undefined location state
    * */
    //    console.log("loc diff 2");

    if (!locationState1 &&
      (locationState2?.latestSelection?.locationChoice === "" || !locationState2?.latestSelection?.data)
    ) {
      return false;
    }
    //      console.log("loc diff 3");

    if (!locationState2 &&
      (locationState1?.latestSelection?.locationChoice === "" || !locationState1?.latestSelection?.data)
    ) {
      return false;
    }
    if(locationState1 && locationState2 && locationState1.locationChoice === -1 && locationState2.locationChoice === -1){
      return false;
    }
    /*        console.log("loc diff 4 "+locationState1?.latestSelection?.locationChoice + " "+locationState2?.latestSelection?.locationChoice);
    console.log(locationState1?.latestSelection?.locationChoice !== locationState2?.latestSelection?.locationChoice);*/
    // 1. If location choices differ, then return true
    // 2. else if selectedResult ids differ, then return true
    // 3. else if choice is userdefinedlocation but texts (latestSelection.data) differ, then return true
    return locationState1?.latestSelection?.locationChoice !== locationState2?.latestSelection?.locationChoice
      || locationState1?.latestSelection?.data?.id !== locationState2?.latestSelection?.data?.id
      || (locationState1?.latestSelection?.locationChoice === 'userdefinedlocation'
        && locationState1?.latestSelection.data !== locationState2?.latestSelection.data) ||
      (locationState1?.latestSelection?.locationChoice === 'gps' && locationState2?.latestSelection?.locationChoice === 'gps' && this.gpsDiffer(locationState1.latestSelection.data, locationState2.latestSelection.data));
  }

  private gpsDiffer(l1: any, l2: any): boolean {
    /*        console.log("gps differ");
            console.log(l1.lat !== l2.lat || l1.lng !== l2.lng);
            console.log(JSON.stringify(l1));
            console.log(JSON.stringify(l2));
            */

    return (l1.lat !== l2.lat || l1.lng !== l2.lng)
  }


  private activityArraysDiffer(A1: Activity[], A2: Activity[]): boolean {
    // Set empty list if null, and sort by id
    A1 = A1 ? [...A1].sort((a: Activity, b: Activity) => (a.id ?? 0) - (b.id ?? 0)) : [];
    A2 = A2 ? [...A2].sort((a: Activity, b: Activity) => (a.id ?? 0) - (b.id ?? 0)) : [];
    if (A1.length !== A2.length) {
      return true;
    }
    for (let i = 0; i < A1.length; i++) {
      if (this.activitiesDiffer(A1[i], A2[i])) {
        return true;
      }
    }
    return false;
  }


  private activitiesDiffer(a1: Activity, a2: Activity): boolean {
    // console.log('activitiesDiffer');
    // console.log(a1);
    // console.log(a2);

    if (a1 === a2) {
      return false;
    }

    if (!a1 || !a2) {
      return true;
    }

    return a1.id !== a2.id
      || a1.livingLabId !== a2.livingLabId
      || a1.livingLabName !== a2.livingLabName
      || a1.title !== a2.title
      || a1.objective !== a2.objective
      || this.attributesDiffer(a1.activityType, a2.activityType)
      || a1.dateFrom !== a2.dateFrom
      || a1.dateTo !== a2.dateTo
      || this.attributesDiffer(a1.timezone, a2.timezone)
      || a1.location?.id !== a2.location?.id
      || a1.location?.text !== a2.location?.text
      || a1.venue !== a2.venue
      || a1.link !== a2.link
      || this.attributesDiffer(a1.activityFormat, a2.activityFormat)
      || this.attributesDiffer(a1.language, a2.language)
      || a1.agendaWrapper && a1.agendaWrapper.content && !(a1.agendaWrapper.content as string)?.startsWith('http')
      || a2.agendaWrapper && a2.agendaWrapper.content && !(a2.agendaWrapper.content as string)?.startsWith('http')
      || a1.agendaDelete || a2.agendaDelete
      || a1.mainPhotoWrapper && a1.mainPhotoWrapper.content && !(a1.mainPhotoWrapper.content as string)?.startsWith('http')
      || a2.mainPhotoWrapper && a2.mainPhotoWrapper.content && !(a2.mainPhotoWrapper.content as string)?.startsWith('http')
      || a1.newPhotosWrappers?.length > 0 || a2.newPhotosWrappers?.length > 0
      || a1.mainPhotoDelete || a2.mainPhotoDelete
      || a1.oldPhotosUrlsToBeDeleted?.length > 0 || a2.oldPhotosUrlsToBeDeleted?.length > 0
      || a1.newFiles?.length > 0 || a2.newFiles?.length > 0
      || a1.oldFilesModified?.length > 0 || a2.oldFilesModified?.length > 0
      || a1.oldFileIdsToBeDeleted?.length > 0 || a2.oldFileIdsToBeDeleted?.length > 0
      || a1.newActivityParticipants?.length > 0 || a2.newActivityParticipants?.length > 0
      || a1.oldActivityParticipantsModified?.length > 0 || a2.oldActivityParticipantsModified?.length > 0
      || a1.oldActivityParticipantIdsToBeDeleted?.length > 0 || a2.oldActivityParticipantIdsToBeDeleted?.length > 0
      || a1.outcome !== a2.outcome
      || a1.onlyForMembers !== a2.onlyForMembers
      ;
  }

  private outcomeArraysDiffer(A1: Outcome[], A2: Outcome[]): boolean {
    // Set empty list if null, and sort by id
    A1 = A1 ? [...A1].sort((a: Outcome, b: Outcome) => (a.id ?? 0) - (b.id ?? 0)) : [];
    A2 = A2 ? [...A2].sort((a: Outcome, b: Outcome) => (a.id ?? 0) - (b.id ?? 0)) : [];
    if (A1.length !== A2.length) {
      return true;
    }
    for (let i = 0; i < A1.length; i++) {
      if (this.outcomesDiffer(A1[i], A2[i])) {
        return true;
      }
    }
    return false;
  }


  private outcomesDiffer(o1: Outcome, o2: Outcome): boolean {
    if (o1 === o2) {
      return false;
    }
    if (!o1 || !o2) {
      return true;
    }
    return o1.id !== o2.id
      || o1.livingLabId !== o2.livingLabId
      || o1.title != o2.title
      || o1.description != o2.description
      || this.outcomeTagArraysDiffer(o1.outcomeTags, o2.outcomeTags)
      || this.arraysDiffer(o1.assetResourceDetails, o2.assetResourceDetails, this.assetResourceDetailsDiffer)
      ;
  }


  private arraysDiffer(A1: any[], A2: any[], elementsDiffer: (e1: any, e2: any) => boolean): boolean {
    // Set empty list if null, and sort by id
    A1 = A1 ? [...A1].sort((a: Outcome, b: Outcome) => (a.id ?? 0) - (b.id ?? 0)) : [];
    A2 = A2 ? [...A2].sort((a: Outcome, b: Outcome) => (a.id ?? 0) - (b.id ?? 0)) : [];
    if (A1.length !== A2.length) {
      return true;
    }
    for (let i = 0; i < A1.length; i++) {
      if (elementsDiffer(A1[i], A2[i])) {
        return true;
      }
    }
    return false;
  }

  private assetResourceDetailsDiffer(a1: AssetResourceDetails, a2: AssetResourceDetails): boolean {
    if (a1 === a2) {
      return false;
    }
    if (!a1 || !a2) {
      return true;
    }
    return a1.id != a2.id
      || a1.title != a2.title
      || a1.description != a2.description
      || a1.assetResourceType?.id != a2.assetResourceType?.id
      || a1.fileWrapper.content != a2.fileWrapper.content;
  }

  private outcomeTagArraysDiffer(A1: OutcomeTag[] | undefined, A2: OutcomeTag[] | undefined): boolean {
    // Set empty list if null, and sort by id
    A1 = A1 ? [...A1].sort((a: OutcomeTag, b: OutcomeTag) => (a.id ?? 0) - (b.id ?? 0)) : [];
    A2 = A2 ? [...A2].sort((a: OutcomeTag, b: OutcomeTag) => (a.id ?? 0) - (b.id ?? 0)) : [];
    if (A1.length !== A2.length) {
      return true;
    }
    for (let i = 0; i < A1.length; i++) {
      if (this.outcomeTagsDiffer(A1[i], A2[i])) {
        return true;
      }
    }
    return false;
  }


  private outcomeTagsDiffer(ot1: OutcomeTag, ot2: OutcomeTag): boolean {
    if (ot1 === ot2) {
      return false;
    }
    if (!ot1 || !ot2) {
      return true;
    }
    return ot1.id !== ot2.id || ot1.name !== ot2.name;
  }


  private attributesDiffer(a1: any, a2: any) {
    // console.log('attributesDiffer');
    // console.log(a1);
    // console.log(a2);
    return JSON.stringify(a1) !== JSON.stringify(a2);
  }

  private selectionDiffers(s1: any, s2: any) {
    if (s1 === undefined) {
      s1 = {};
    }
    if (s2 === undefined) {
      s2 = {};
    }
    //clean false keys
    let keys = Object.keys(s1);
    for (let i = 0; i < keys.length; i++) {
      if (s1[keys[i]] === false) {
        delete s1[keys[i]];
      }
    }
    keys = Object.keys(s2);
    for (let i = 0; i < keys.length; i++) {
      if (s2[keys[i]] === false) {
        delete s2[keys[i]];
      }
    }

    return this.attributesDiffer(s1, s2);

  }

  private connectionsDiffer(c1: SCPConnection[], c2: SCPConnection[]) {
    if (c1 === undefined && c2 === undefined) return false;
    if (c1 === undefined && c2 !== undefined && c2.length === 0) return false;
    if (c1 !== undefined && c2 === undefined && c1.length === 0) return false;

    if (c1.length !== c2.length) return true;
    for (let i = 0; i < c1.length; i++) {
      if (this.connectionDiffers(c1[i], c2[i])) return true;
    }
    return false;
  }
  private connectionDiffers(c1: SCPConnection, c2: SCPConnection) {
    return c1.description !== c2.description || this.llSCPEntityDiffer(c1.source, c2.source) || this.llSCPEntityDiffer(c1.dest, c2.dest);
  }

  private llSCPEntityDiffer(e1: LLSCPEntity | null, e2: LLSCPEntity | null): boolean {
    if (e1 === null && e2 === null) return false;
    if (e1 !== null && e2 === null) return true;
    if (e1 === null && e2 !== null) return true;
    if (e1 !== null && e2 !== null) {
      return e1.description.trim() !== e2.description.trim() || e1.groupId !== e2.groupId || e1.name.trim() !== e2.name.trim() ||
        e1.id !== e2.id || e1.labelId !== e2.labelId;
    }
    return true;
  }

  private entitiesDiffer(e1: { [id: string]: LLSCPEntity[] }, e2: { [id: string]: LLSCPEntity[] }): boolean {

    if (e1 === undefined) {
      e1 = { 1: [], 2: [], 3: [] };
    }
    if (e2 === undefined) {
      e2 = { 1: [], 2: [], 3: [] };
    }
    console.log("ENTITY DIFF")
          console.log(e1);
          console.log(e1);

    let k1 = Object.keys(e1);
    let k2 = Object.keys(e2);

    if (k1.length !== k2.length) return true;
    for (let i = 0; i < k1.length; i++) {
      if (k1[i] !== k2[i]) return true;
    }

    let allNodesFirst: { [id: number]: LLSCPEntity } = {};
    let allNodesSecond: { [id: number]: LLSCPEntity } = {};

    for (let i = 0; i < k1.length; i++) {
      let k = k1[i];
      let first = e1[k];
      let second = e2[k];
      if (first.length !== second.length) return true;
      for (let j = 0; j < first.length; j++) {
        allNodesFirst[first[j].id] = first[j];
        allNodesSecond[second[j].id] = second[j];
      }
      /*          for(let j = 0;j<first.length;j++){
                    let a = first[j];
                    let b = second[j];
                    if(a.description.trim() !== b.description.trim() || a.groupId !== b.groupId || a.name.trim() !== b.name.trim() || a.id !== b.id || a.labelId !== b.labelId){
                      return true;
                    }
                }*/
    }
    /*      console.log(allNodesFirst);
          console.log(allNodesSecond);*/

    let keys = Object.keys(allNodesFirst);
    for (let i = 0; i < keys.length; i++) {
      let k = parseInt(keys[i]);
      let a = allNodesFirst[k];
      if (!allNodesSecond[k]) {
        //console.log("Key wasnt found " + k);
        /*          console.log(allNodesFirst);
              console.log(allNodesSecond);*/
        return true;
      }

      let b = allNodesSecond[k];

      if (a.description.trim() !== b.description.trim() || a.groupId !== b.groupId || a.name.trim() !== b.name.trim() || a.id !== b.id || a.labelId !== b.labelId
      || a.usesGlobalDescription !== b.usesGlobalDescription
      ) {
        return true;
      }
    }

    return false;
  }


  getLivingLabId():number{
    return this.data.livingLabId;
  }

  getName():string{
    return this.data.name;
  }

  getFocalQuestion():string{
    return this.data.focalQuestion;
  }

  getDescription():string{
    return this.data.description;
  }

  getLogo():string{
    return this.data.logo;
  }

  getLocationState(): LocationState{
    return this.data.locationState;
  }

  getSelectedDTs(): { [id: string] : boolean; }{
    return this.data.selectedDTs;
  }

  getSelectedSDGs(): { [id: string] : boolean; }{
    return this.data.selectedSDGs;
  }

  getSelectedSDGImpactNode(): { [id: string] : SDGImpactNode; }{
    return this.data.selectedSDGImpact;
  }


  getSelectedTax(): { [id: string] : { [id: string] : boolean; }; }{
    return this.data.selectedTax;
  }

  getSelectedExistingStakeholders(): LLStakeholder[]{
    return this.data.selectedExistingStakeholders;
  }

  getNewlyCreatedStakeholders(): LLStakeholder[]{
    return this.data.newlyCreatedStakeholders === undefined ? [] : this.data.newlyCreatedStakeholders;
  }

  getEntities(): { [id: string] : LLSCPEntity[]; }{
    return this.data.entities;
  }

  getConnections(): SCPConnection[]{
    return this.data.connections;
  }

  getActivities(): Activity[]{
    return this.data.activities;
  }

  getActivityIdsToBeDeleted(): number[]{
    return this.data.activityIdsToBeDeleted;
  }

  getIsPublic(): boolean{
    return this.data.isPublic === undefined ? false : this.data.isPublic;
  }
  getIsPublished(): boolean{
    return this.data.isPublished === undefined ? false : this.data.isPublished;
  }

  canPublish(){
    return !(this.data.name.trim() === "" ||
    this.data.description.trim() === "" ||
    this.data.focalQuestion.trim() === "" ||
    this.data.locationState.locationChoice === -1 ||
   Object.keys(  this.data.selectedSDGs ).length === 0);
  }

  getOutcomes(): Outcome[]{
    return this.data.outcomes;
  }
};
