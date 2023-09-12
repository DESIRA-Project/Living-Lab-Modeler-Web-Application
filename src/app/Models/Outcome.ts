import {OutcomeTag} from "./OutcomeTag";
import {AssetResourceDetails} from "./AssetResourceDetails";

export interface Outcome {
  id?: number;
  livingLabId?: number;
  title?: string;
  description?: string;
  outcomeTags?: OutcomeTag[];
  assetResourceDetails: AssetResourceDetails[];

  // front-end computed fields
  numFiles?: number;
  numPhotos?: number;
}
