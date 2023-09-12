import { Input } from "@angular/core";
import { Component } from "@angular/core";
import {SelectionModel} from '@angular/cdk/collections';
import {FlatTreeControl} from '@angular/cdk/tree';
//import {Injectable} from '@angular/core';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';
import {BehaviorSubject} from 'rxjs';
import {MatTreeModule} from '@angular/material/tree';
import {CollectionViewer, DataSource} from "@angular/cdk/collections";
import { Collection } from "typescript";
import { ValueContainerComponent } from "./value-container-component";
import { RuntimeObjectsService } from "../Service/runtimeobjects.service";
/**
 * Node for to-do item
 */
export class TodoItemNode {
  children: TodoItemNode[] = [];
  item: string = "";
  id:number = -1;
  sum:number = 0;
}

/** Flat to-do item node with expandable and level information */
export class TodoItemFlatNode {
  item: string = "";
  level: number = -1;
  expandable: boolean = false;
  id:number = -1;
  sum:number = 0;
}

@Component({
    selector: 'options-tree',
    templateUrl: './options-tree.component.html',
    styleUrls:['../style/options-tree.css', '../style/tool-filter-holder.css']
  })
  
  export class OptionsTree implements ValueContainerComponent{
  @Input() nodes:any = null;
  @Input() name:string = "";
  @Input() description: string = "";

  _parent:any = null;
  labelMap:any = null;
  currentFilters:any = {};
  _toggleable:boolean = false;
  containsInitialData:boolean = false;
  _id:number = -1;
  initialFlatNodeList:TodoItemFlatNode[] = [];
  initialFilters:any = {};
  isReadOnly: boolean = false;
  public showingAmounts:boolean = true;

  @Input() 
  public set parent(p: any) {
    this._parent = p;   
    this._parent.addChild(this);   
    if(this._parent._parent !== undefined && this._parent._parent !== null){
        this.currentFilters = this._parent._parent.getCurrentFilters();
    }
  }

  @Input() 
  public set setData(data: any) {
    this.nodes = data;

    if(this.nodes.selected !== undefined){
      this.currentFilters = { ... this.nodes.selected };
      this.initialFilters =  this.copyFilters(this.currentFilters);
      //console.log(this.initialFilters)
      this.containsInitialData = true;
    }
    else{
      this.initialFilters = {};
    }
  }

  private copyFilters(f:any){
      let clone:any = {};
      let keys = Object.keys(f);
      for(let i = 0;i<keys.length;i++){
        clone[keys[i]] = [];
        let l = f[keys[i]];
        for(let j = 0;j<l.length;j++){
          clone[keys[i]].push(l[j]);
        }
      }
      return clone;

  }


  @Input()
  public set setFilters(filters:any){
    this.currentFilters = filters;
  }

  @Input()
  public set toggleable(toggleable: boolean) {
      this._toggleable = toggleable;
  }

  @Input()
  public set id(_id: number) {
      this._id = _id;
  }

  @Input() set showAmounts(b:boolean){
    this.showingAmounts = b;
}

  amountOfNodes:number = 0;

  options:any = {};
  /** Map from flat node to nested node. This helps us finding the nested node to be modified */
  flatNodeMap = new Map<TodoItemFlatNode, TodoItemNode>();

  /** Map from nested node to flattened node. This helps us to keep the same object for selection */
  nestedNodeMap = new Map<TodoItemNode, TodoItemFlatNode>();

  /** A selected parent node to be inserted */
  selectedParent: TodoItemFlatNode | null = null;

  selectedNodes:TodoItemFlatNode[] = [];
  
  /** The new item's name */
  newItemName = '';

  treeControl: FlatTreeControl<TodoItemFlatNode>;

  treeFlattener: MatTreeFlattener<TodoItemNode, TodoItemFlatNode>;

  dataSource: MatTreeFlatDataSource<TodoItemNode, TodoItemFlatNode>;

  /** The selection for checklist */
  checklistSelection = new SelectionModel<TodoItemFlatNode>(true /* multiple */);

  openNodes:any = {};

  finishedLoading:boolean = false;
  openNodePathCounter =  0;

  initialized:boolean = false;

  selectedTrees:any = {};

  constructor(private runtimeObjectsService:RuntimeObjectsService) {
      this.openNodes = this.runtimeObjectsService.getRuntimeObject("tree");
      this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel,
      this.isExpandable, this.getChildren);
      this.treeControl = new FlatTreeControl<TodoItemFlatNode>(this.getLevel, this.isExpandable);
      this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener); 
  }
  reset(): void {
    throw new Error("Method not implemented.");
  }
  
  save(): void {

  }

  @Input() set setReadonly(isReadonly:boolean){
    this.isReadOnly = isReadonly;
}

  valueHasChanged(): boolean {
    let keysInit = Object.keys(this.initialFilters);
    let keysCurrent = Object.keys(this.currentFilters);

/*    console.log(this.initialFilters);
    console.log(this.currentFilters);
    console.log(this.initialFilters === this.currentFilters)*/
    if(keysInit.length !== keysCurrent.length){
      return true;
    }
    for(let i = 0;i<keysCurrent.length;i++){
         let k = keysCurrent[i];
/*         console.log(k);
         console.log(this.initialFilters);
         console.log(this.initialFilters[k]);
         */
         if(this.initialFilters[k] === undefined){
           if(this.currentFilters[k].length === 0){
             continue;
           }
           return true;
         }
         let idListInit = this.initialFilters[k];
         let idListCurrent = this.currentFilters[k];
         if(idListInit.length !== idListCurrent.length){
          //console.log("|A")
          return true;
         }
         for(let j = 0;j<idListInit.length;j++){
             if(idListCurrent.indexOf(idListInit[j]) === -1){
            //   console.log("|B")
               return true;
             }
         }
    }
    return false;
  }

    ngAfterViewInit() {
    //  alert("ngAfterViewInit")
  //    setTimeout(()=>{
        for(let i = 0;i<this.initialFlatNodeList.length;i++){
          this.calculateSelectedTrees(true, this.initialFlatNodeList[i]);
        }  
//      },3000);
    }

  openParentNode(node:TodoItemFlatNode){
      let isOpen:boolean =  this.treeControl.isExpanded(node);
      if(!isOpen){
        this.treeControl.expand(node);
      }
      let parent = this.getParentNode(node);
      if(parent === null || parent === undefined) {
          if(this.openNodePathCounter - 1 === 0){
            this.openNodePathCounter--;
            this.finishedLoading = true;
            return;
          }
          this.openNodePathCounter--;
          return;
      }   
      isOpen =  this.treeControl.isExpanded(parent);
      if(!isOpen){
        this.treeControl.expand(parent); 
      }
      this.openParentNode(parent);
      
  }

  initializeTree(){
    this.openNodePathCounter = this.selectedNodes.length;
    if(this.openNodePathCounter === 0 ){
      this.finishedLoading = true;
      return;
    }
    // console.log(this.openNodePathCounter);

     for(let i = 0;i<this.selectedNodes.length;i++){
         this.openParentNode(this.selectedNodes[i]);
    }
  }

  private storeSelectedNodes(){
    if(this.selectedNodes.length === 0) return;

    let selectedChanges = [];

    for(let i:number = 0;i<this.selectedNodes.length;i++){

        selectedChanges.push({
          id:this.selectedNodes[i].id,
          value:this.selectedNodes[i].item.split("(")[0],
          attributeName:this.nodes.attribute [ this.selectedNodes[i].level] ,                
        });
        this.treeControl.expand(this.selectedNodes[i]);
    }

    this.runtimeObjectsService.storeValue("selectedAttributes",selectedChanges);
    this.runtimeObjectsService.triggerAndForgetForever("selectedAttributes");
    
  }

  log(node: TodoItemFlatNode){
      let id:number = node.id;
      if(id in this.openNodes){
          delete this.openNodes[id];
      }
      else{
        this.openNodes[id] = 1;
     }
  }

  ngOnInit(){
    this.labelMap = this.nodes.mappedAttributes;
    let flatTree:TodoItemNode[] = this.buildTree(this.nodes.data, 0);
    if(flatTree.length > 1){
        let children = flatTree;
        children.sort((one, two) => (one.item > two.item ? 1 : -1));
        flatTree = children;
    }
    this.dataSource.data = flatTree;
    this.initializeTree();
  }

  buildTree(obj:{[key: string]: any}, level: number): TodoItemNode[]{
    let list =  Object.keys(obj).reduce<TodoItemNode[]>((accumulator, key) => {
      const value = obj[key];
      const node = new TodoItemNode();
      node.item =  this.labelMap[ key ] ;
      node.id = parseInt(key);
      this.amountOfNodes ++;
      if (value != null) {
        if (typeof value === 'object') {
          node.children = this.buildTree(value, level + 1);
          let s:number = 0 ;
          for(let i:number = 0;i<node.children.length;i++){

              if(typeof value[node.children[i].id] === 'number'){
                s += value[node.children[i].id];
              }
              else{
                s += node.children[i].sum;
              }
          }
          node.sum = s;
          node.item = this.labelMap[key] + ( this.showingAmounts ? "(" + s + ")" : "");
        } else {
          node.item =  this.labelMap[ key ]+ ( this.showingAmounts ? "("+ value + ")" : "" );            
        }
      }
      return accumulator.concat(node);
    }, []);

    for(let i = 0;i<list.length;i++){
         if(list[i].children.length > 1){
              let children = list[i].children;
              children.sort((one, two) => (one.item > two.item ? 1 : -1));
              list[i].children = children;              
         }
    }
    return list;
  }

  getLevel = (node: TodoItemFlatNode) => node.level;

  isExpandable = (node: TodoItemFlatNode) => node.expandable;

  getChildren = (node: TodoItemNode): TodoItemNode[] => node.children;

  hasChild = (_: number, _nodeData: TodoItemFlatNode) => _nodeData.expandable;

  hasNoContent = (_: number, _nodeData: TodoItemFlatNode) => _nodeData.item === '';

  public isToggled(){
    let key = "tree"+this._id;
    let value = this.runtimeObjectsService.getValue(key);
    if(value === null) return false;
    if(value.toggle === undefined) return false;

    return value.toggle;   
  }

  public toggleTree(){
       let key = "tree"+this._id;
       let value = this.runtimeObjectsService.getValue(key);
       if(value === null){
           let settings:any = {};
           settings.toggle = true;
           this.runtimeObjectsService.storeValue(key, settings);
/*           console.log("storing info for "+key);
           console.log(settings);*/
       }
       else{
        if(value.toggle === undefined){
            value.toggle = true;
            this.runtimeObjectsService.storeValue(key, value);
        }
        else{
            value.toggle = !value.toggle;
            this.runtimeObjectsService.storeValue(key, value);
        }
     }

  }

  /**
   * Transformer to convert nested node to flat node. Record the nodes in maps for later use.
   */

  transformer = (node: TodoItemNode, level: number) => {

    const existingNode = this.nestedNodeMap.get(node);
    const flatNode = existingNode && existingNode.item === node.item
        ? existingNode
        : new TodoItemFlatNode();
    flatNode.item = node.item;
    flatNode.level = level;
    flatNode.id = node.id;
    flatNode.expandable = !!node.children?.length;
    let key:string = this.nodes.attribute[level] ;
    let isAdded:boolean = false;
    if(key in this.currentFilters){
        if(this.currentFilters.length !== 0 ) {
            let index = this.currentFilters[key].indexOf(node.id);
            if(index !== -1){
              this.checklistSelection.select(flatNode);  
              this.selectedNodes.push(flatNode);          
              this.initialFlatNodeList.push(flatNode);
              isAdded = true;
            }
        }
    }
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    if(node.id in this.openNodes){
        this.treeControl.expand(flatNode);
    }

    if(this.flatNodeMap.size === this.amountOfNodes && this.initialized === false){
        this.initialized = true;
        this.storeSelectedNodes();
    }
    return flatNode;
  }

  /** Whether all the descendants of the node are selected. */
  descendantsAllSelected(node: TodoItemFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected = descendants.length > 0 && descendants.every(child => {
      return this.checklistSelection.isSelected(child);
    });
    return descAllSelected;
  }

  /** Whether part of the descendants are selected */
  descendantsPartiallySelected(node: TodoItemFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const result = descendants.some(child => this.checklistSelection.isSelected(child));
    return result && !this.descendantsAllSelected(node);
  }

  /** Toggle the to-do item selection. Select/deselect all the descendants node */
  todoItemSelectionToggle(node: TodoItemFlatNode): void {
    this.checklistSelection.toggle(node);
    const descendants = this.treeControl.getDescendants(node);
    this.checklistSelection.isSelected(node)
      ? this.checklistSelection.select(...descendants)
      : this.checklistSelection.deselect(...descendants);

    // Force update for the parent
    descendants.forEach(child => this.checklistSelection.isSelected(child));
    this.checkAllParentsSelection(node);
  }

  /** Toggle a leaf to-do item selection. Check all the parents to see if they changed */
  todoLeafItemSelectionToggle(node: TodoItemFlatNode): void {    
    //this.todoItemSelectionToggle(node);
    //alert(node.id);
    let parent:any = this.getParentNode(node);
    this.checklistSelection.toggle(node);
    this.checkAllParentsSelection(node);
//    console.log(node);
    this.triggerChange(node);
  }

  
  /** Toggle a leaf to-do item selection. Check all the parents to see if they changed */
  todoLeafItemSelectionToggleOnly(node: TodoItemFlatNode): void {    
    let parent:any = this.getParentNode(node);
    this.checklistSelection.toggle(node);
    this.checkAllParentsSelection(node);
  }

  getValue(){
    return {  name: this.nodes.attribute.join(","),
              options: this.selectedTrees,
              type:"tree"
    };
}

