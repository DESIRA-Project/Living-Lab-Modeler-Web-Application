import * as d3 from 'd3';

export class HierarchicalEdgeBundling {

  colorNone = '#bbb';
  highlightArcColor = '#aaa';
  width = 1000;
  radius = this.width / 4;
  delimiter: string;
  tree: any;
  line: any;
  root: any;
  data: any;
  config: any;
  static clickedOn = false;
  connectionDescriptions?: {[index: string]: string};


  constructor(data: any, delimiter = '.', config: any, connectionDescriptions?: {[index: string]: string}) {
    this.data = data;
    this.delimiter = delimiter;
    this.config = config;
    this.connectionDescriptions = connectionDescriptions;

    if (this.data.length <= 0) {
      return;
    }

    this.tree = d3.cluster()
      .size([2 * Math.PI, this.radius - 100]);

    this.line = d3.lineRadial()
      .curve(d3.curveBundle.beta(0.166))
      .radius((d: any) => d.y)
      .angle((d: any) => d.x);

    this.root = this.tree(this.bilink(d3.hierarchy(this.hierarchy(this.data))));

  }

  redraw(data:any, graphId:any, descriptionTextId:any){

    if (data.length <= 0) {
      return;
    }
    this.data = data;

    let e = document.getElementById(graphId);
    if(e){
      e.innerHTML = '';
    }

    this.tree = d3.cluster()
      .size([2 * Math.PI, this.radius - 100]);

    this.line = d3.lineRadial()
      .curve(d3.curveBundle.beta(0.166))
      .radius((d: any) => d.y)
      .angle((d: any) => d.x);

    this.root = this.tree(this.bilink(d3.hierarchy(this.hierarchy(this.data))));
    this.draw(graphId, descriptionTextId);
  }

