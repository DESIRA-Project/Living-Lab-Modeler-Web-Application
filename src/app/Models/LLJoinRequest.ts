export interface LLJoinRequest {
  id?: number;
  userId?: number;
  userFirstname?: string;
  userLastname?: string;
  livingLabId?: number;
  text?: string;
  llJoinRequestStatusName?: string;
  createdAt?: Date;
}
