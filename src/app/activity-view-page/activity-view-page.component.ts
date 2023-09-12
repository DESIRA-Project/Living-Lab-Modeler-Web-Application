import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AssetsService} from '../Service/assets.service';
import {ActivityService} from '../Service/activity.service';
import {Response} from '../Models/Response/response';
import {ErrorResponse} from '../Models/Response/error-response';
import {Activity} from '../Models/Activity';
import {ActivityParticipant} from '../Models/ActivityParticipant';
import { BreadcrumbController } from '../Breadcrumb/breadcrumb-controller';
import { BreadcrumbComponent } from '../Breadcrumb/breadcrumb.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-activity-view-page',
  templateUrl: './activity-view-page.component.html',
  styleUrls: ['./activity-view-page.component.css']
})
export class ActivityViewPageComponent implements OnInit, BreadcrumbController {

  ready = false;
  livingLabId = -1;
  activityId = -1;
  activity: Activity | undefined;
  numParticipants = 0;
  numVisibleParticipants = 0;
  visibleParticipantsStep = 6;
  visibleParticipants: ActivityParticipant[] = [];
  numPhotos = 0;
  numVisiblePhotos = 0;
  visiblePhotosStep = 3;
  visiblePhotos: string[] = [];
  private breadcrumb: BreadcrumbComponent | null = null;
  environment = environment;
  private readonly activityTabNo:number = 2;

  constructor(private activatedRoute: ActivatedRoute,
              private router: Router,
              private activityService: ActivityService,
              private assetsService: AssetsService) {
    this.activatedRoute.params.subscribe( params => {
      this.livingLabId = +params.livingLabId;
      this.activityId = +params.activityId;
    });
  }



  setPath(path: any[] | undefined): void {
    // console.log(path);
    if (this.breadcrumb !== null) {
      if (path === undefined) {
        this.breadcrumb.setPath(null);
      }
      else {
        this.breadcrumb.setPath(path);
      }
    }
  }



  setLabel(label: string): void {
    if (this.breadcrumb !== null) {
      this.breadcrumb.setLabel(label);
    }
  }



  setBreadcrumb(inst: BreadcrumbComponent): void {
    if (inst !== null) {
      this.breadcrumb = inst;
    }
  }



