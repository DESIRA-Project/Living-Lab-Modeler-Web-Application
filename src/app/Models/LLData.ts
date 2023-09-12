import {LLStakeholder} from "./LLStakeholder";
import {LLSCPEntity} from "../User/Admin/LivingLabEntityManagement/scp-entity";
import {SCPConnection} from "../User/LLCreation/LLSCPEntities/ll-scp-entities.component";
import {Activity} from "./Activity";
import { LocationState } from "../User/LLCreation/LLLocation/ll-location.component";
import {Outcome} from "./Outcome";
import { SDGImpactNode } from "../User/LLCreation/LLSDGs/sdg-impact-modal/sdg-impact-modal.component";
import { LLDataChanges } from "./LLDataChanges";

export interface LLData {
  livingLabId: number,
  name: string,
  focalQuestion: string,
  description: string,
  logo: string,
  locationState: LocationState,

  selectedDTs: { [id: string] : boolean; },
  selectedSDGs: { [id: string] : boolean; },
  selectedSDGImpact: {[key:string]: SDGImpactNode} ,

  selectedTax: { [id: string] : { [id: string] : boolean; }; },
  selectedExistingStakeholders: LLStakeholder[],
  newlyCreatedStakeholders?: LLStakeholder[],
  entities: { [id: string] : LLSCPEntity[]; },
  connections: SCPConnection[],
  activities: Activity[],
  activityIdsToBeDeleted: number[],
  isPublic?: boolean,
  isPublished?: boolean,
  public:boolean,
  status:string,
  outcomes: Outcome[],
  changes:LLDataChanges|null
}

export interface LightWeightLLData {
  livingLabId: number,
  name?: string,
  focalQuestion?: string,
  description?: string,
  logo?: string,
  locationState?: LocationState,

  selectedDTs?: { [id: string] : boolean; },
  selectedSDGs?: { [id: string] : boolean; },
  selectedSDGImpact?: {[key:string]: SDGImpactNode} ,

  selectedTax?: { [id: string] : { [id: string] : boolean; }; },
  selectedExistingStakeholders?: LLStakeholder[],
  newlyCreatedStakeholders?: LLStakeholder[],
  entities?: { [id: string] : LLSCPEntity[]; },
  connections?: SCPConnection[],
  activities?: Activity[],
  activityIdsToBeDeleted?: number[],
  isPublic?: boolean,
  isPublished?: boolean,
  public?:boolean,
  status?:string,
  outcomes?: Outcome[],
  
  changes?:LLDataChanges|null
}
