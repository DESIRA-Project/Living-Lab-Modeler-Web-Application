export interface Stakeholder {

  id: string;
  name: string;
  moderated: boolean;
  lastAddedAt: number | Date | null;
  iconUrl?:string;
  description: string | null;
  link: string | null;
  usesGlobalDescription:boolean;
  stakeholderDescription:string;
  usesGlobalLink:boolean;
  stakeholderLink:string;
  //role: string | null;
}
