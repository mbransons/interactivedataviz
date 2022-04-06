/**
 * CONSTANTS AND GLOBALS
 * */
// set margins, width/height
const margin = { left: 0, right: 0, top: 0, bottom: 0 };
const width = 600 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

// declare data variable to assign value after data call
let data, tooltip;

// use viewBox rather than x and y values so that a aspect ratio is set and the visualization can be responsively scaled
const svg = d3
  .select('#container')
  .append('svg')
  .attr(
    'viewBox',
    `0 0 ${width + margin.left + margin.right} ${
      height + margin.top + margin.bottom
    }`
  );

// Visualization
// offset a group based on margins so that height and width can be used when building scales
const g = svg
  .append('g')
  .attr('transform', `translate(${margin.left}, ${margin.top})`);
const background = g
  .append('rect')
  .attr('width', width)
  .attr('height', height)
  .attr('fill', '#eeeeee');

/**
 * APPLICATION STATE
 * */
let state = { data: null, hover: null };
let root;
const c = d3.scaleOrdinal(d3.schemeCategory10);

/**
 * LOAD DATA
 * */
d3.json('../data/flare.json', d3.autotype).then((data) => {
  state.data = data;
  init();
});

/**
 * INITIALIZING FUNCTION
 * this will be run *one time* when the data finishes loading in
 * */
function init() {
  const container = d3.select('#container').style('position', 'relative');
  root = d3
    .hierarchy(state.data) // children accessor
    .sum((d) => d.value) // sets the 'value' of each level
    .sort((a, b) => b.value - a.value);

  tooltip = container.append('div').attr('class', 'tooltip');

  // make treemap layout generator
  const tree = d3.treemap().size([width, height]).padding(1).round(true);

  // call our generator on our root hierarchy node
  tree(root); // creates our coordinates and dimensions based on the hierarchy and tiling algorithm

  // create g for each leaf
  const leaf = g
    .selectAll('g')
    .data(root.leaves())
    .join('g')
    .attr('transform', (d) => `translate(${d.x0},${d.y0})`);

  leaf
    .append('rect')
    .attr('fill', '#999999')
    .attr('stroke', '#000000')
    .attr('width', (d) => d.x1 - d.x0)
    .attr('height', (d) => d.y1 - d.y0);

  leaf
    .on('mouseenter', (e, d) => {
      state.hover = {
        position: [d.x0, d.y0],
        name: d.data.name,
        targetPos: [e.offsetX, e.offsetY],
        target: e.target,
        bbox: [e.target.getBBox().width / 2, e.target.getBBox().height / 2],
        matrix: [e.target.getScreenCTM().e, e.target.getScreenCTM().f],
      };
      draw();
      console.log(`state hover x,y: ${state.hover.targetPos}, 
                 state bbox:${state.hover.bbox}, 
                 state matrix: ${state.hover.matrix}`);
    })
    .on('mouseleave', () => {
      state.hover = null;
      draw();
    });
}

/**
 * DRAW FUNCTION
 * we call this every time there is an update to the data/state
 * */
function draw() {
  if (state.hover) {
    tooltip
      .html(`<div>${state.hover.name}</div`)
      .style('opacity', '0.9')
      .style(
        'transform',
        `translate(${state.hover.matrix[0]}px, ${state.hover.matrix[1]}px)`
      );
  }
}
