import {ActivityParticipant} from './ActivityParticipant';
import {FileWrapper} from './FileWrapper';
import {AssetResourceDetails} from './AssetResourceDetails';

export interface Activity {
  id?: number;

  livingLabId?: number;
  livingLabName?: string;

  title?: string;

  objective?: string;

  activityType?: {
    id: number;
    name: string;
    moderated: boolean;
  };

  dateFrom?: number | Date;
  dateTo?: number | Date;

  timezone?: {
    id: number,
    utcName: string;
  };

  location?: {
    id: number | null;
    latitude?: number | null;
    longitude?: number | null;
    text: string | null,
    locationTypeId: number | null,
    locationTypeName: string | null
  };

  venue?: string;

  link?: string;

  activityFormat?: {
    id: number;
    name: string;
  };

  language?: {
    id: number;
    name: string;
  };

  agendaUrl?: string;
  agendaFilename?: string;
  agendaWrapper: FileWrapper;
  agendaDelete?: boolean;

  mainPhotoUrl?: string;
  mainPhotoWrapper: FileWrapper;
  mainPhotoDelete?: boolean;

  photosUrls: string[];
  photosWrappers: FileWrapper[];
  newPhotosWrappers: FileWrapper[];
  oldPhotosUrlsToBeDeleted: string[];

  files: AssetResourceDetails[];
  newFiles: AssetResourceDetails[];
  oldFilesModified: AssetResourceDetails[];
  oldFileIdsToBeDeleted: number[];

  activityParticipants: ActivityParticipant[];
  newActivityParticipants: ActivityParticipant[];
  oldActivityParticipantsModified: ActivityParticipant[];
  oldActivityParticipantIdsToBeDeleted: number[];

  outcome?: string;
  onlyForMembers?: boolean;

  // Frontend computed fields
  isOver?: boolean;
  startTime?: number;
  displayMainPhotoUrl?: string;
}
