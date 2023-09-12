import {Component, EventEmitter, HostListener, Inject, OnInit} from '@angular/core';
import { Activity } from '../Models/Activity';
import {ActivityTypeService} from '../Service/activity-type.service';
import {ErrorResponse} from '../Models/Response/error-response';
import {TimezoneService} from '../Service/timezone.service';
import {ActivityFormatService} from '../Service/activity-format.service';
import {LanguageService} from '../Service/language.service';
import {LocationService} from '../Service/location.service';
import {ActivityParticipant} from '../Models/ActivityParticipant';
import {MatTableDataSource} from '@angular/material/table';
import {ActivatedRoute, Router} from '@angular/router';
import {LivingLabService} from '../Service/living-lab.service';
import {ActivityService} from '../Service/activity.service';
import {AngularServicesProviderService} from '../Service/angular-services-provider.service';
import * as d3 from 'd3';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {forkJoin, of} from 'rxjs';
import {catchError, concatMap} from 'rxjs/operators';
import { formattedHours, formattedMinutes } from '../Utils/TimeDisplayUtils';
import {AssetsService} from '../Service/assets.service';
import {AssetResourceDetails} from '../Models/AssetResourceDetails';
import {DomSanitizer, SafeUrl} from "@angular/platform-browser";



@Component({
  selector: 'app-add-new-activity',
  templateUrl: './add-new-activity.component.html',
  styleUrls: ['./add-new-activity.component.css']
})
export class AddNewActivityComponent implements OnInit {

  ready = false;

  livingLabId = -1;
  livingLabSummary: any;
  livingLabName: string | undefined;

  activity: Activity = {
    mainPhotoWrapper: {},
    agendaWrapper: {},
    photosUrls: [],
    photosWrappers: [],
    oldPhotosUrlsToBeDeleted: [],
    newPhotosWrappers: [],
    activityParticipants: [],
    newActivityParticipants: [],
    oldActivityParticipantsModified: [],
    oldActivityParticipantIdsToBeDeleted: [],
    files: [],
    newFiles: [],
    oldFilesModified: [],
    oldFileIdsToBeDeleted: []
  };

  activityTypes: any[] = [];
  timezones: any[] = [];
  activityFormats: any[] = [];
  languages: any[] = [];

  selectedActivityTypeId: number | undefined;
  selectedTimezoneId: number | undefined;
  selectedActivityFormatId: number | undefined;
  selectedLanguageId: number | undefined;

  selectedDateFrom: Date | undefined;
  selectedDateTo: Date | undefined;
  selectedTimeFrom: string | undefined;
  selectedTimeTo: string | undefined;

  formattedHours = formattedHours;
  formattedMinutes = formattedMinutes;

  locationFilterValue = '';
  filterEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
  filterTimer: NodeJS.Timeout | undefined;
  filterTimeoutInterval = 300;   /** Wait 300 milliseconds before actually searching for what the user typed */
  locationResults: any[] = [];
  locationText: string | null = '';

  materialDisplayedColumns: string[] = ['title', 'description', 'file', 'actions'];
  materialDataSource = new MatTableDataSource<any>(this.activity.files);
  newMaterial: AssetResourceDetails = {
    title: '',
    description: '',
    fileWrapper: {}
  };
  editingMaterialIndex: number | undefined;
  editingMaterial: AssetResourceDetails = {
    title: '',
    description: '',
    fileWrapper: {}
  };

  participantsDisplayedColumns: string[] = ['name', 'surname', 'organization', 'position', 'actions'];
  participantsDataSource = new MatTableDataSource<ActivityParticipant>(this.activity.activityParticipants);
  newParticipant: ActivityParticipant = {
    id: undefined,
    firstname: '',
    lastname: '',
    organization: '',
    position: ''
  };
  editingParticipantIndex: number | undefined;
  editingParticipant: ActivityParticipant = {
    id: undefined,
    firstname: '',
    lastname: '',
    organization: '',
    position: ''
  };

  submitButtonText = 'Create Activity';

