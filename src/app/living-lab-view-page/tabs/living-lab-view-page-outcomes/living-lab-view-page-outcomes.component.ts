import {Component, Input, OnInit} from '@angular/core';
import {Outcome} from "../../../Models/Outcome";
import {Deepcopy} from "../../../Utils/deepcopy";
import {AssetResourceDetails} from "../../../Models/AssetResourceDetails";
import {AssetsService} from "../../../Service/assets.service";
import {DomSanitizer, SafeUrl} from "@angular/platform-browser";


@Component({
  selector: 'app-living-lab-view-page-outcomes',
  templateUrl: './living-lab-view-page-outcomes.component.html',
  styleUrls: ['./living-lab-view-page-outcomes.component.css']
})
export class LivingLabViewPageOutcomesComponent implements OnInit {

  @Input() livingLab: any;
  outcomes: Outcome[] = [];
  activityOutcomes: any[] = [];
  showAddNewButton = false;
  showEditButton = false;
  showDeleteButton = false;
  showNoOutcomesMessage = true;
  openPanelIndex = -1;

  constructor(protected assetsService: AssetsService,
              protected sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.outcomes = Deepcopy.copy(this.livingLab.outcomes);
    this.outcomes.forEach(
      (outcome: Outcome) => {
        outcome.assetResourceDetails.forEach(
          (assetResourceDetails: AssetResourceDetails) => {
            let content = '';
            if (assetResourceDetails.assetResourceType?.id === 1) {
              content = this.assetsService.getDownloadableAssetLink(assetResourceDetails.assetResourceName ?? '');
            }
            else if (assetResourceDetails.assetResourceType?.id === 2) {
              content = this.assetsService.getAssetLink(assetResourceDetails.assetResourceName ?? '');
            }
            assetResourceDetails.fileWrapper = {
              name: assetResourceDetails.originalFilename,
              content: content
            };
          }
        );
      });
    this.activityOutcomes = this.livingLab.activityOutcomes;
  }

  escapeHTML(s:string|undefined):string|undefined{
    return s ? s.replace(/<[^>]*>/g, '').replace(/&#160;/g,' ') : s;
  }

  getOutcomeFiles(outcome: Outcome): AssetResourceDetails[] {
    return outcome.assetResourceDetails.filter((assetResourceDetails: AssetResourceDetails) => assetResourceDetails.assetResourceType?.id === 1);
  }

  getOutcomePhotos(outcome: Outcome): AssetResourceDetails[] {
    return outcome.assetResourceDetails.filter((assetResourceDetails: AssetResourceDetails) => assetResourceDetails.assetResourceType?.id === 2);
  }

  onClickAddNew(): void {
  }

  onClickEdit(i: number): void {
  }

  onClickDelete(i: number): void {
  }

  safeUrl(s?: string | ArrayBuffer | null): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(s as string);
  }

  // Using timeout for some minor synchronization issue with also setting openPanelIndex = -1
  setOpen(i: number) {
    setTimeout(() => this.openPanelIndex = i, 50);
  }

}
