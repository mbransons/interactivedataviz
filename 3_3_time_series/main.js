// set margins, width/height
const margin = { left: 80, right: 10, top: 50, bottom: 70 };
const width = 600 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

// declare data variable to assign value after data call
let data;

// use viewBox rather than x and y values so that a aspect ratio is set and the visualization can be responsively scaled
const svg = d3
  .select('#chart-area')
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

// Labels
// Title top-center
const chartTitle = g
  .append('text')
  .attr('class', 'x axis-label')
  .attr('x', width / 2)
  .attr('y', -10)
  .attr('font-size', '15px')
  .attr('font-family', 'sans-serif')
  .attr('text-anchor', 'middle')
  .text('Country population data');

// Legend Group bottom-right
const legend = g
  .append('g')
  .attr('transform', `translate(${width - 10}, ${height - 150})`);

// X Axis bottom-center
const xLabel = g
  .append('text')
  .attr('class', 'x axis-label')
  .attr('x', width / 2)
  .attr('y', height + 50)
  .attr('font-size', '10px')
  .attr('font-family', 'sans-serif')
  .attr('text-anchor', 'middle')
  .text('Year');

// Y Axis label left-center-rotated
const yLabel = g
  .append('text')
  .attr('class', 'y axis-label')
  .attr('x', -(height / 2))
  .attr('y', -60)
  .attr('font-size', '10px')
  .attr('font-family', 'sans-serif')
  .attr('text-anchor', 'middle')
  .attr('transform', 'rotate(-90)')
  .text('Population');

/* APPLICATION STATE */
let state = {
  data: [],
  selection: 'All', // + YOUR FILTER SELECTION
};

/* LOAD DATA */
// + SET YOUR DATA PATH
d3.csv('../data/populationOverTime.csv', (d) => {
  // use custom initializer to reformat the data the way we want it
  // ref: https://github.com/d3/d3-fetch#dsv
  return {
    // year: new Date(+d.Year, 0, 1),
    // country: d.Entity,
    // population: +d.Population
  };
}).then((data) => {
  console.log('loaded data:', data);
  state.data = data;
  init();
});

/* INITIALIZING FUNCTION */
// this will be run *one time* when the data finishes loading in
function init() {
  // + SCALES

  // + AXES

  // + UI ELEMENT SETUP

  // + CREATE SVG ELEMENT

  // + CALL AXES

  draw(); // calls the draw function
}

/* DRAW FUNCTION */
// we call this every time there is an update to the data/state
function draw() {
  // + FILTER DATA BASED ON STATE
  const filteredData = state.data;
  // .filter(d => d.country === state.selection)

  // + UPDATE SCALE(S), if needed

  // + UPDATE AXIS/AXES, if needed

  // UPDATE LINE GENERATOR FUNCTION

  // + DRAW LINE AND/OR AREA
}
