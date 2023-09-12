import {FileWrapper} from './FileWrapper';
import {AssetResourceType} from "./AssetResourceType";

export interface AssetResourceDetails {
  id?: number;
  assetResourceName?: string;
  title: string;
  description: string;
  originalFilename?: string;
  fileWrapper: FileWrapper;
  assetResourceType?: AssetResourceType;
  dirty?: boolean;
}
