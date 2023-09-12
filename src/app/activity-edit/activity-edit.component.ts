import {Component, EventEmitter, Inject, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Response} from '../Models/Response/response';
import {ErrorResponse} from '../Models/Response/error-response';
import {ActivityService} from '../Service/activity.service';
import {Activity} from '../Models/Activity';
import {LivingLabService} from '../Service/living-lab.service';
import {LLUserPermissionDefs} from '../Models/LLUserPermissionDefs';
import {MatTableDataSource} from '@angular/material/table';
import {ActivityParticipant} from '../Models/ActivityParticipant';
import {ActivityTypeService} from '../Service/activity-type.service';
import {TimezoneService} from '../Service/timezone.service';
import {ActivityFormatService} from '../Service/activity-format.service';
import {LanguageService} from '../Service/language.service';
import {LocationService} from '../Service/location.service';
import {AngularServicesProviderService} from '../Service/angular-services-provider.service';
import * as d3 from 'd3';
import {catchError, concatMap} from 'rxjs/operators';
import {forkJoin, of} from 'rxjs';
import {formattedHours, formattedMinutes} from '../Utils/TimeDisplayUtils';
import {AssetsService} from '../Service/assets.service';
import {AddNewActivityComponent} from '../add-new-activity/add-new-activity.component';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FileWrapper} from '../Models/FileWrapper';
import {AssetResourceDetails} from '../Models/AssetResourceDetails';
import {DomSanitizer, SafeUrl} from "@angular/platform-browser";



@Component({
  selector: 'app-activity-edit',
  templateUrl: '../add-new-activity/add-new-activity.component.html',
  styleUrls: ['../add-new-activity/add-new-activity.component.css', './activity-edit.component.css']
})
export class ActivityEditComponent implements OnInit {

  livingLabId = -1;
  activityId = -1;

  ready = false;

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

  livingLabName: string | undefined;

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

  mainPhotoDirty = false;
  agendaDirty = false;

  locationFilterValue = '';
  filterEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
  filterTimer: NodeJS.Timeout | undefined;
  filterTimeoutInterval = 300;   /** Wait 300 milliseconds before actually searching for what the user typed */
  locationResults: any[] = [];
  locationText: string | null = '';

