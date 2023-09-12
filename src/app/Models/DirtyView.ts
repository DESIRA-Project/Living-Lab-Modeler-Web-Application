export interface DirtyView{
    isDirty():boolean;
    reset():boolean;
    save():boolean;
}