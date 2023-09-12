import {AfterViewInit, Component, EventEmitter, Input, OnDestroy, ViewChild} from "@angular/core";
import { FormControl } from "@angular/forms";
import { DynamicView } from "src/app/ComponentLibrary/dynamic-view";
import { LocationService } from "src/app/Service/location.service";
import { ParentComponent } from "../../Admin/LivingLabEntityManagement/parent-component";
import * as L from 'leaflet';
import { environment } from "src/environments/environment";
import html2canvas from "html2canvas";
import { ScreenshotService } from "src/app/Service/screenshot.service";
import {ChildComponent} from "../../Admin/LivingLabEntityManagement/child-component";
import {Marker} from "leaflet";
import {MatAutocompleteTrigger} from "@angular/material/autocomplete";
import { ScreenshotCapturer } from "src/app/Models/ScreenshotCapturer";

export interface Country {
  id: number;
  name: string;
}

export interface City {
  id: number;
  name: string;
  country: Country;
  countryName: string;
  countryId: number;
}

export interface MapConfig {
  center: L.LatLng;
  zoom: number;
  currentMarker: L.Marker | undefined;
  maxZoom: number;
  minZoom: number;
}


export interface LocationSelection{
  locationChoice:string;
  data: {lat:number, lng:number, screenshot: string } | City | Country | string | null;
  lat?: number;
  lng?: number;
  zoom?: number;
}

export interface LocationState {
  locationChoice: number;
  citySearchString: string;
  countrySearchString: string;
  userdefinedlocation: string;
  locationSelection: City | Country | null;
  currentConfig: MapConfig;
  latestSelection:LocationSelection;
  initializeInUpdateMode?: boolean;
}


@Component({
  selector: 'll-location',
  templateUrl: './ll-location.component.html',
  styleUrls: ['../ll-creation.component.css', '../LLGeneralInformation/ll-general-info.component.css', '../../../style/ll-location.css'],
})

export class LLLocationComponent implements OnDestroy, AfterViewInit, ChildComponent, DynamicView {
  title = "Living Lab Location*";
  ready: boolean = false;
  locationChoice: number = -1;
  citySearchString: string = "";
  mapScreenshot: string = "mapScreenshot";
  maxZoom = 19;
  minZoom = 1;
  countrySearchString: string = "";
  public readonly htmlLabel: string = environment.env.llLocation.htmlLabel;
  fetchReady = false;
  cityControl = new FormControl('');
  countryControl = new FormControl('');
  filteredCityOptions: City[] = [];
  filteredCountryOptions: Country[] = [];
  userDefinedLocation = "";
  locationSelection: City | Country | null = null;
  latestSelection: any = {};
  mapRendered = false;
  icon = {
    icon: L.icon({
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      // specify the path here
      iconUrl: environment.env.llLocation.pinMap.iconUrl,
      shadowUrl: environment.env.llLocation.pinMap.shadowUrl
    })
  };

  screenshotCapturer:ScreenshotCapturer|null = null;

  map: L.Map | undefined;
  parent: ParentComponent | null = null;
  marker: L.Marker | undefined;

  currentConfig: MapConfig = {
    center: new L.LatLng(environment.env.llLocation.mapCentering.lat, environment.env.llLocation.mapCentering.lng),
    zoom: 3,
    currentMarker: undefined,
    maxZoom: this.maxZoom,
    minZoom: this.minZoom
  };

  static defaultConfig: MapConfig = {
    center: new L.LatLng(environment.env.llLocation.mapCentering.lat, environment.env.llLocation.mapCentering.lng),
    zoom: 3,
    currentMarker: undefined,
    maxZoom: 19,
    minZoom: 1
  };

  searchTerm: string | null = null;
  searchTermEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
  searchTimer: NodeJS.Timeout | undefined;
  searchTimeoutInterval = 300;   /** Wait 300 milliseconds before actually searching for what the user typed */
  searchResults: any[] = [];
  selectedResult: any;
  showHint = false;
  forceSearch = false;
  preventSearch = false;