  materialDisplayedColumns: string[] = ['title', 'description', 'file', 'actions'];
  materialDataSource = new MatTableDataSource<AssetResourceDetails>(this.activity.files);
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
    id: -1,
    firstname: '',
    lastname: '',
    organization: '',
    position: ''
  };
  editingParticipantIndex: number | undefined;
  editingParticipant: ActivityParticipant = {
    id: -1,
    firstname: '',
    lastname: '',
    organization: '',
    position: ''
  };

  submitButtonText = 'Update Activity';

  constructor(
    public activatedRoute: ActivatedRoute,
    public router: Router,
    public livingLabService: LivingLabService,
    public activityService: ActivityService,
    public assetsService: AssetsService,
    public activityTypeService: ActivityTypeService,
    public timezoneService: TimezoneService,
    public activityFormatService: ActivityFormatService,
    public languageService: LanguageService,
    public locationService: LocationService,
    public angularServicesProviderService: AngularServicesProviderService,
    public dialogRef: MatDialogRef<AddNewActivityComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private sanitizer: DomSanitizer
  ) {
    /*super(
      activatedRoute,
      router,
      livingLabService,
      activityService,
      assetsService,
      activityTypeService,
      timezoneService,
      activityFormatService,
      languageService,
      locationService,
      sanitizer,
      angularServicesProviderService,
      dialogRef,
      data
    );*/
    this.livingLabId = data.livingLabId;
    this.activityId = data.activityId;
    this.dialogRef.disableClose = true;
  }



  ngOnInit(): void {

    console.log('activity-edit');
    console.log('data');
    console.log(this.data);

    this.livingLabService.getUserLLPermissions(this.livingLabId).pipe(

      //
      // Check if user is allowed to view the page
      //
      concatMap((response: Response<string[]>) => {
        console.log('got ll permissions');
        // If not allowed, redirect
        if (response.data.indexOf(LLUserPermissionDefs.MODIFY_LIVING_LAB_INFO) <= -1) {
          this.router.navigate(['/']);
        }

        if (this.data.activity) {
          return of({ data: this.data.activity});
        }
        else {
          return this.activityService.get(this.livingLabId, this.activityId);
        }
      }),

      //
      // Get activity to be edited
      //
      concatMap((response: Response<Activity>) => {
        console.log('got activity');
        this.activity = response.data;
        this.livingLabName = this.activity.livingLabName;

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
        console.error(err);
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
      this.activity.mainPhotoUrl = reader.result as string;
    };
    this.mainPhotoDirty = true;
    this.activity.mainPhotoDelete = false;
  }



  public removeMainPhoto(): void {
    this.activity.mainPhotoWrapper = {};
    this.activity.mainPhotoUrl = undefined;
    this.activity.displayMainPhotoUrl = undefined;
    this.mainPhotoDirty = true;
  }



  public addNewAgenda(fileInputEvent: any): void {
    const selectedAgenda = fileInputEvent.target.files[0];

    // Create a temp url so the user can download what they just uploaded
    const reader = new FileReader();
    reader.readAsDataURL(selectedAgenda);
    reader.onload = () => {
      this.activity.agendaWrapper.name = selectedAgenda.name;
      this.activity.agendaWrapper.contentType = selectedAgenda.type;
      this.activity.agendaWrapper.content = reader.result as string;
    };
    this.agendaDirty = true;
  }



  public removeAgenda(): void {
    this.activity.agendaWrapper = {};
    this.agendaDirty = true;
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

    // Save it in photos list (which will get sent to backend upon pressing save)
    // this.photos.push(photo);

    // Also save it in newPhotos list
    // this.newPhotos.push(photo);

    // Convert it to temp url for it to be displayed
    const reader = new FileReader();
    reader.readAsDataURL(photo);
    reader.onload = () => {
      this.activity.photosUrls.push(reader.result as string);
      const fileWrapper: FileWrapper = {
        name: photo.name,
        contentType: photo.type,
        content: reader.result
      };
      this.activity.photosWrappers.push(fileWrapper);
      this.activity.newPhotosWrappers.push(fileWrapper);
    };
  }



  removePhoto(index: number): void {
    const photoToBeRemoved = this.activity.photosWrappers[index];

    // If photo was a newly added photo
    const indexNewPhotos = this.activity.newPhotosWrappers.indexOf(photoToBeRemoved);
    if (indexNewPhotos > -1) {

      console.log('removing new');

      // Then remove from photos list
      this.activity.photosWrappers.splice(index, 1);
      this.activity.photosUrls.splice(index, 1);

      // And from new photos list
      this.activity.newPhotosWrappers.splice(indexNewPhotos, 1);

    }

    // Else, if photo was an already existing photo
    else {

      console.log('removing old');

      // Mark id to be deleted from db
      this.activity.oldPhotosUrlsToBeDeleted.push(this.activity.photosWrappers[index].name ?? '');

      // And remove from photos list
      this.activity.photosWrappers.splice(index, 1);
      this.activity.photosUrls.splice(index, 1);
    }
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
      this.newMaterial.fileWrapper.content = reader.result;
      this.newMaterial.fileWrapper.name = file.name;
      this.newMaterial.fileWrapper.contentType = file.type;
    };
  }



  addNewMaterial(): void {

    // Check if all fields are filled
    if (!this.newMaterial.title || this.newMaterial.title.trim().length === 0
      || !this.newMaterial.description || this.newMaterial.description.trim().length === 0
      || !this.newMaterial.fileWrapper.content
    ) {
      this.angularServicesProviderService.createNewModal().alert(false, 'Must fill all fields in order to add material!');
      return;
    }

    // Add new material
    this.activity.files.push(this.newMaterial);

    // Add material to new materials list
    this.activity.newFiles.push(this.newMaterial);

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

    const index = this.activity.files.indexOf(material);
    const indexNewFiles = this.activity.newFiles.indexOf(material);

    // If material to be removed belongs to new materials
    if (indexNewFiles > -1) {
      console.log('removing new');

      this.activity.newFiles.splice(indexNewFiles, 1);
      this.activity.files.splice(index, 1);
    }

    // Else, if material to be removed belongs to old materials
    else {
      console.log('removing old');

      // If it was included in the modified material, delete it from there as well
      const entryOldFilesModified = this.activity.oldFilesModified.find(x => x.id === this.activity.files[index].id);
      if (entryOldFilesModified) {
        const indexOldMaterialsModified = this.activity.oldFilesModified.indexOf(entryOldFilesModified);
        if (indexOldMaterialsModified > -1) {
          this.activity.oldFilesModified.splice(indexOldMaterialsModified, 1);
        }
      }

      this.activity.oldFileIdsToBeDeleted.push(this.activity.files[index].id ?? -1);
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

    // Set file to editingMaterial file wrapper
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      this.editingMaterial.fileWrapper.name = file.name;
      this.editingMaterial.fileWrapper.contentType = file.type;
      this.editingMaterial.fileWrapper.content = reader.result;
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

    if (this.isNewMaterial(this.activity.files[this.editingMaterialIndex])) {

      // Find index of material in new materials array
      const indexNewMaterials = this.activity.newFiles.indexOf(this.activity.files[this.editingMaterialIndex]);

      this.activity.newFiles[indexNewMaterials] = this.deepcopy(this.editingMaterial);
    }
    else {
      this.activity.oldFilesModified.push(this.deepcopy(this.editingMaterial));
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

    // Add to newParticipants list
    this.activity.newActivityParticipants.push(this.newParticipant);

    // Refresh participants list
    this.participantsDataSource = new MatTableDataSource<ActivityParticipant>(this.activity.activityParticipants);

    // Reset participant to be added
    this.newParticipant = {
      id: -1,
      firstname: '',
      lastname: '',
      organization: '',
      position: ''
    };
  }



  removeParticipant(activityParticipant: ActivityParticipant): void {

    this.editingParticipantIndex = undefined;

    const index = this.activity.activityParticipants.indexOf(activityParticipant);
    const indexNewParticipants = this.activity.newActivityParticipants.indexOf(activityParticipant);
    const indexOldParticipantsModified = this.activity.oldActivityParticipantsModified.findIndex(x => x.id === activityParticipant.id);

    // If participant to be removed belongs to new participants
    if (indexNewParticipants > -1) { // only splice array when item is found

      console.log('removing new');

      // Then just remove participant from both lists
      this.activity.newActivityParticipants.splice(indexNewParticipants, 1);
      this.activity.activityParticipants.splice(index, 1);
    }

    // Else, if participant to be removed belongs to old participants
    else {
      if (index > -1) {

        console.log('removing old');

        // Add its id to oldParticipantsToBeDeleted
        this.activity.oldActivityParticipantIdsToBeDeleted.push(this.activity.activityParticipants[index].id ?? -1);

        // Then remove
        this.activity.activityParticipants.splice(index, 1);

        // And check if it is to remove from old participants modified also
        if (indexOldParticipantsModified > -1) {
          this.activity.oldActivityParticipantsModified.splice(indexOldParticipantsModified, 1);
        }
      }
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


    if (this.isNewParticipant(this.activity.activityParticipants[this.editingParticipantIndex])) {

      // Find index of participant in newParticipants array
      const index1 = this.activity.newActivityParticipants.indexOf(this.activity.activityParticipants[this.editingParticipantIndex]);

      this.activity.newActivityParticipants[index1] = this.deepcopy(this.editingParticipant);
    }
    else {
      this.activity.oldActivityParticipantsModified.push(this.deepcopy(this.editingParticipant));
    }


    // Copy temp editingParticipant to participants array
    this.activity.activityParticipants[this.editingParticipantIndex] = this.deepcopy(this.editingParticipant);


    // And set editing participant index to undefined meaning editing is done
    this.editingParticipantIndex = undefined;

    // Refresh participants list
    this.participantsDataSource = new MatTableDataSource<ActivityParticipant>(this.activity.activityParticipants);
  }



  isNewParticipant(activityParticipant: ActivityParticipant): boolean {
    return this.activity.newActivityParticipants.indexOf(activityParticipant) > -1;
  }



  isNewMaterial(material: any): boolean {
    return this.activity.newFiles.indexOf(material) > -1;
  }



  onSubmit(): any {
    this.updateActivity();
  }



  updateActivity(): void {

    // Handle location
    if (!this.activity.location || !this.activity.location.id) {
      this.activity.location = {
        id: null,
        latitude: null,
        longitude: null,
        text: this.locationText,
        locationTypeId: null,
        locationTypeName: null
      };
    }


    console.log('updateActivity');
    console.log(this.activity);


    // If main photo is not selected, mark it with the same red as material does with required input
    /*if (!this.activity.mainPhotoWrapper.content && this.mainPhotoDirty) {
      d3.select('div#mainPhoto')
        .style('color', '#f44336');
    }*/


    // Check required fields
    // if ((!this.activity.mainPhotoWrapper.content && this.mainPhotoDirty)
    if (!this.activity.title || this.activity.title.trim().length === 0
      || !this.activity.activityType
      || !this.activity.location || !this.activity.location.text || this.activity.location.text?.trim().length === 0
      || !this.activity.language
      || !this.activity.objective || this.activity.objective.trim().length === 0
    ) {
      // Open modal
      this.angularServicesProviderService.createNewModal().alert(false, 'Please fill all required fields!');

      // Smooth scroll into view
      document.getElementById('form')?.scrollIntoView({behavior: 'smooth'});

      // And stop here
      return;
    }


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

    // If main photo is not dirty, then empty mainPhotoWrapper
    if (!this.mainPhotoDirty) {
      this.activity.mainPhotoWrapper = {};
    }
    // If main photo is dirty and content is null, then mark for delete
    else if (this.mainPhotoDirty && !this.activity.mainPhotoWrapper.content) {
      this.activity.mainPhotoDelete = true;
    }

    // If agenda is not dirty, then empty agendaWrapper
    if (!this.agendaDirty) {
      this.activity.agendaWrapper = {};
    }
    // If agenda is dirty and content is null, then mark for delete
    else if (this.agendaDirty && !this.activity.agendaWrapper.content) {
      this.activity.agendaDelete = true;
    }


    /*// Make the call
    this.activityService.update(
      this.livingLabId,
      this.activity,
      // this.selectedMainPhoto,
      // this.selectedAgenda,
      // this.newPhotos,
      // newMaterialFiles,
      // oldMaterialFilesToBeModified
    ).subscribe(
        () => {
          this.router.navigate(['../'], { relativeTo: this.activatedRoute });
        },
        (error: ErrorResponse) => {
          this.angularServicesProviderService.createNewModal().alert(false, 'Could not update activity!');
          console.error('error: ' + error.error.message);
        }
      );*/

    console.log('activity-edit returning');
    console.log(this.activity);

    this.dialogRef.close({ livingLabId: this.livingLabId, activity: this.activity });

  }



  // From: https://stackoverflow.com/a/28152032/5589918
  deepcopy(o: any): any {
    return Object.assign({}, o);
  }



  setup(): void {

    if (!this.activity.mainPhotoWrapper || !this.activity.mainPhotoWrapper.content) {
      this.activity.mainPhotoWrapper = { content: this.activity.displayMainPhotoUrl };
    }

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

    const agendaUrl = this.assetsService.getDownloadableAssetLink(this.activity.agendaUrl ?? '', true);
    this.activity.agendaWrapper = { name: this.activity.agendaFilename, content: this.activity.agendaUrl ? agendaUrl : undefined };

    for (const file of this.activity.files) {
      if (!file.fileWrapper) {
        file.fileWrapper = {
            name: file.originalFilename,
            content: this.assetsService.getAssetLink(file.assetResourceName)
          };
      }
    }

    this.activity.newFiles = this.activity.newFiles ?? [];
    this.activity.oldFilesModified = this.activity.oldFilesModified ?? [];
    this.activity.oldFileIdsToBeDeleted = this.activity.oldFileIdsToBeDeleted ?? [];
    this.materialDataSource = new MatTableDataSource<AssetResourceDetails>(this.activity.files);

    this.activity.newActivityParticipants = this.activity.newActivityParticipants ?? [];
    this.activity.oldActivityParticipantsModified = this.activity.oldActivityParticipantsModified ?? [];
    this.activity.oldActivityParticipantIdsToBeDeleted = this.activity.oldActivityParticipantIdsToBeDeleted ?? [];
    this.participantsDataSource = new MatTableDataSource<ActivityParticipant>(this.activity.activityParticipants);

    // this.photos = this.activity.photosUrls ?? [];
    if (this.activity.photosWrappers.length <= 0) {
      this.activity.photosWrappers = this.activity.photosUrls.map(
        photoUrl => ({name: photoUrl, content: this.assetsService.getAssetLink(photoUrl, true)}) as FileWrapper
      );
    }

    // this.photosTempUrls = this.activity.photosUrls?.map(photoUrl => this.assetsService.getAssetLink(photoUrl)) ?? [];
    // this.activity.photosUrls = this.activity.photosUrls?.map(photoUrl => this.assetsService.getAssetLink(photoUrl)) ?? [];

    this.activity.newPhotosWrappers = this.activity.newPhotosWrappers ?? [];
    this.activity.oldPhotosUrlsToBeDeleted = this.activity.oldPhotosUrlsToBeDeleted ?? [];
  }

  zip(a1: any[], a2: any[]): any[] {
    return a1.map((x, i) => [x, a2[i]]);
  }

  public close(): void {
    this.dialogRef.close();
  }

  safeUrl(s: string | ArrayBuffer): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(s as string);
  }
}
