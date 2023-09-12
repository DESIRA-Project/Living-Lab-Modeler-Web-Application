export interface UserLivingLabMembership{
    firstName:string;
	lastName:string;
	userRole:string;
	isOwner:boolean;
}

export interface UserLivingLab{
    id:number;
    name:string;
    status:string;
    creatorId:number;
    created?:Date;
    description:string;
    focalQuestion:string;
    iconUrl:string | undefined;
    isPublic:boolean;
    llPermissions:string[];
    isActive:boolean;
    userHasPendingJoinRequest?: boolean;
    members?:UserLivingLabMembership[];
};