  @Input() set setScreenshotCapturer(sc:ScreenshotCapturer){
      this.screenshotCapturer = sc;    
  }

  @ViewChild(MatAutocompleteTrigger) autocomplete: MatAutocompleteTrigger | undefined;



  constructor(private service: LocationService, private screenshotService:ScreenshotService) {

    // Subscribe to event emitter that emits each time user types something in location search field
    this.searchTermEvent.subscribe(
      () => {
        // First, removed already selected location, if exists
        this.selectedResult = null;

        // If previous marker existed, remove it
        if (this.map && this.marker) {
          this.map.removeLayer(this.marker);
        }
        this.currentConfig.currentMarker = undefined;

        // Then make the call for dropdown options
        this.service.search(this.searchTerm ?? '').subscribe(
          response => {
            this.searchResults = response.data;
          }
        );
      }
    );
  }



  ngOnInit() {}



  public ngAfterViewInit(): void {
    if (!this.mapRendered) {
      this.map?.remove();
      this.renderMap();
    }
  }



  ngOnDestroy(): void {
    //this.save();
  }



  public initialize(parent: ParentComponent): void {
    this.parent = parent;
    this.parent.setChangeAwareChild(this);

    const data = this.parent?.getSharedDataContainer();

    if (data === undefined) {
      this.ready = true;
      return;
    }
    let state: LocationState = data.getLocationState();//data["locationState"];
    //console.log(JSON.stringify(state));
    if (state === undefined || state === null) {
      this.ready = true;
      return;

    }
    // If initializing in living lab update mode
    if (state.initializeInUpdateMode) {

      let latestSelection = state.latestSelection;
      switch (latestSelection.locationChoice) {
        case 'city':
          this.searchTerm = (latestSelection.data as City)?.name + ', ' + (latestSelection.data as City)?.countryName;
          this.selectedResult = {
            id: (latestSelection.data as City)?.id,
            text: this.searchTerm,
            locationTypeId: 1,
          };
          break;

        case 'country':
          this.searchTerm = (latestSelection.data as Country)?.name;
          this.selectedResult = {
            id: (latestSelection.data as Country)?.id,
            text: this.searchTerm,
            locationTypeId: 2,
          };
          break;

        case 'userdefinedlocation':
          this.searchTerm = latestSelection.data as string;
          this.selectedResult = undefined;
          break;

        case 'gps':
          this.searchTerm = null;
          this.selectedResult = undefined;
          break;
      }

      if (latestSelection.locationChoice === 'gps' && latestSelection.data) {
        let gps:any = latestSelection.data;
     
        this.currentConfig = {
 
          center: new L.LatLng(gps.lat, gps.lng),
          zoom: latestSelection.zoom ?? 3,
          currentMarker: new Marker(new L.LatLng(gps.lat ?? 0, gps.lng ?? 0)),
          maxZoom: this.maxZoom,
          minZoom: this.minZoom
        };
      }
      else {
        if(latestSelection.locationChoice === "userdefinedlocation"){
        this.currentConfig = {
          center: new L.LatLng(0, 0),
          zoom: 3,
          currentMarker: undefined,
          maxZoom: this.maxZoom,
          minZoom: this.minZoom
        };
      }
      else{
        let gps:any = latestSelection.data;
        if(gps === undefined){
          gps = {lat:0,lng:0};
        }
        this.currentConfig = {
          center: new L.LatLng(gps.lat ?? 0, gps.lng ?? 0),
          zoom: latestSelection.zoom ?? 3,
          currentMarker: new Marker(new L.LatLng(gps.lat ?? 0, gps.lng ?? 0)),
          maxZoom: this.maxZoom,
          minZoom: this.minZoom
        };

      }
      }

//      state.initializeInUpdateMode = tr;
    }

    // If initializing from tab change
    else {

      switch (state.locationChoice) {
        case 0:
          this.searchTerm = null;
          this.selectedResult = undefined;
          break;
        case 1:
          // @ts-ignore
          this.searchTerm = state.locationSelection?.name + ', ' + state.locationSelection?.countryName;
          this.selectedResult = {
            id: state.locationSelection?.id,
            text: this.searchTerm,
            locationTypeId: 1,
          };
          break;
        case 2:
          this.searchTerm = state.locationSelection?.name ?? '';
          this.selectedResult = {
            id: state.locationSelection?.id,
            text: this.searchTerm,
            locationTypeId: 2,
          };
          break;
        case 3:
          this.searchTerm = state.userdefinedlocation;
          this.selectedResult = undefined;
          break;
      }

      this.currentConfig = state.currentConfig;

    }

    /*
    this.locationChoice = state.locationChoice;
    this.citySearchString = state.citySearchString;
    this.countrySearchString = state.countrySearchString;
    this.userDefinedLocation = state.userdefinedlocation;
    this.currentConfig = state.currentConfig;
    this.locationSelection = state.locationSelection;

    if (this.citySearchString !== "") {
        this.cityControl.setValue(this.citySearchString);
    }

    if (this.countrySearchString !== "") {
        this.countryControl.setValue(this.countrySearchString);
    }
    */

    this.ready = true;
  }



