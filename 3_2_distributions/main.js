/* CONSTANTS AND GLOBALS */
const selector = document.querySelector('select');
const margin = { left: 80, right: 100, top: 70, bottom: 50 };
const width = 900 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;
const selectEl = d3.select('#dropdown');

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
g.append('rect')
  .attr('width', width)
  .attr('height', height)
  .attr('fill', '#ededed');

//Scales
// Initially set ranges based on the visualization width/height
const x = d3.scaleLinear().range([0, width]);
const y = d3.scaleLinear().range([height, 0]);
const c = d3
  .scaleOrdinal()
  .domain(['R', 'D', 'I'])
  .range(['#e41a1c', '#377eb8', '#ffff33']);

/* APPLICATION STATE */
let state = {
  data: [],
  selectedParty: 'All', // + YOUR INITIAL FILTER SELECTION
};
let parties;

/* LOAD DATA */
d3.json('../data/environmentRatings.json', d3.autoType).then((raw_data) => {
  // + SET YOUR DATA PATH
  // save our data to application state
  state.data = raw_data;
  init();
});

/* INITIALIZING FUNCTION */
// this will be run *one time* when the data finishes loading in
function init() {
  // + SCALES

  x.domain(d3.extent(state.data, (d) => d.envScore2020));
  y.domain(d3.extent(state.data, (d) => d.ideologyScore2020));
  // + AXES
  const xAxisCall = d3
    .axisBottom(x)
    .ticks(10)
    .tickFormat((d) => d);
  g.append('g')
    .attr('class', 'x axis')
    .attr('transform', `translate(0, ${height})`)
    .call(xAxisCall);

  const yAxisCall = d3
    .axisLeft(y)
    .ticks(10)
    .tickFormat((d) => d);
  g.append('g').attr('class', 'y axis').call(yAxisCall);
  // + UI ELEMENT SETUP
  parties = [
    {
      key: 'All',
      val: 'All',
    },
    { key: 'D', val: 'Democrat' },
    { key: 'R', val: 'Republican' },
  ];

  selectEl
    .selectAll('option')
    .data(parties)
    .enter()
    .append('option')
    .attr('value', (d) => d.key)
    .text((d) => d.val);
  selectEl.on('change', draw);
  // + CREATE SVG ELEMENT

  // + CALL AXES

  draw(); // calls the draw function
}

/* DRAW FUNCTION */
// we call this every time there is an update to the data/state
function draw() {
  // + FILTER DATA BASED ON STATE
  state.selectedParty = selectEl.node().value;
  const filteredData = state.data.filter(
    (cp) => state.selectedParty === 'All' || state.selectedParty === cp.Party
  );
  // .filter(d => state.selectedParty === "All" || state.selectedParty === d.Party)

  const t = d3.transition().duration(1000).delay(500);

  const circles = g.selectAll('circle').data(filteredData);

  circles.exit().remove();

  circles
    .enter()
    .append('circle')
    .attr('class', 'circle')
    .attr('fill', '#000000')
    .attr('stroke', '#000000')
    .attr('stroke-width', '1')
    .attr('cx', 0)
    .attr('cy', height)
    .attr('r', 4)
    .merge(circles)
    .transition(t)
    .attr('fill', (d) => c(d.Party))
    .attr('cx', (d) => x(d.envScore2020))
    .attr('cy', (d) => y(d.ideologyScore2020));
}