  draw(figureId: any, descriptionTextId: any): void {

    const self = this;

    if (this.data.length <= 0) {
      return;
    }

    const svg = d3.select('figure#' + figureId)
      .append('svg')
      // @ts-ignore
      .attr('viewBox', [-this.width / 2, -this.width * (3 / 8) , this.width, this.width * (3 / 4) ])
      .attr('style', 'height: 100%; width: 100%;');

    const arcInnerRadius = this.radius - 95;
    const arcWidth = 20;
    const arcOuterRadius = arcInnerRadius + arcWidth;
    const arc = d3
      .arc()
      .innerRadius(arcInnerRadius)
      .outerRadius(arcOuterRadius)
      .startAngle((d: any) => d.start)
      .endAngle((d: any) => d.end);


    // const colors = this.config.colors;
    const colors: any = {
      Socio: 'var(--red-400)',
      Physical: 'var(--green-300)',
      Cyber: 'var(--blue-400)'
    };

    const leafGroups = d3.groups(this.root.leaves(), (d: any) => d.parent.data.name);


    const arcData = leafGroups.map(g => {
        return ({
          name: g[0].toUpperCase(),
          color: colors[g[0]],
          start: d3.min(g[1], (d: any) => d.x),
          end: d3.max(g[1], (d: any) => d.x)
        });
      }
    );

    let gap;
    if (arcData.length === 1) {
      console.log(arcData);
      gap = 0.05;
      arcData[0].start = 0 + gap / 2;
      arcData[0].end = 2 * Math.PI - gap / 2;
    }
    else {
      gap = arcData[1].start - arcData[0].end - 0.05;
      for (const item of arcData) {
        item.start = item.start - gap / 2;
        item.end = item.end + gap / 2;
      }
    }

    const arcs = svg
      .selectAll('g')
      .data(arcData)
      .join('g')
      .append('path')
      .attr('id', (d, i) => `arc_${i}`)
      // @ts-ignore
      .attr('d', (d) => arc({start: d.start, end: d.end}))
      .attr('fill', d => d.color);


    const arcLabels = svg
      .selectAll('g')
      .data(arcData)
      .join('g')
      .append('text')
      .attr('font-family', 'sans-serif')
      .attr('font-size', '1rem')
      .attr('font-weight', 'lighter')
      .attr('fill', '#fff')
      .attr('letter-spacing', '3px')
      .attr('text-anchor', 'middle')
      .attr('dx', d => Math.round((d.end - d.start) * 90))
      .attr('dy', () => ((arcOuterRadius - arcInnerRadius) * 0.8)) // Move the text down
      .append('textPath')
      .attr('xlink:href', (d, i) => `#arc_${i}`)
      .text((d, i) => ((d.end - d.start) < (12 * Math.PI / 180)) ? '' : d.name); // 12 degrees min arc length for label to apply


    const node = svg.append('g')
      .attr('font-family', 'sans-serif')
      .attr('font-size', '1rem')
      .selectAll('g')
      .data(this.root.leaves())
      .join('g')
      .attr('transform', (d: any) => `rotate(${d.x * 180 / Math.PI - 90}) translate(${d.y},0)`)
      .on('mouseover', (e, d) => {
        HierarchicalEdgeBundling.clickedOn = false; nodeOnMouseover(e, d, colors);
      })
      .on('mouseout', (e, d) => {
        if (!HierarchicalEdgeBundling.clickedOn) { nodeOnMouseout(e, d); }
      })
      .on('click', (e, d) => {
        HierarchicalEdgeBundling.clickedOn = true; nodeOnMouseover(e, d, colors, false);
      });


    const nodeTitle = node.append('title')
      .text((d: any) => d.data.name);


    const text = node.append('text')
      .attr('dy', '0.31em')
      .attr('x', (d: any) => d.x < Math.PI ? 36 : -36)
      .attr('text-anchor', (d: any) => d.x < Math.PI ? 'start' : 'end')
      .attr('transform', (d: any) => d.x >= Math.PI ? 'rotate(180)' : null)
      .attr('fill', (d: any) => colors[d.parent.data.name])
      .attr('font-size', '1rem')
      .classed('node-text', true)
      .text((d: any) => d.data.name.length > 30 ? d.data.name.substring(0, 28) + '...' : d.data.name)
      .each(function(d: any): void { d.text = this; });


    const linkDefaultWidth = 6;
    const linkHighlightedWidth = 9;
    const link = svg.append('g')
      .attr('stroke', this.colorNone)
      .attr('stroke-width', linkDefaultWidth)
      .attr('fill', 'none')
      .selectAll('path')
      .data(this.root.leaves().flatMap((leaf: any) => leaf.outgoing))
      .join('path')
      .style('mix-blend-mode', 'normal')
      // @ts-ignore
      .attr('d', ([i, o]) => this.line(i.path(o)))
      .attr('cursor', 'pointer')
      .on('click', function(e: any, d: any) {
        HierarchicalEdgeBundling.clickedOn = true; linkOnMouseover(this, e, d, false);
      })
      .on('mouseover', function(e: any, d: any) {
        HierarchicalEdgeBundling.clickedOn = false; linkOnMouseover(this, e, d);
      })
      .on('mouseout', function(e: any, d: any) {
        if (!HierarchicalEdgeBundling.clickedOn) linkOnMouseout(this, e, d);
      })
      .each(function(d: any): void { d.path = this; });


    function linkOnMouseover(path: any, e: any, d: any, transition = true, transitionDuration = 400) {
      // Clear previous highlights
      d3.selectAll('.node-text').attr('font-weight', null);
      link.attr('stroke-width', linkDefaultWidth);

      d3.select(path)
        .raise()
        .attr('stroke', self.highlightArcColor)
        .attr('stroke-width', linkHighlightedWidth);
      d3.selectAll(d.map((d: any) => d.text))
        .attr('font-weight', 'bold');
      const text = self.connectionDescriptions?.[d[0].data.id + self.delimiter + d[1].data.id];
      if (text)
        showText(text, 'inherit', transition, transitionDuration);
    }

    function linkOnMouseout(path: any, e: any, d: any, transition = true, transitionDuration = 400) {
      d3.select(path)
        .attr('stroke', self.colorNone)
        .attr('stroke-width', linkDefaultWidth);
      d3.selectAll(d.map((d: any) => d.text))
        .attr('font-weight', null);
      hideText();
    }


    // tslint:disable-next-line:no-shadowed-variable
    function nodeOnMouseover(event: any, d: any, colors: any, transition = true, transitionDuration = 400): void {
      // Clear previous highlights
      d3.selectAll('.node-text').attr('font-weight', null);
      link.attr('stroke-width', linkDefaultWidth);

      link.style('mix-blend-mode', null);
      d3.select(d.text)
        .attr('font-weight', 'bold')
        .style('cursor', 'pointer');

      // tslint:disable-next-line:no-shadowed-variable
      const incoming = d3.selectAll(d.incoming.map((d: any) => d.path)).raise();
      if (transition) {
        incoming.transition().duration(transitionDuration).attr('stroke-width', linkHighlightedWidth);
      }
      else {
        incoming.attr('stroke-width', linkHighlightedWidth);
      }

      // @ts-ignore
      // tslint:disable-next-line:no-shadowed-variable
      d3.selectAll(d.incoming.map(([d]) => d.text))
        .attr('font-weight', 'bold');

      // tslint:disable-next-line:no-shadowed-variable
      const outgoing = d3.selectAll(d.outgoing.map((d: any) => d.path)).raise();
      if (transition) {
        outgoing.transition().duration(transitionDuration).attr('stroke-width', linkHighlightedWidth);
      }
      else {
        outgoing.attr('stroke-width', linkHighlightedWidth);
      }

      // @ts-ignore
      // tslint:disable-next-line:no-shadowed-variable
      d3.selectAll(d.outgoing.map(([, d]) => d.text))
        .attr('font-weight', 'bold');

      showText(d.data.description, colors[d.parent.data.name], transition, transitionDuration);
    }


    function nodeOnMouseout(event: any, d: any): void {
      link.style('mix-blend-mode', 'multiply');

      // Clear all highlights
      d3.selectAll('.node-text').attr('font-weight', null);
      link.interrupt().attr('stroke-width', linkDefaultWidth);

      hideText();
    }


    function showText(text: string, color: string, transition: boolean, transitionDuration: number) {
      const textDescription = d3.select('div#' + descriptionTextId)
        // tslint:disable-next-line:no-shadowed-variable
        .style('color', color);

      if (transition) {
        textDescription
          .style('opacity', 0)
          .html(text)
          .transition()
          .duration(transitionDuration)
          .style('opacity', 1);
      }
      else {
        textDescription.html(text);
      }
    }

    function hideText() {
      d3.select('div#' + descriptionTextId)
        .html(null);
    }

  }


