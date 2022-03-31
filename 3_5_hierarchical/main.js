/**
 * CONSTANTS AND GLOBALS
 * */
// set margins, width/height
const margin = { left: 0, right: 0, top: 0, bottom: 0 };
const width = 600 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

// declare data variable to assign value after data call
let data;

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
let state = {};
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
  root = d3.hierarchy(state.data).sum((d) => d.value);
  draw(); // calls the draw function
}

/**
 * DRAW FUNCTION
 * we call this every time there is an update to the data/state
 * */
function draw() {}