  constructor(protected activatedRoute: ActivatedRoute,
              protected router: Router,
              protected livingLabService: LivingLabService,
              protected activityService: ActivityService,
              protected assetsService: AssetsService,
              protected activityTypeService: ActivityTypeService,
              protected timezoneService: TimezoneService,
              protected activityFormatService: ActivityFormatService,
              protected languageService: LanguageService,
              protected locationService: LocationService,
              protected angularServicesProviderService: AngularServicesProviderService,
              protected dialogRef: MatDialogRef<AddNewActivityComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private sanitizer: DomSanitizer
  ) {
    this.livingLabId = this.data.livingLabId;
    this.dialogRef.disableClose = true;
  }



  // Close on escape key
  @HostListener('window:keyup.esc') onKeyUp() {
    this.dialogRef.close();
  }



  ngOnInit(): void {

    console.log('add-new-activity');

    /*
    // TODO: Uncomment
    // Ask for confirmation upon closing tab or browser
    function onBeforeUnload(e: any): void {
      if (true) {
        e.preventDefault();
        e.returnValue = '';
        return;
      }
    }
    window.addEventListener('beforeunload', onBeforeUnload);
    */

    //
    // Ger parameters from url
    //
    of({}).pipe(
      concatMap(() => {

        if (this.livingLabId) {
          console.log('gonna first get living lab id');
          return this.livingLabService.get(this.livingLabId, true);
        }
        else {
          return of(undefined);
        }
      }),

      //
      // Check if user is allowed to view the page
      //
      concatMap((response: any) => {

        if (response) {
          console.log('got living lab summary');
          this.livingLabSummary = response.data;
          this.livingLabName = this.livingLabSummary.name;
        }

        return forkJoin([
          this.activityTypeService.getAll(),
          this.timezoneService.getAll(),
          this.activityFormatService.getAll(),
          this.languageService.getAll()
        ]);

      }),

      //
      // Get constants e.g. activity types, timezones, activity formats, ...
      //
      concatMap((dataAsArray: any[]) => {
        console.log('got constants');
        this.activityTypes = dataAsArray[0].data;
        this.timezones = dataAsArray[1].data;
        this.activityFormats = dataAsArray[2].data;
        this.languages = dataAsArray[3].data;

        // Subscribe to event emitter that emits each time user types something in location search field
        this.filterEvent.subscribe(
          () => {
            this.locationService.search(this.locationFilterValue).subscribe(
              response1 => {
                this.locationResults = response1.data;
              }
            );
          }
        );

        //
        // Set selected fields
        //
        this.setup();

        //
        // Mark ready
        //
        console.log('ready');
        this.ready = true;

        return of({});
      }),

      catchError((err: ErrorResponse) => {
        console.error(err.error.message);
        this.angularServicesProviderService.createModalWithGenericErrorMessage();
        return of({});
      })

    ).subscribe();

  }



  public addNewMainPhoto(fileInputEvent: any): void {
    const selectedMainPhoto = fileInputEvent.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(selectedMainPhoto);
    reader.onload = () => {
      this.activity.mainPhotoWrapper.name = selectedMainPhoto.name;
      this.activity.mainPhotoWrapper.contentType = selectedMainPhoto.type;
      this.activity.mainPhotoWrapper.content = reader.result;
    };
  }



  public removeMainPhoto(): void {
    this.activity.mainPhotoWrapper = {};
  }



  public addNewAgenda(fileInputEvent: any): void {
    const selectedAgenda = fileInputEvent.target.files[0];

    // Create a temp url so the user can download what they just uploaded
    const reader = new FileReader();
    reader.readAsDataURL(selectedAgenda);
    reader.onload = () => {
      this.activity.agendaWrapper.name = selectedAgenda.name;
      this.activity.agendaWrapper.contentType = selectedAgenda.type;
      this.activity.agendaWrapper.content = reader.result;
    };

  }



  public removeAgenda(): void {
    this.activity.agendaWrapper = {};
  }