private calculateSelectedTrees(added:boolean,node: TodoItemFlatNode){
  let maxLevels = this.nodes.attribute.length - 1;
/*  console.log("calculate selected trees");
  console.log(node);*/
  if(node.level === maxLevels && added === true){        
        let parent = this.getParentNode(node);
        let tmp = [];
  /*      if(parent === null){
          console.log("null parent")
        }*/
        while(parent !== null){
              tmp.push(parent.id);
              //console.log(parent.id);
              parent = this.getParentNode(parent);
        }
        //console.log("end")

        let o:any = {};
        let i:number = tmp.length - 1;
        let p:number = -1;
        let k:number = -1;

        let path:any = {};
        while(i >= 0){
          k = tmp[tmp.length - 1];
          tmp = tmp.slice(0,-1);

          if(p === -1){
            o[k] = -1;
            p = k;
          }
          else{
            o[p] = k;
          }
          i--;
        }

        path[node.id] = o;
        this.selectedTrees[node.id] = o;
    //    console.log(this.selectedTrees);

  }
  else if(node.level === maxLevels && added === false){
    delete this.selectedTrees[node.id];
  }
}

  triggerChange(node: TodoItemFlatNode){

    
    let key:string = this.nodes.attribute[node.level] ;
    //console.log(node);
   // console.log(key);
    let added:boolean = false;
    if(key in this.currentFilters){
      let index:number = this.currentFilters[key].indexOf(node.id);
        if(index  === -1){
            this.currentFilters[key].push(node.id);
            added = true;
        }
        else{
            this.currentFilters[key].splice(index, 1);
        }
    }   
    else{
        this.currentFilters[key] = [node.id];
        added = true;
      }
    let _value:string = node.item;
    if(_value.indexOf("(") !== -1){
      _value = _value.split("(")[0];
    }

    this.runtimeObjectsService.storeRuntimeObject("tree",this.openNodes);
   // console.log(this.nodes.attribute[node.level]);
    //console.log(node.id);
    this.calculateSelectedTrees(added, node);

    this._parent.triggerChange({
      name:this.nodes.attribute[node.level],
      options:this.currentFilters[key],
    },
    {
      id:node.id,
      value:_value,
      attributeName:this.nodes.attribute[node.level],
      added:added
    });
}

  /* Checks all the parents when a leaf node is selected/unselected */
  checkAllParentsSelection(node: TodoItemFlatNode): void {
    let parent: TodoItemFlatNode | null = this.getParentNode(node);
    while (parent) {
      this.checkRootNodeSelection(parent);
      parent = this.getParentNode(parent);
    }
  }

  /** Check root node checked state and change it accordingly */
  checkRootNodeSelection(node: TodoItemFlatNode): void {
    const nodeSelected = this.checklistSelection.isSelected(node);
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected = descendants.length > 0 && descendants.every(child => {
      return this.checklistSelection.isSelected(child);
    });
    if (nodeSelected && !descAllSelected) {
      this.checklistSelection.deselect(node);
    } else if (!nodeSelected && descAllSelected) {
      this.checklistSelection.select(node);
    }
  }

  hasChildren(node: TodoItemFlatNode):boolean{
    const descendants = this.treeControl.getDescendants(node);
    return descendants.length !== 0;
  }

  /* Get the parent node of a node */
  getParentNode(node: TodoItemFlatNode): TodoItemFlatNode | null {
    const currentLevel = this.getLevel(node);

    if (currentLevel < 1) {
      return null;
    }
    if(this.treeControl.dataNodes === undefined){
     // console.log(this.treeControl.dataNodes);
      return null;
    }
    
    const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;

    for (let i = startIndex; i >= 0; i--) {
      const currentNode = this.treeControl.dataNodes[i];

      if (this.getLevel(currentNode) < currentLevel) {
        return currentNode;
      }
    }
    return null;
  }

  update(){
     this.nodes = null;
  }
}