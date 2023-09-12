import { SelectionModel } from "@angular/cdk/collections";
import { Component, Input, Type, ViewChild } from "@angular/core";
import { MatPaginator, PageEvent } from "@angular/material/paginator";
import { MatSort, Sort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { SCPEntitiesService } from "src/app/Service/SCPentities.service";
import { SCPEntity } from "./scp-entity";

export interface PaginationInfo {
  pageIndex: number;
  previousPageIndex: number;
  pageSize: number;
  length: number;
  sortField:string, direction:string
}

export interface PaginationConfig {
  info: PaginationInfo;
  acceptedSizeOptions: number[];
}

export interface QueryResult<T> {
  data: T[];
  paginationConfig: PaginationConfig;
}

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

export enum PaginationEventDirection {
  LEFT,
  RIGHT,
  LEFT_END,
  RIGHT_END
}

export interface TableRepresentation<T>{
  displayColumns:string[];
  displayData:QueryResult<T>;
}

@Component({
  selector: 'll-entity-table',
  templateUrl: './ll-entity-table.component.html',
  styleUrls: ['./ll-entity-table.component.css']
})
export class LivingLabEntityTableComponent<T> {

  data: TableRepresentation<T>|null = null;
  groupOptions: any = null;
  displayedColumns: string[] = [];//['select', 'name', 'description', 'group', 'actions'];
  public dataSource: any = null;
  selection: any = null;
  actions: any = [];
  ready = false;
  parentCB: Function = () => { };
  onDataChange: Function = () => { };
  onSortChange: Function = ()=>{};
  paginationConfig: PaginationConfig = {
    info: { pageIndex: 0, previousPageIndex: 0, length: 0, pageSize: 0 ,    sortField:"name",
    direction:"asc" },
    acceptedSizeOptions: []
  };
  resultsLength: number = 0;
  pageSize: number = 0;
  paginatorReady: boolean = false;
  pageIndex: number = 0;
  scpGroupToIcon: {[key: string]: string} = {
    'Cyber': 'settings_suggest',
    'Physical': 'eco',
    'Socio': 'groups'
  }

  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;
  @ViewChild(MatSort) sort: MatSort | undefined;

  @Input()
  set setGroupOptions(groupOptions: any) {
    this.groupOptions = groupOptions;
  }

  @Input()
  set setActions(actions: any) {
    this.actions = actions;
  }

  @Input()
  set setData(data: TableRepresentation<T>) {
    this.data = data;
    this.dataSource = new MatTableDataSource<T>(data.displayData.data);
    this.selection = new SelectionModel<SCPEntity>(true, []);
    this.displayedColumns = data.displayColumns;

    this.resultsLength = this.data.displayData.paginationConfig.info.length;
    this.paginationConfig = this.data.displayData.paginationConfig;
    this.pageSize = data.displayData.paginationConfig.info.pageSize
    this.pageIndex = data.displayData.paginationConfig.info.pageIndex;
    //console.log("Pagesize = " + this.pageSize + " Results length =" + this.resultsLength)
    this.ready = true;

  }

  @Input()
  set parentActionOnSelection(cb: Function) {
    this.parentCB = cb;
  }


  @Input()
  set parentActionOnPaginationChange(cb: Function) {
    this.onDataChange = cb;
  }

  @Input()
  set parentActionOnSortChange(cb: Function) {
    this.onSortChange = cb;
  }

  hasData():boolean{
       return this.dataSource && this.dataSource.data && this.dataSource.data.length > 0;
  }

  getColumnName(i:number):string{
    return this.displayedColumns[i];
  }

  getColumnNameFirstCapitalLetter(i:number){
    let columnName:string = this.getColumnName(i);
    return columnName.charAt(0).toUpperCase() + columnName.slice(1);
  }

  detectPaginatorClickDirection(totalPages: number, paginatorEvent: PageEvent): PaginationEventDirection {
    if (paginatorEvent.previousPageIndex && paginatorEvent.previousPageIndex > paginatorEvent.pageIndex && paginatorEvent.previousPageIndex === paginatorEvent.pageIndex + 1) {
      return PaginationEventDirection.LEFT;
    }
    else if (paginatorEvent.previousPageIndex && paginatorEvent.previousPageIndex > paginatorEvent.pageIndex && paginatorEvent.previousPageIndex > paginatorEvent.pageIndex + 1) {
      return PaginationEventDirection.LEFT_END;
    }
    else if (paginatorEvent.previousPageIndex && paginatorEvent.previousPageIndex < paginatorEvent.pageIndex && paginatorEvent.previousPageIndex + 1 === paginatorEvent.pageIndex) {
      return PaginationEventDirection.RIGHT;
    }
    return PaginationEventDirection.RIGHT_END;
  }

  announceSortChange(e:Sort){
    let field = e.active;
    let direction = e.direction;
    this.onSortChange(field, direction);
 }


  onPaginateChange(paginatorEvent: PageEvent) {
    let totalPages = this.pageSize !== 0 ? Math.floor(this.resultsLength / this.pageSize) - 1 : 0;
    if (paginatorEvent.pageSize !== this.pageSize) {
      this.onDataChange({ pageIndex: 0, previousPageIndex: 0, pageSize: paginatorEvent.pageSize, length: paginatorEvent.length } as PaginationInfo);
      return;
    }

    /*    console.log("Page Event")
        console.log(paginatorEvent);
    */
    let currentPage = this.paginationConfig.info.pageIndex;
    let p: PaginationInfo = {
      pageIndex: 0,
      previousPageIndex: 0,
      pageSize: 0,
      length: 0,
      sortField : this.getColumnName(1),
      direction:"asc"
    };
    let direction = this.detectPaginatorClickDirection(totalPages, paginatorEvent);

    switch (direction) {
      case PaginationEventDirection.RIGHT: {
        p = { sortField:this.data ? this.data?.displayData.paginationConfig.info.sortField : this.getColumnName(1),
              direction: this.data?this.data?.displayData.paginationConfig.info.direction : "asc", pageIndex: currentPage + 1, previousPageIndex: paginatorEvent.previousPageIndex === undefined ? 1 : currentPage, pageSize: paginatorEvent.pageSize, length: paginatorEvent.length };
        break;
      }
      case PaginationEventDirection.LEFT: {
        p = {sortField:this.data ? this.data?.displayData.paginationConfig.info.sortField : this.getColumnName(1),
          direction: this.data?this.data?.displayData.paginationConfig.info.direction : "asc",
          pageIndex: currentPage - 1, previousPageIndex: paginatorEvent.previousPageIndex === undefined ? 1 : currentPage, pageSize: paginatorEvent.pageSize, length: paginatorEvent.length };
        break;
      }
      case PaginationEventDirection.LEFT_END: {
        p = {
          sortField:this.data ? this.data?.displayData.paginationConfig.info.sortField : this.getColumnName(1),
              direction: this.data?this.data?.displayData.paginationConfig.info.direction : "asc",
          pageIndex: 0, previousPageIndex: 0, pageSize: paginatorEvent.pageSize, length: paginatorEvent.length };
        break;
      }
      case PaginationEventDirection.RIGHT_END: {
        p = {
          sortField:this.data ? this.data?.displayData.paginationConfig.info.sortField : this.getColumnName(1),
              direction: this.data?this.data?.displayData.paginationConfig.info.direction : "asc",
          pageIndex: paginatorEvent.pageIndex, previousPageIndex: paginatorEvent.pageIndex - 1, pageSize: paginatorEvent.pageSize, length: paginatorEvent.length };
        break;
      }

      default: break;
    }

    this.onDataChange(p);

  }

  public constructor() {

  }

  getColor(groupName: string): string {
    for (let i = 0; i < this.groupOptions.length; i++) {
      if (groupName === this.groupOptions[i].value) {
        return this.groupOptions[i].color;
      }
    }
    return "var(--red)";
  }

  handleSelection(e: any) {
    e.stopPropagation();
    // console.log(this.selection.selected.length);

  }

  ngAfterViewInit() {
    if(this.dataSource === null) {
      console.log("data source null");
      return;
    }
    this.dataSource.sort = this.sort;
    console.log("data source not null");

    if(!this.hasData()) return;
    if(this.data?.displayData.paginationConfig.info.direction){
      this.dataSource.sort.direction = this.data?.displayData.paginationConfig.info.direction;
      if(this.sort){
          this.sort.start = this.dataSource.sort.direction;
      }

    }
  }

  selectRow(row: PeriodicElement) {
    this.selection.toggle(row);
    this.updateParentForSelection();
  }

  updateParentForSelection() {
    let c = <SelectionModel<SCPEntity>>(this.selection);
    let ids: number[] = [];
    for (let i = 0; i < c.selected.length; i++) {
      ids.push(c.selected[i].id);
    }
    //console.log(c.selected)
    this.parentCB(ids);
  }

  getLimitAwareString(s: string, limit: number): string {
    if (s === null) return "";
    if (s.length > limit) { return s.substring(0, limit - 3) + "..."; }
    return s;
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  someAreSelected(){
    const numSelected = this.selection.selected.length;
    return numSelected !== 0;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      this.parentCB([]);
      return;
    }

/*    let selectedCount = 0;
    for(let i = 0;i<this.dataSource.data.length;i++){
      if(this.dataSource.data[i].labCount === 0){
        this.selection.select(this.dataSource.data[i]);
        selectedCount++;
      }
    }*/
//    this.selection.select(...this.dataSource.data);
  //  if(selectedCount > 0){
    this.selection.select(...this.dataSource.data);
        this.updateParentForSelection();
    //}
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: PeriodicElement): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

}
