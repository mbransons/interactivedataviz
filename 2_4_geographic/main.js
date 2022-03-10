// set margins, width/height
const margin = { left: 100, right: 20, top: 100, bottom: 50 };
const width = 800 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

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

//Scales
// Initially set ranges based on the visualization width/height
const projection = d3.geoAlbersUsa();

/**
 * LOAD DATA
 * Using a Promise.all([]), we can load more than one dataset at a time
 * */
Promise.all([
  d3.json('../data/usState.json'),
  d3.csv('../data/stateCapitals.csv', d3.autoType),
]).then(([geojson, capitals]) => {
  // SPECIFY PROJECTION
  projection.fitSize([width, height], geojson);

  // DEFINE PATH FUNCTION
  const path = d3.geoPath(projection);

  // APPEND GEOJSON PATH

  // APPEND DATA AS SHAPE
});
