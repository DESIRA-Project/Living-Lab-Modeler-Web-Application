import {Component, HostListener, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {AbstractControl, FormArray, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {OutcomeTagService} from "../../../../Service/outcome-tag.service";
import {Response} from "../../../../Models/Response/response";
import {OutcomeTag} from "../../../../Models/OutcomeTag";
import {Outcome} from "../../../../Models/Outcome";
import {FileWrapper} from "../../../../Models/FileWrapper";
import {AssetResourceType} from "../../../../Models/AssetResourceType";
import {of} from "rxjs";
import {concatMap} from "rxjs/operators";
import {AssetResourceTypeService} from "../../../../Service/asset-resource-type.service";
import {Deepcopy} from "../../../../Utils/deepcopy";
import {outcomesDiffer} from "./outcomes-differ";
import {DomSanitizer, SafeUrl} from "@angular/platform-browser";
import { AngularEditorConfig } from '@kolkov/angular-editor';

@Component({
  selector: 'app-add-new-outcome',
  templateUrl: './add-new-outcome.component.html',
  styleUrls: ['./add-new-outcome.component.css']
})
export class AddNewOutcomeComponent implements OnInit {

  ready = false;
  formGroup!: FormGroup;
  outcomeTags: OutcomeTag[] = [];
  assetResourceTypes: AssetResourceType[] = [];
  initialData?: Outcome;
  description:string = '';
  editorConfig: AngularEditorConfig = {   
    editable:true,
    sanitize:false,
    toolbarHiddenButtons: [
        [],[ 'insertImage',
        'insertVideo','toggleEditorMode']

   ]
};
  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddNewOutcomeComponent>,
    @Inject(MAT_DIALOG_DATA) public matDialogData: { initialData?: Outcome },
    private outcomeTagService: OutcomeTagService,
    private assetResourceTypeService: AssetResourceTypeService,
    private sanitizer: DomSanitizer
  ) {
    if (this.matDialogData) {
      this.initialData = matDialogData.initialData;
    }
  }

  // Close on escape key
  @HostListener('window:keyup.esc') onKeyUp() {
    this.dialogRef.close();
  }

  ngOnInit(): void {
    // Initialize form
    this.formGroup = this.fb.group({
      id: undefined,
      livingLabId: undefined,
      title: ['', Validators.required],
      description: '',
      outcomeTags: [],
      assetResourceDetails: this.fb.array([])
    });

    of(undefined).pipe(

      concatMap(() => {
        // Get asset resource types
        return this.assetResourceTypeService.getAll();
      }),

      concatMap((response: Response<AssetResourceType[]>) => {
        // Set asset resource types
        this.assetResourceTypes = response.data;

        // Get outcome tags
        return this.outcomeTagService.getAll();
      }),

      concatMap(((response: Response<OutcomeTag[]>) => {
        // Set outcome tags
        this.outcomeTags = response.data;

        // Set initial data, if they exist
        if (this.initialData) {
          this.setupInitialData(Deepcopy.copy(this.initialData));
        }

        // Mark ready
        this.ready = true;

        return of(undefined);
      }))
    ).subscribe();

  }

  setupInitialData(initialData: Outcome) {
    // When initializing the outcomeTags field in formGroup,
    // it needs to be pointing to the actual object in tagList,
    // and not a copy of it. So first compute the selectedTagIds
    // and then set the form value to the corresponding tagList objects.
    // https://stackoverflow.com/a/51543532/5589918
    // Same happens for assetResourceType below
    const selectedTagIds = initialData.outcomeTags?.map(tag => tag.id) ?? [];
    this.description = initialData.description ? initialData.description : '';

    this.formGroup.patchValue({
      id: initialData.id,
      livingLabId: initialData.livingLabId,
      title: initialData.title,
      description: initialData.description,
      outcomeTags: this.outcomeTags.filter(tag => selectedTagIds.indexOf(tag.id) > -1),
    });

    initialData.assetResourceDetails.map(
      assetResourceDetail => this.fb.group({
        id: assetResourceDetail.id,
        title: [assetResourceDetail.title, Validators.required],
        fileWrapper: [assetResourceDetail.fileWrapper, Validators.required],
        assetResourceType: [this.assetResourceTypes[(assetResourceDetail.assetResourceType?.id ?? 1) - 1], Validators.required],
        dirty: false
      })
    ).forEach(group => this.assetResourceDetails.push(group));

  }

  addAssetResourceDetailsFormGroup() {
    const assetResourceDetailsFormGroup = this.fb.group({
      id: undefined,
      title: ['', Validators.required],
      fileWrapper: [null, Validators.required],
      assetResourceType: [null, Validators.required],
      dirty: false
    });
    this.assetResourceDetails.push(assetResourceDetailsFormGroup);
  }

  onDeleteAssetResourceDetails(index: number) {
    this.assetResourceDetails.removeAt(index);
    this.formGroup.markAsDirty();
  }

  get assetResourceDetails() {
    return this.formGroup.get('assetResourceDetails') as FormArray;
  }

  onFileChange(event: any, i: number) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const fileWrapper = {} as FileWrapper;
        fileWrapper.name = file.name;
        fileWrapper.contentType = file.type;
        fileWrapper.content = reader.result;
        this.assetResourceDetails.at(i).patchValue({ fileWrapper });

        // Get file asset resource type (photo or file) from file.type instead of from user
        const assetResourceTypeIndex = file.type.startsWith("image") ? 1 : 0;
        const assetResourceType = this.assetResourceTypes[assetResourceTypeIndex];
        this.assetResourceDetails.at(i).patchValue({ assetResourceType });

        this.formGroup.markAsDirty();
      };
    }
  }

  getFormGroup(control: AbstractControl) {
    return control as FormGroup;
  }

  onSubmit(): void {
    if (this.formGroup.valid) {

      // For each asset resource detail, if the content starts with "http",
      // then it means that it was not updated, so mark it as not dirty.
      // Otherwise, mark it as dirty.
      for (const assetResourceDetail of this.assetResourceDetails.controls) {
        const content = assetResourceDetail.get('fileWrapper')?.value.content;
        assetResourceDetail.patchValue({ dirty: !content.startsWith("http")} );
      }

      // Close and return
      this.dialogRef.close(this.formGroup.value);
    }
    else {
      this.formGroup.markAllAsTouched();
    }
  }

  public close(): void {
    this.dialogRef.close();
  }

  safeUrl(s?: string | ArrayBuffer | null): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(s as string);
  }

  public outcomeHasChanged(): boolean {
    return outcomesDiffer(this.initialData, this.formGroup.value as Outcome);
  }

}