  save(): boolean{


    /*
    e.g.
    selectedResult: {
      "id": 29,
      "latitude": 72,
      "longitude": -40,
      "text": "Greenland",
      "locationTypeId": 2,
      "locationTypeName": "Country"
    }
    */

    this.storeMapConfig();

    // Set location choice
    if (this.selectedResult) {

      this.locationChoice = this.selectedResult.locationTypeId;

      // case: City
      if (this.selectedResult.locationTypeId === 1) {
        this.citySearchString = this.selectedResult.text.split(',')[0];

        this.locationSelection = {
          id: this.selectedResult.id,
          name: this.selectedResult.text.split(',')[0],
          countryName: this.selectedResult.text.split(', ')[1],
          countryId: -1
        };

        this.latestSelection = {
          locationChoice: 'city',
          data: this.locationSelection
        };
      }

      // case: Country
      else if (this.selectedResult.locationTypeId === 2) {
        this.countrySearchString = this.selectedResult.text;

        this.locationSelection = {
          id: this.selectedResult.id,
          name: this.selectedResult.text,
        };

        this.latestSelection = {
          locationChoice: 'country',
          data: this.locationSelection
        };
      }
    }

    else {

      // case: User defined
      if (this.searchTerm) {
        this.locationChoice = 3;

        this.userDefinedLocation = this.searchTerm?.trim() ?? '';

        // Set default map position
        this.currentConfig = {
          center: new L.LatLng(environment.env.llLocation.mapCentering.lat, environment.env.llLocation.mapCentering.lng),
          zoom: 3,
          currentMarker: undefined,
          maxZoom: this.maxZoom,
          minZoom: this.minZoom
        };

        this.locationSelection = null;

        this.latestSelection = {
          locationChoice: 'userdefinedlocation',
          data: this.searchTerm
        };
      }

      // case: GPS
      else if (this.currentConfig.currentMarker){
        this.locationChoice = 0;
        this.citySearchString = '';
        this.countrySearchString = '';
        this.userDefinedLocation = '';

        this.locationSelection = null;

        this.latestSelection = {
          locationChoice: 'gps',
          data: {
            lat: this.currentConfig.center.lat,
            lng: this.currentConfig.center.lng,
            zoom: this.map?.getZoom()
          }
        };
      }
    }


    this.parent?.storeValue("locationState",
      {
        locationChoice: this.locationChoice,
        citySearchString: this.citySearchString,
        countrySearchString: this.countrySearchString,
        userdefinedlocation: this.userDefinedLocation,
        currentConfig: this.currentConfig,
        locationSelection: this.locationSelection,
        latestSelection: this.buildLatestSelection()
      } as LocationState);



    return true;
  }



  reset():boolean{
    this.ready = false;
    this.locationChoice = -1;
    this.citySearchString = "";
    this.countrySearchString = "";
    this.fetchReady = false;

    this.cityControl = new FormControl('');
    this.countryControl = new FormControl('');
    this.filteredCityOptions = [];
    this.filteredCountryOptions = [];
    this.userDefinedLocation = "";
    this.locationSelection = null;
    this.mapRendered = false;
    return true;
  }