  public filterLocation(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    const previousLocationFilterValue = this.locationFilterValue;
    this.locationFilterValue = filterValue.trim().toLowerCase();

    // If timer was running, cancel it because user typed something new
    if (this.filterTimer) {
      clearTimeout(this.filterTimer);
    }

    // Don't search for terms with less than 3 characters.
    // Also, clear results.
    if (this.locationFilterValue.length < 3) {
      this.locationResults = [];
      return;
    }

    // If text hasn't changed, do not run search
    if (previousLocationFilterValue === this.locationFilterValue) {
      return;
    }

    // Wait 'this.filterTimeoutInterval' milliseconds before emitting the signal for the actual filtering
    this.filterTimer = setTimeout(() => this.filterEvent.emit(true), this.filterTimeoutInterval);
  }



  // Mark selected location
  selectLocation(location: any): void {
    this.activity.location = location;
  }



  addNewPhoto(fileInputEvent: any): void {

    // Get photo
    const photo = fileInputEvent.target.files[0];

    // Convert it to temp url for it to be displayed
    const reader = new FileReader();
    reader.readAsDataURL(photo);
    reader.onload = () => {
      this.activity.photosWrappers.push({
        name: photo.name,
        contentType: photo.type,
        content: reader.result
      });
    };
  }



  removePhoto(index: number): void {
    this.activity.photosWrappers.splice(index, 1);
  }



