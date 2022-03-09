// set margins, width/height
const margin = { left: 100, right: 10, top: 100, bottom: 50 };
const width = 800 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

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

//Scales
// Initially set ranges based on the visualization width/height
const x = d3.scaleLinear().range([0, width]);
const y = d3.scaleLinear().range([height, 0]);

// for setting radius values of circles between 5px - 25px
const r = d3.scaleLinear().range([5, 25]);

// for color based ordinal scales
const c = d3
  .scaleOrdinal()
  .range(['#984ea3', '#e41a1c', '#ffff33', '#377eb8', '#4daf4a', '#ff7f00']);

// Labels
// Title top-center
const chartTitle = g
  .append('text')
  .attr('class', 'x axis-label')
  .attr('x', width / 2)
  .attr('y', -50)
  .attr('font-size', '15px')
  .attr('font-family', 'sans-serif')
  .attr('text-anchor', 'middle')
  .text('Chart Title');

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
  .attr('font-size', '20px')
  .attr('font-family', 'sans-serif')
  .attr('text-anchor', 'middle')
  .text('X-Axis Label');

// Y Axis label left-center-rotated
const yLabel = g
  .append('text')
  .attr('class', 'y axis-label')
  .attr('x', -(height / 2))
  .attr('y', -60)
  .attr('font-size', '20px')
  .attr('font-family', 'sans-serif')
  .attr('text-anchor', 'middle')
  .attr('transform', 'rotate(-90)')
  .text('Y-Axis Label');

// Axis generator
// move to data call or update function if needs to be based on data
// X Axis
const xAxisCall = d3.axisBottom(x).ticks(3).tickFormat(d3.format('$,.2r'));
g.append('g')
  .attr('class', 'x axis')
  .attr('transform', `translate(0, ${height})`)
  .call(xAxisCall);

//Y Axis
const yAxisCall = d3
  .axisLeft(y)
  .ticks(3)
  .tickFormat((d) => d + ' years');
g.append('g').attr('class', 'y axis').call(yAxisCall);

// call data
d3.json('data/data.json').then((d) => {
  console.log(d);
  data = d;
  console.log(data);

  // set min/max values from data set
  // or set in update function
  let xMin, xMax, yMin, yMax, cMin, cMax, rMin, rMax;

  // set domains to your scales
  // or set in update function
  x.domain([xMin, xMax]);
  y.domain([yMin, yMax]);
  c.domain([cMin, cMax]);
  r.domain([Math.sqrt(rMin / Math.PI), Math.sqrt(rMax / Math.PI)]);

  // if dynamic use update function for data changes
  // update(data);
});

function update(data) {
  const t = d3.transition().duration(100);

  // create els and attach data
  // this example is for a scatter plot of circles
  const circles = g.selectAll('.circle').data(data, (d) => d.val);

  // EXIT old elements not present in new data
  circles.exit().remove();

  //first enter new elements present in new data
  circles
    .enter()
    .append('circle')
    .attr('class', 'circle')
    .attr('fill', (d) => c(d.val1))
    .attr('stroke', '#000000')
    .attr('stroke-width', '1')
    .merge(circles)
    .transition(t)
    .attr('cx', (d) => x(d.val2))
    .attr('cy', (d) => y(d.val3))
    .attr('r', (d) => r(Math.sqrt(d.val4 / Math.PI)));
}