  public isDirty(): boolean {
    if (this.searchTerm) { return true; }
    if (this.selectedResult) { return true; }
    if(!this.currentConfig){return false;}
    if (this.currentConfig.currentMarker) { return true; }

    return false;
  }



  buildLatestSelection(): LocationSelection | null {

    switch (this.locationChoice) {
      case 0: {
        if (this.currentConfig.currentMarker) {
          let coords = this.currentConfig.currentMarker.getLatLng();
          return {
            locationChoice: "gps",
            data: {
              lat: coords.lat,
              lng: coords.lng,
              screenshot: this.mapScreenshot,
              zoom: this.map?.getZoom()
            }
          } as LocationSelection;
        }
        else {
          return { locationChoice: "", data: null } as LocationSelection;
        }
      }
      case 1: {
        return { locationChoice: "city", data: this.locationSelection } as LocationSelection;
      }
      case 2: {
        return { locationChoice: "country", data: this.locationSelection } as LocationSelection;
      }
      case 3: {
        return { locationChoice: "userdefinedlocation", data: this.userDefinedLocation } as LocationSelection;
      }
    }
    return { locationChoice: "", data: null } as LocationSelection;
  }



  createMarker(e: L.LeafletMouseEvent): void {
    if (this.map) {

      if (this.currentConfig.currentMarker !== undefined) {

        let coords: L.LatLng = this.currentConfig.currentMarker.getLatLng();

        //the user clicked at the exact same spot that there is the current marker, maybe he does not need it anymore
        if (e.latlng.lat === coords.lat && e.latlng.lng === coords.lng) {

          this.clear();

          return;
        }

      }

      // If previous marker existed, remove it
      if (this.marker) {
        this.map.removeLayer(this.marker);
      }
      // Create new marker
      this.marker = L.marker([e.latlng.lat, e.latlng.lng], this.icon);

      // And handle currentConfig.currentMarker
      if (this.currentConfig.currentMarker !== undefined) {
        this.currentConfig.currentMarker.removeFrom(this.map);
      }

      this.marker.addTo(this.map);
      this.currentConfig.currentMarker = this.marker;
    }
  }




  private captureMapScreenshot() {

    let inst = this;
    this.screenshotCapturer?.onScreenshotLoad();
    return new Promise(async (resolve, reject) => {
      let e = document.getElementById(this.htmlLabel);
      /*console.log(e)*/
      if (e) {
        var html2canvasstartTime = performance.now()
        html2canvas(e, {
          allowTaint: true,
          scale: 3,
          useCORS: true,
          logging : false,
          width:600,
          height: 600
        }).
        then(canvas => {
          var html2canvasendTime = performance.now();
          console.log(`Call to the html2canvas took ${html2canvasendTime - html2canvasstartTime} milliseconds`)
          var startTime = performance.now()
          var imgData = canvas.toDataURL("image/png");
          // inst.mapScreenshot = imgData;
          this.screenshotCapturer?.screenshotReady();
          inst.screenshotService.add(inst.mapScreenshot, imgData);
          var endTime = performance.now()
          console.log(`Call to then block took ${endTime - startTime} milliseconds`)
        });
      }
    });
  }



  createMarkerFromCoords(c: L.LatLng): void {
    if (this.map) {
      // If previous marker existed, remove it
      if (this.marker) {
        this.map.removeLayer(this.marker);
      }
      this.marker = L.marker([c.lat, c.lng], this.icon);
      this.marker.addTo(this.map);
      this.map.panTo(this.marker.getLatLng());
      this.currentConfig.currentMarker = this.marker;
    }
  }



