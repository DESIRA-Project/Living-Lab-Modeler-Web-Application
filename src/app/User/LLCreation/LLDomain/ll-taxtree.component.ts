import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, Input, OnDestroy } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { DynamicView } from 'src/app/ComponentLibrary/dynamic-view';
import { DirtyView } from 'src/app/Models/DirtyView';
import { Deepcopy } from 'src/app/Utils/deepcopy';
import { ChildComponent } from '../../Admin/LivingLabEntityManagement/child-component';
import { ParentComponent } from '../../Admin/LivingLabEntityManagement/parent-component';

export interface TaxNode {
    id: number;
    name: string;
    children: TaxNode[];
}

/** Flat node with expandable and level information */
interface FlatTaxNode {
    expandable: boolean;
    name: string;
    level: number;
    id: number;
}

/**
 * @title Tree with flat nodes
 */
@Component({
    selector: 'll-taxtree',
    templateUrl: 'll-taxtree.component.html',
    styleUrls: ['ll-taxtree.component.css']
})
export class LLTaxTreeComponent implements OnDestroy, ChildComponent, DirtyView {
    private data: any;
    ready = false;
    selectedNodes: { [level: number]: { [id: number]: boolean } } = {};
    parent: ParentComponent | null = null;
    hasInitialData: boolean = false;
    amountOfIndices: number = 0;
    indices: number[] = [];

    private _transformer = (node: TaxNode, level: number) => {
        return {
            expandable: !!node.children && node.children.length > 0,
            name: node.name,
            level: level,
            id: node.id
        };
    };

    reset(): boolean {
        this.hasInitialData = false;
        this.ready = false;
        this.selectedNodes = {};
        return true;
    }

    save(): boolean {
        this.parent?.storeValue("selectedTax", this.selectedNodes);
        return true;
    }


