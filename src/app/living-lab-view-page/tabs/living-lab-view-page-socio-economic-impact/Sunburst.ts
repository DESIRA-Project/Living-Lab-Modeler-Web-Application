// https://observablehq.com/@d3/sunburst

import * as d3 from 'd3';

export class Sunburst {

  public static draw(data: any, figureId: string, { // data is either tabular (array of objects) or hierarchy (nested objects)
    path = null, // as an alternative to id and parentId, returns an array identifier, imputing internal nodes
    id = Array.isArray(data) ? (d: { id: any; }) => d.id : null, // if tabular data, given a d in data, returns a unique identifier (string)
    parentId = Array.isArray(data) ? (d: { parentId: any; }) => d.parentId : null, // if tabular data, given a node d, returns its parent’s identifier
    children = (d: any) => d.children, // if hierarchical data, given a d in data, returns its children
    value = null, // given a node d, returns a quantitative value (for area encoding; null for count)
    sort = (a: any, b: any) => d3.descending(a.value, b.value), // how to sort nodes prior to layout
    label = null, // given a node d, returns the name to display on the rectangle
    title = null, // given a node d, returns its hover text
    link = null, // given a node d, its link (if any)
    linkTarget = "_blank", // the target attribute for links (if any)
    // @ts-ignore
    width = 640, // outer width, in pixels
    // @ts-ignore
    height = 400, // outer height, in pixels
    // @ts-ignore
    margin = 1, // shorthand for margins
    // @ts-ignore
    marginTop = margin, // top margin, in pixels
    // @ts-ignore
    marginRight = margin, // right margin, in pixels
    // @ts-ignore
    marginBottom = margin, // bottom margin, in pixels
    // @ts-ignore
    marginLeft = margin, // left margin, in pixels
    padding = 1, // separation between arcs
    radius = Math.min(width - marginLeft - marginRight, height - marginTop - marginBottom) / 2, // outer radius
    color = null, // color scheme, if any
    fill = "var(--background-color)", // fill for arcs (if no color encoding)
    fillOpacity = 0.6, // fill opacity for arcs
  } = {}) {

    // If id and parentId options are specified, or the path option, use d3.stratify
    // to convert tabular data to a hierarchy; otherwise we assume that the data is
    // specified as an object {children} with nested objects (a.k.a. the “flare.json”
    // format), and use d3.hierarchy.
    const root = d3.hierarchy(data, children);

    // Compute the values of internal nodes by aggregating from the leaves.
    // @ts-ignore
    value == null ? root.count() : root.sum((d: any) => Math.max(0, value(d)));

    // Sort the leaves (typically by descending value for a pleasing layout).
    if (sort != null) root.sort(sort);

    // Compute the partition layout. Note polar coordinates: x is angle and y is radius.
    d3.partition().size([2 * Math.PI, radius])(root);

    // Construct an arc generator.
    const arc = d3.arc()
      // @ts-ignore
      .startAngle(d => d.x0)
      // @ts-ignore
      .endAngle(d => d.x1)
      // @ts-ignore
      .padAngle(d => Math.min((d.x1 - d.x0) / 2, 2 * padding / radius))
      .padRadius(radius / 2)
      // @ts-ignore
      .innerRadius(d => d.y0)
      // @ts-ignore
      .outerRadius(d => d.y1 - padding);

    const svg = d3.select('figure#' + figureId)
      .append('svg')
      // @ts-ignore
      .attr("viewBox", [
        marginRight - marginLeft - width / 2,
        marginBottom - marginTop - height / 2,
        width,
        height
      ])
      .attr("width", width)
      .attr("height", height)
      .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("text-anchor", "middle");

    // Arc highlighting related functions
    let highlightedNodes: any;

    function onCellMouseover(node: any, e: any, d: any) {
      // Remove possible previous highlight
      highlightedNodes?.attr('filter', 'unset');

      // Compute descendant ids
      const descendantIds = d.descendants().map((d: any) => d.data.id);

      // Find nodes that are both active and descendant of current node
      highlightedNodes = cell.filter((d: any, i: number) => d.data.active && descendantIds.indexOf(d.data.id) > -1);

      // And highlight them
      highlightedNodes.attr('filter', 'drop-shadow(0px 0px 5px hsl(0, 0%, 60%))');
    }

    function onCellMouseout(node: any, e: any, d: any) {
      // Remove previous highlight
      highlightedNodes?.attr('filter', 'unset');
    }

    const cell = svg
      .selectAll("a")
      .data(root.descendants())
      .join("a")
      // @ts-ignore
      .attr("xlink:href", link == null ? null : d => link(d.data, d))
      // @ts-ignore
      .attr("target", link == null ? null : linkTarget)
      .on('mouseover', function(e: any, d: any) {onCellMouseover(this, e, d)})
      .on('mouseout', function(e: any, d: any) {onCellMouseout(this, e, d)});

    function colorFunc(d: any) {
      // @ts-ignore
      return color ? color(d.ancestors().reverse()[1]?.data.name, d.depth, d.data.active) : fill;
    }

    cell.append("path")
      // @ts-ignore
      .attr("d", arc)
      // @ts-ignore
      .attr("fill", colorFunc)
      .attr("fill-opacity", fillOpacity);

    if (label != null) cell
      // @ts-ignore
      .filter(d => (d.y0 + d.y1) / 2 * (d.x1 - d.x0) > 10)
      .append("text")
      // @ts-ignore
      .attr("transform", d => {
        // @ts-ignore
        if (!d.depth) return;
        // @ts-ignore
        const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
        // @ts-ignore
        const y = (d.y0 + d.y1) / 2;
        return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
      })
      .attr("dy", "0.32em")
      .attr("font-size", d => 10 - d.depth + "px")
      // @ts-ignore
      .text(d => label(d.data, d));

    if (title != null) cell.append("title")
      // @ts-ignore
      .text(d => title(d.data, d));

  }
}
