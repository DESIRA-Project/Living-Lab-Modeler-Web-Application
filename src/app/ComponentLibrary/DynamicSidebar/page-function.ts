export interface PageFunction{
    name:string;
    desc:string;
    open?:boolean;
    scope?:string,
    url:string;
    breadcrumb_path?:any[];
    breadcrumb_label:string;
    permissions:string[];
    icon?:string;
    children?:PageFunction[];
    hidden?:boolean;
    openInNewTab?:boolean;
}
