import {DynamicContent} from "./dynamic-content.component";

export interface DynamicContentParent {
  setCurrentViewInst(inst: DynamicContent | undefined): void;
  checkCurrentViewDirty: (() => boolean);
  goToPage(name:string):void;
}
