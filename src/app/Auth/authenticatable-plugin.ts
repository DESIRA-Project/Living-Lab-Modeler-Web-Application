export interface AuthenticatablePlugin{
     authenticate(onSuccess:any, onFailure:any): Promise<void>;
     getPluginImage():string;
     getPluginImageHeight():number;
     getPluginImageWidth():number;     
     hasPluginImageHeight():boolean;
     hasPluginImageWidth():boolean;    
     isDisabled():boolean; 
     
}