  id(node: any): any {
    return `${node.parent ? this.id(node.parent) + this.delimiter : ''}${node.data.name}`;
  }


  bilink(root: any): any {
    const map = new Map(root.leaves().map((d: any) => [this.id(d), d]));
    for (const d of root.leaves()) {
      d.incoming = [];
      d.outgoing = d.data.connections.map((i: number) => [d, map.get(i)]);
    }
    for (const d of root.leaves()) {
      for (const o of d.outgoing)
      {
       o[1].incoming.push(o);
      }
    }
    return root;
  }

  instanceOfCharacter(s:string,c:number,delimiter:string):number{
       if(!s) return -1;
       if(c<=0) return -1;
       let count = 0;
       let last = -1;
       for(let i = 0;i<s.length;i++){
            if(s[i] === delimiter){
             // console.log(s[i])
              count++;
              last = i;
            }
            if(c === count) return i;
       }
       return last;
  }


  hierarchy(data: any, delimiter = this.delimiter): any {
    let root;
    const map = new Map();
    let inst = this;
    // tslint:disable-next-line:no-shadowed-variable
    data.forEach(function find(data: any): any {
      const {name} = data;
      if (map.has(name)) { return map.get(name); }
      const i = inst.instanceOfCharacter(name, 2, delimiter);//name.lastIndexOf(delimiter);
      map.set(name, data);
      if (i >= 0) {
        find({name: name.substring(0, i), children: []}).children.push(data);
        data.name = name.substring(i + 1);
      } else {
        root = data;
      }
      return data;
    });
    return root;
  }
}