  ngOnInit(): void {
    this.activityService.get(this.livingLabId, this.activityId).subscribe(
      (response: Response<Activity>) => {
        this.activity = response.data;

        if (this.activity === undefined) {
          this.navigateOnError();
          return;
        }

        if (this.breadcrumb){
          const title = !this.activity.title ? 'Living Lab Activity' : this.activity.title;
          const parent: string = environment.env.breadcrumb.paths.activity[0];
          // @ts-ignore
          const node: any = environment.env.breadcrumb.items[parent];
          const llUrl = this.router.url.split('/activity')[0] + "?tabNo=" + this.activityTabNo;

          //console.log('#' + node.link + llUrl);

          this.breadcrumb.addToPath([
            { name: node.name, link: node.link, key: parent},
            { name: this.activity.livingLabName, key: this.activity.livingLabName, link: '#' + node.link + llUrl },
            { name: title, key: '' }
          ]);
        }

        /*console.log('activity pre');
        console.log(this.activity);*/

        // Get url for image
        if (this.activity.mainPhotoUrl) {
          this.activity.mainPhotoUrl = this.assetsService.getAssetLink(this.activity.mainPhotoUrl, true);
        }

        // Get url for agenda
        if (this.activity.agendaUrl) {
          this.activity.agendaUrl = this.assetsService.getDownloadableAssetLink(this.activity.agendaUrl, true);
        }

        // Convert epoch dates to typescript date item
        if (typeof this.activity.dateFrom === 'number') {
          this.activity.dateFrom = new Date(this.activity.dateFrom);
        }

        // Now date
        const now = new Date();

        // If dateTo is not defined, mark an activity finished if dateFrom < now
        // TODO: Use UTC field to be added for comparison
        if (this.activity.dateFrom) {
          this.activity.isOver = this.activity.dateFrom < now;
        }

        if (this.activity.dateTo) {
          this.activity.dateTo = new Date(this.activity.dateTo);

          // If dateTo is defined, mark an activity finished if dateTo < now
          // TODO: Use UTC field to be added for comparison
          this.activity.isOver = this.activity.dateTo < now;
        }

        if (this.activity.dateFrom && this.activity.dateFrom instanceof Date) {
          this.activity.startTime = this.activity.dateFrom.getTime();
        }

        // Get url for each file
        this.activity.files?.forEach(file => file.assetResourceName = this.assetsService.getDownloadableAssetLink(file.assetResourceName ?? '', true));

        // Get url for each photo
        const tempPhotosUrls = this.activity.photosUrls;
        this.activity.photosUrls = [];
        // @ts-ignore
        tempPhotosUrls.forEach((photoUrl: string) => this.activity.photosUrls.push(this.assetsService.getAssetLink(photoUrl)));

        // Reverse photo order, so that most recent are viewed first
        this.activity.photosUrls.reverse();

        // Initialize the visiblePhotos array with the first `visiblePhotosStep` photos
        this.numPhotos = this.activity.photosUrls.length;
        this.numVisiblePhotos = this.visiblePhotosStep;
        this.visiblePhotos = this.activity.photosUrls.slice(0, this.visiblePhotosStep);

        // Sort participants by surname
        this.activity.activityParticipants?.sort((p1, p2) => p1.lastname > p2.lastname ? -1 : 1);

        // Initialize the visibleParticipants array with the first `visibleParticipantsStep` participants
        this.numParticipants = this.activity.activityParticipants?.length === undefined ? 0 : this.activity.activityParticipants.length;
        this.numVisibleParticipants = this.visibleParticipantsStep;
        this.visibleParticipants = this.activity.activityParticipants?.slice(0, this.visibleParticipantsStep) === undefined ? [] : this.activity.activityParticipants.slice(0, this.visibleParticipantsStep);


        // Mark ready to display html elements
        this.ready = true;

        /*console.log('activity post');
        console.log(this.activity);*/
      },
      (error: ErrorResponse)  => this.navigateOnError()
    );
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



  seeMorePhotos(): void {
    if (this.activity === undefined || this.activity.photosUrls === undefined) {
      return;
    }
    this.visiblePhotos = [...this.visiblePhotos, ...this.activity.photosUrls.slice(this.numVisiblePhotos, this.numVisiblePhotos + this.visiblePhotosStep)];
    this.numVisiblePhotos = this.visiblePhotos.length;
  }



  seeLessPhotos(): void {
    if (this.activity === undefined || this.activity.photosUrls === undefined) {
      return;
    }
    this.visiblePhotos = this.activity.photosUrls.slice(0, Math.max(this.numVisiblePhotos - this.visiblePhotosStep, this.visiblePhotosStep));
    this.numVisiblePhotos = this.visiblePhotos.length;
  }



  seeMoreParticipants(): void {
    if (this.activity === undefined || this.activity.activityParticipants === undefined) {
      return;
    }
    this.visibleParticipants = [...this.visibleParticipants, ...this.activity.activityParticipants.slice(this.numVisibleParticipants, this.numVisibleParticipants + this.visibleParticipantsStep)];
    this.numVisibleParticipants = this.visibleParticipants.length;
  }



  seeLessParticipants(): void {
    if (this.activity === undefined || this.activity.activityParticipants === undefined) {
      return;
    }
    this.visibleParticipants = this.activity.activityParticipants.slice(0, Math.max(this.numVisibleParticipants - this.visibleParticipantsStep, this.visibleParticipantsStep));
    this.numVisibleParticipants = this.visibleParticipants.length;
  }



  navigateOnError(): void {
    this.router.navigate(['/']);
  }

}