    isDirty(): boolean {

        //        console.log(this.selectedNodes)
        let keys = Object.keys(this.selectedNodes);
        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];
            let subtreeKeys = Object.keys(this.selectedNodes[parseInt(key)]);
            for (let j = 0; j < subtreeKeys.length; j++) {
                let value: boolean = this.selectedNodes[parseInt(key)][parseInt(subtreeKeys[j])];
                if (value) return true;
            }
        }
        return false;
    }


    @Input()
    public set setParent(parent: ParentComponent | null) {

        this.parent = parent;
        if (this.parent === null) return;
        let data = this.parent.getSharedDataContainer();

        this.parent.setChangeAwareChild(this);

        //if (data === undefined) return;
        let selectedTax = data.getSelectedTax();
        if (data && selectedTax && Object.keys(selectedTax).length > 0) {
            /*            console.log("There is a selection already");
                        console.log(data["selectedTax"]);*/
            this.selectedNodes = Deepcopy.copy( selectedTax );
            this.hasInitialData = true;
        }

        for (let i = 0; i < this.amountOfIndices; i++) {
            let subtree = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
            subtree.data = this.convertDataOnIndex(i);

            if(data.getOnTestMode()){
                this.treeControl.expandAll();
            }

            this.dataSources.push(subtree);
        }

    }

    treeControl = new FlatTreeControl<FlatTaxNode>(
        node => node.level,
        node => node.expandable,
    );

    treeFlattener = new MatTreeFlattener(
        this._transformer,
        node => node.level,
        node => node.expandable,
        node => node.children,
    );

    //dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);


    dataSources: any[] = [];


    //dataSources: any[] = [new MatTreeFlatDataSource(this.treeControl, this.treeFlattener), new MatTreeFlatDataSource(this.treeControl, this.treeFlattener), new MatTreeFlatDataSource(this.treeControl, this.treeFlattener)];


    @Input()
    public set setData(data: any) {
        this.data = data;
        this.amountOfIndices = this.data.data.domains.length;
        this.indices = Array(this.amountOfIndices).fill(0).map((x, i) => i);
    }

    isChecked(node: FlatTaxNode){
        let exists = this.selectedNodes[node.level][node.id];
        return exists === undefined ? false : exists;
    }

    public selectParents(node: FlatTaxNode) {
        //console.log(JSON.stringify( this.selectedNodes[node.level]) );
        let exists = this.selectedNodes[node.level][node.id];
        if(exists === false){
            delete this.selectedNodes[node.level][node.id];
        }
        this.save();
    }

    public convertData(): TaxNode[] {
        //domains
        let domains = this.data.data.domains;
        //subdomains
        let subdomains = this.data.data.subdomains;
        //app scenarios
        let appScenarios = this.data.data.applicationScenarios;

        let d: TaxNode[] = [];
        let domainMap: { [key: string]: TaxNode } = {};
        let subdomainMap: { [key: string]: TaxNode } = {};

        for (let i = 0; i < domains.length; i++) {
            let node = { id: domains[i].id, name: domains[i].name, children: [] } as TaxNode;
            d.push(node);
            domainMap[domains[i].id] = node;

            if (!this.hasInitialData) {
                if (this.selectedNodes[0] === undefined) {
                    this.selectedNodes[0] = {};
                }
                this.selectedNodes[0][domains[i].id] = false;
            }
        }


        for (let i = 0; i < subdomains.length; i++) {
            let parentId = subdomains[i].parentId;
            let p = domainMap[parentId];
            let node = { id: subdomains[i].id, name: subdomains[i].name, children: [] } as TaxNode;
            p.children.push(node);
            subdomainMap[subdomains[i].id] = node;

            if (!this.hasInitialData) {
                if (this.selectedNodes[1] === undefined) {
                    this.selectedNodes[1] = {};
                }

                this.selectedNodes[1][subdomains[i].id] = false;
            }
        }

        for (let i = 0; i < appScenarios.length; i++) {
            let parentId = appScenarios[i].parentId;
            let p = subdomainMap[parentId];
            let node = { id: appScenarios[i].id, name: appScenarios[i].name, children: [] } as TaxNode;
            p.children.push(node);

            if (!this.hasInitialData) {
                if (this.selectedNodes[2] === undefined) {
                    this.selectedNodes[2] = {};
                }

                this.selectedNodes[2][appScenarios[i].id] = false;
            }
        }


        this.ready = true;
        return d;
    }

    public convertDataOnIndex(index: number): TaxNode[] {
        //domains
        let domains = this.data.data.domains;
        //subdomains
        let subdomains = this.data.data.subdomains;
        //app scenarios
        let appScenarios = this.data.data.applicationScenarios;

        let d: TaxNode[] = [];
        let domainMap: { [key: string]: TaxNode } = {};
        let subdomainMap: { [key: string]: TaxNode } = {};

        let i: number = index;
        let node = { id: domains[i].id, name: domains[i].name, children: [] } as TaxNode;
        d.push(node);
        domainMap[domains[i].id] = node;

        if (!this.hasInitialData) {
            if (this.selectedNodes[0] === undefined) {
                this.selectedNodes[0] = {};
            }
            this.selectedNodes[0][domains[i].id] = false;
        }


        for (let i = 0; i < subdomains.length; i++) {
            let parentId = subdomains[i].parentId;
            let p = domainMap[parentId];
            let node = { id: subdomains[i].id, name: subdomains[i].name, children: [] } as TaxNode;
            if (!p) continue;
            p.children.push(node);
            subdomainMap[subdomains[i].id] = node;

            if (!this.hasInitialData) {
                if (this.selectedNodes[1] === undefined) {
                    this.selectedNodes[1] = {};
                }

                this.selectedNodes[1][subdomains[i].id] = false;
            }
        }

        for (let i = 0; i < appScenarios.length; i++) {
            let parentId = appScenarios[i].parentId;
            let p = subdomainMap[parentId];
            if (!p) continue;
            let node = { id: appScenarios[i].id, name: appScenarios[i].name, children: [] } as TaxNode;
            p.children.push(node);

            if (!this.hasInitialData) {
                if (this.selectedNodes[2] === undefined) {
                    this.selectedNodes[2] = {};
                }

                this.selectedNodes[2][appScenarios[i].id] = false;
            }
        }

        this.ready = true;
        return d;
    }

    constructor() {

    }
    setDisability(isDisabled: boolean): void {

    }
    ngOnDestroy(): void {
       // this.save();
    }

    hasChild = (_: number, node: FlatTaxNode) => node.expandable;
}