  addNewMaterialFile(fileInputEvent: any): void {

    // Get file
    const file = fileInputEvent.target.files[0];
    if (file === undefined || file == null) {
      return;
    }

    // Convert it to temp url for it to be able to be downloaded
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      this.newMaterial.fileWrapper = {
        name: file.name,
        contentType: file.type,
        content: reader.result
      } as any;
    };
  }



  addNewMaterial(): void {

    // Check if all fields are filled
    if (!this.newMaterial.title || this.newMaterial.title.trim().length === 0
      || !this.newMaterial.description || this.newMaterial.description.trim().length === 0
      || !this.newMaterial.fileWrapper?.content
    ) {
      this.angularServicesProviderService.createNewModal().alert(false, 'Must fill all fields in order to add material!');
      return;
    }

    // Add new material
    this.activity.files.push(this.newMaterial);

    // Refresh material list
    this.materialDataSource = new MatTableDataSource<any>(this.activity.files);

    // Reset material to be added
    this.newMaterial = {
      title: '',
      description: '',
      fileWrapper: {}
    };
  }



  removeMaterial(material: any): void {

    this.editingMaterialIndex = undefined;

    // Remove material
    const index = this.activity.files.indexOf(material);
    if (index > -1) { // only splice array when item is found
      this.activity.files.splice(index, 1);
    }

    // Refresh material list
    this.materialDataSource = new MatTableDataSource<any>(this.activity.files);
  }



  editMaterial(i: number): void {
    this.editingMaterialIndex = i;
    this.editingMaterial = this.deepcopy(this.activity.files[i]);
  }



  addEditingMaterialFile(fileInputEvent: any): void {

    // Get file
    const file = fileInputEvent.target.files[0];
    if (file === undefined || file == null) {
      return;
    }

    // Set editing material
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      this.editingMaterial.fileWrapper = {
        name: file.name,
        contentType: file.type,
        content: reader.result
      } as any;
    };
  }



  saveEditingMaterial(): void {
    if (this.editingMaterialIndex === undefined) {
      return;
    }

    // Check if all fields are filled
    if (!this.editingMaterial.title || this.editingMaterial.title.trim().length === 0
      || !this.editingMaterial.description || this.editingMaterial.description.trim().length === 0
      || !this.editingMaterial.fileWrapper.content
    ) {
      this.angularServicesProviderService.createNewModal().alert(false, 'Must fill all fields in order to save material!');
      return;
    }

    // Copy temp editingMaterial to material array
    this.activity.files[this.editingMaterialIndex] = this.deepcopy(this.editingMaterial);

    // And set editing material index to undefined meaning editing is done
    this.editingMaterialIndex = undefined;

    // Refresh participants list
    this.materialDataSource = new MatTableDataSource<any>(this.activity.files);
  }



  addNewParticipant(): void {

    // Check if all fields are filled
    if (!this.newParticipant.firstname || this.newParticipant.firstname.trim().length === 0
      || !this.newParticipant.lastname || this.newParticipant.lastname.trim().length === 0
      || !this.newParticipant.organization || this.newParticipant.organization.trim().length === 0
      || !this.newParticipant.position || this.newParticipant.position.trim().length === 0
    ) {
      this.angularServicesProviderService.createNewModal().alert(false, 'Must fill all fields in order to add participant!');
      return;
    }

    // Add new participant
    this.activity.activityParticipants.push(this.newParticipant);

    // Refresh participants list
    this.participantsDataSource = new MatTableDataSource<ActivityParticipant>(this.activity.activityParticipants);

    // Reset participant to be added
    this.newParticipant = {
      id: undefined,
      firstname: '',
      lastname: '',
      organization: '',
      position: ''
    };
  }



  removeParticipant(activityParticipant: ActivityParticipant): void {

    this.editingParticipantIndex = undefined;

    // Remove participant
    const index = this.activity.activityParticipants.indexOf(activityParticipant);
    if (index > -1) { // only splice array when item is found
      this.activity.activityParticipants.splice(index, 1);
    }

    // Refresh participants list
    this.participantsDataSource = new MatTableDataSource<ActivityParticipant>(this.activity.activityParticipants);
  }



  editParticipant(i: number): void {
    this.editingParticipantIndex = i;
    this.editingParticipant = this.deepcopy(this.activity.activityParticipants[i]);
  }


  saveEditingParticipant(): void {
    if (this.editingParticipantIndex === undefined) {
      return;
    }

    // Check if all fields are filled
    if (!this.editingParticipant.firstname || this.editingParticipant.firstname.trim().length === 0
      || !this.editingParticipant.lastname || this.editingParticipant.lastname.trim().length === 0
      || !this.editingParticipant.organization || this.editingParticipant.organization.trim().length === 0
      || !this.editingParticipant.position || this.editingParticipant.position.trim().length === 0
    ) {
      this.angularServicesProviderService.createNewModal().alert(false, 'Must fill all fields in order to save participant!');
      return;
    }

    // Copy temp editingParticipant to participants array
    this.activity.activityParticipants[this.editingParticipantIndex] = this.deepcopy(this.editingParticipant);


    // And set editing participant index to undefined meaning editing is done
    this.editingParticipantIndex = undefined;

    // Refresh participants list
    this.participantsDataSource = new MatTableDataSource<ActivityParticipant>(this.activity.activityParticipants);
  }



  returnToLivingLab(openInNewTab = false, hashtag = '', tabNo?: number): void {
    if (openInNewTab) {
      const url = this.router.serializeUrl(this.router.createUrlTree(['living-lab', this.livingLabId], {queryParams: {tabNo}, fragment: hashtag}));
      window.open(url, '_blank');
    }
    else {
      this.router.navigate(['living-lab', this.livingLabId], {queryParams: {tabNo}, fragment: hashtag});
    }
  }



  onSubmit(): any {
    this.createActivity();
  }



  createActivity(): void {

    // Handle location
    if (this.activity.location === undefined || this.activity.location.text  !== this.locationText) {
      this.activity.location = {
        id: null,
        latitude: null,
        longitude: null,
        text: this.locationText,
        locationTypeId: null,
        locationTypeName: null
      };
    }


    // If main photo is not selected, mark it with the same red as material does with required input
    /*if (!this.activity.mainPhotoWrapper.content) {
      d3.select('div#mainPhoto')
        .style('color', '#f44336');
    }*/

    // if (!this.activity.mainPhotoWrapper.content
    if (!this.activity.title || this.activity.title.trim().length === 0
      || !this.selectedActivityTypeId
      || !this.activity.location || this.activity.location.text?.trim().length === 0
      || !this.selectedDateFrom
      || !this.selectedLanguageId
      || !this.activity.objective || this.activity.objective.trim().length === 0
    ) {
      // Open modal
      this.angularServicesProviderService.createNewModal().alert(false, 'Please fill all required fields!');

      // Smooth scroll into view
      document.getElementById('form')?.scrollIntoView({behavior: 'smooth'});

      // And stop here
      return;
    }

    // Set living lab id
    this.activity.livingLabId = this.livingLabId;


    // Add hours and minutes to dateFrom and dateTo
    if (this.selectedTimeFrom) {
      const r = this.selectedTimeFrom.split(':').map(x => +(x.trim()));
      this.selectedDateFrom?.setHours(r[0], r[1]);
    }

    if (this.selectedTimeTo) {
      const r = this.selectedTimeTo.split(':').map(x => +(x.trim()));
      this.selectedDateTo?.setHours(r[0], r[1]);
    }

    // Convert Date objects to number (epoch date)
    this.activity.dateFrom = this.selectedDateFrom?.getTime();
    this.activity.dateTo = this.selectedDateTo?.getTime();

    // Check that date from <= date to
    if (this.activity.dateFrom && this.activity.dateTo) {
      if (this.activity.dateTo < this.activity.dateFrom) {

        // Open modal
        this.angularServicesProviderService.createNewModal().alert(false, 'End date must be before start date!');

        // Smooth scroll into view
        document.getElementById('form')?.scrollIntoView({behavior: 'smooth'});

        return;
      }
    }


    // Set activity type
    if (this.selectedActivityTypeId) {
      this.activity.activityType = this.activityTypes.find(activityType => activityType.id === this.selectedActivityTypeId);
    }

    // Set timezone
    if (this.selectedTimezoneId) {
      this.activity.timezone = this.timezones.find(timezone => timezone.id === this.selectedTimezoneId);
    }

    // Set activity format
    if (this.selectedActivityFormatId) {
      this.activity.activityFormat = this.activityFormats.find(activityFormat => activityFormat.id === this.selectedActivityFormatId);
    }

    // Set language
    if (this.selectedLanguageId) {
      this.activity.language = this.languages.find(language => language.id === this.selectedLanguageId);
    }


    // Make the call
    /*this.activityService.create(this.livingLabId, this.activity, this.selectedMainPhoto, this.selectedAgenda, materialFiles, this.photos)
      .subscribe(
        () => {
          this.returnToLivingLab(false, 'tabs', 3);
        },
        (error: ErrorResponse) => {
          this.angularServicesProviderService.createNewModal().alert(false, 'Could not create activity!');
          console.error('error: ' + error.error.message);
        }
      );*/

    this.dialogRef.close({ livingLabId: this.livingLabId, activity: this.activity });
  }



  // From: https://stackoverflow.com/a/28152032/5589918
  deepcopy(o: any): any {
    return Object.assign({}, o);
  }



  setup(): void {
    if (this.data.activity) {
      this.activity = this.data.activity;
      this.submitButtonText = 'Update Activity';

      this.selectedActivityTypeId = this.activity.activityType?.id;
      this.locationText = this.activity.location?.text ?? null;

      if (typeof this.activity.dateFrom === 'number') {
        this.selectedDateFrom = new Date(this.activity.dateFrom);
      }

      this.selectedTimeFrom =
        ('00' + new Date(this.activity.dateFrom ?? 0).getHours()).slice(-2)
        + ' : '
        + ('00' + new Date(this.activity.dateFrom ?? 0).getMinutes()).slice(-2);

      if (this.activity.dateTo) {

        if (typeof this.activity.dateTo === 'number') {
          this.selectedDateTo = new Date(this.activity.dateTo);
        }

        this.selectedTimeTo =
          ('00' + new Date(this.activity.dateTo ?? 0).getHours()).slice(-2)
          + ' : '
          + ('00' + new Date(this.activity.dateTo ?? 0).getMinutes()).slice(-2);
      }

      this.selectedTimezoneId = this.activity.timezone?.id;
      this.selectedActivityFormatId = this.activity.activityFormat?.id;
      this.selectedLanguageId = this.activity.language?.id;

      this.materialDataSource = new MatTableDataSource<AssetResourceDetails>(this.activity.files);
      this.participantsDataSource = new MatTableDataSource<ActivityParticipant>(this.activity.activityParticipants);
    }
  }



  public close(): void {
    this.dialogRef.close();
  }

  safeUrl(s: string | ArrayBuffer): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(s as string);
  }
}
