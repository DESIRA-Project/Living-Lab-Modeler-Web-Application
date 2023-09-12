import { SCPEntity } from "./scp-entity";

export interface PaginatedResponse{
    data:SCPEntity[];
    totalCount:number;
}