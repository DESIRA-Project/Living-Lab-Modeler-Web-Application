import { Stakeholder } from "./Stakeholder";
import { StakeholderRole } from "./StakeholderRole";

export interface LLStakeholder extends Stakeholder{
    role:StakeholderRole|null;
}