  createMap(): L.Map {
    const map = L.map(this.htmlLabel, {
      center: this.currentConfig.center,
      zoom: this.currentConfig.zoom
    });

    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: this.currentConfig.maxZoom,
      minZoom: this.currentConfig.minZoom,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    let inst = this;
    map.on('click', e => {
      inst.createMarker(e);
      inst.searchTerm = null;
      inst.selectedResult = null;
      return;
    });


    map.on("layeradd",e=>{
      //console.log("layeradd");

//            console.log(inst.mapRendered)
      if(inst.mapRendered){
        //make a screenshot
        setTimeout(()=>{
          inst.captureMapScreenshot();
          inst.save();
        },100);
      }
    });
    tiles.addTo(map);
    return map;

  }



  renderMap() {
    this.map = this.createMap();
    // if another map was renderered previously, we need to check if there was a marker attached to it
    if (this.currentConfig.currentMarker !== undefined) {
      this.createMarkerFromCoords(this.currentConfig.currentMarker.getLatLng());
    }
    /*this.save();*/
    this.mapRendered = true;
  }



  storeMapConfig() {
    if (this.map) {
      this.currentConfig.center = this.map.getCenter();
      this.currentConfig.zoom = this.map.getZoom();
      this.currentConfig.currentMarker = this.marker;
      this.currentConfig.maxZoom = this.map.getMaxZoom();
      this.currentConfig.minZoom = this.map.getMinZoom();
    }
  }



  public search(event: Event): void {

    this.searchTerm = (event.target as HTMLInputElement).value.trim();

    // If a new search term was typed, then force new search
    this.autocomplete?.registerOnChange(value => {
      this.forceSearch = true;
      return {};
    });

    // If options list panel is open, it means $event was triggered by the up and down arrows for scrolling.
    // Except, if forceSearch === true, which means that a new character(s) was typed.
    if (this.autocomplete?.panelOpen && !this.forceSearch) {
      return;
    }

    // Reset for next use
    this.forceSearch = false;

    // If timer was running, cancel it because user typed something new
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }

    /*// Return if search term is the same as the previous one
    if (this.searchTerm === (event.target as HTMLInputElement).value.trim()) {
      return;
    }*/

    // Don't search for terms with less than 3 characters.
    // Also, clear results.
    if (this.searchTerm.length < 3) {
      this.searchResults = [];
      this.showHint = true;
      return;
    }

    this.showHint = false;

    // Wait 'this.filterTimeoutInterval' milliseconds before emitting the signal for the actual filtering
    this.searchTimer = setTimeout(() => this.actualSearch(), this.searchTimeoutInterval);
  }



  // Normally, on keyup event, search gets fired,
  // but when keyup is enter button, it means location was selected from the dropdown,
  // so we don't need to search again
  setPreventSearch(val: boolean): void {
    this.preventSearch = val;
  }



  private actualSearch(): void {

    if (this.preventSearch) {
      this.preventSearch = false;
      this.searchResults = [];
      return;
    }

    // First, removed already selected location, if exists
    this.selectedResult = null;

    // If previous marker existed, remove it
    if (this.map && this.marker) {
      this.map.removeLayer(this.marker);
    }
    this.currentConfig.currentMarker = undefined;
    // Then make the call for dropdown options
    this.service.search(this.searchTerm ?? '').subscribe(
      response => {
        this.searchResults = response.data;
        if(response.data.length === 0){
          this.save();
        }
      });
  }



  public selectLocation(result: any): void {
    this.selectedResult = result;
    this.searchTerm = result.text;
    this.createMarkerFromCoords(new L.LatLng(result.latitude, result.longitude));
    this.save();
  }



  public clear(): void {
    this.selectedResult = undefined;
    this.searchTerm = null;
    this.latestSelection = {};
    this.locationChoice = -1;
    this.searchResults = [];
    if (this.map && this.marker) {
      this.map.removeLayer(this.marker);
    }
    this.marker = undefined;
    this.currentConfig.currentMarker = undefined;
    this.save();
  }



  @Input()
  set setParent(p: ParentComponent) {
    this.parent = p;
    this.initialize(this.parent);
    this.parent.setChangeAwareChild(this);
    this.parent.setComponent(this);
  }

  setDisability(isDisabled: boolean): void {}

}
