/* CONSTANTS AND GLOBALS */
const margin = { left: 80, right: 10, top: 100, bottom: 70 };
const width = 600 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

const svg = d3
  .select('#chart-area')
  .append('svg')
  .attr(
    'viewBox',
    `0 0 ${width + margin.left + margin.right} ${
      height + margin.top + margin.bottom
    }`
  );

const g = svg
  .append('g')
  .attr('transform', `translate(${margin.left}, ${margin.top})`);

// Labels
const chartTitle = g
  .append('text')
  .attr('class', 'x axis-label')
  .attr('x', width / 2)
  .attr('y', -50)
  .attr('font-size', '15px')
  .attr('font-family', 'sans-serif')
  .attr('text-anchor', 'middle')
  .text('Squirrely Data');

const xLabel = g
  .append('text')
  .attr('class', 'x axis-label')
  .attr('x', width / 2)
  .attr('y', height + 65)
  .attr('font-size', '16px')
  .attr('font-family', 'sans-serif')
  .attr('text-anchor', 'middle')
  .text('Activities');

const yLabel = g
  .append('text')
  .attr('class', 'y axis-label')
  .attr('x', -(height / 2))
  .attr('y', -40)
  .attr('font-size', '16px')
  .attr('font-family', 'sans-serif')
  .attr('text-anchor', 'middle')
  .attr('transform', 'rotate(-90)')
  .text('Count');

let squirrelData;

/* LOAD DATA */
// d3.autoType - detects datatypes and converts to the expected JS type
// eg: '34' becomes 34
d3.csv('../data/squirrelActivities.csv', d3.autoType).then((data) => {
  squirrelData = data;
  console.log('data', data);

  const squirrelActivities = squirrelData.map((d) => d.activity);
  const color = d3
    .scaleOrdinal()
    .domain(squirrelActivities)
    .range(d3.schemeCategory10);

  /* SCALES */
  const max = d3.max(data, (d) => d.count);
  const x = d3
    .scaleBand()
    .domain(squirrelActivities)
    .range([0, width])
    .paddingInner(0.3)
    .paddingOuter(0.2);

  const y = d3.scaleLinear().domain([0, max]).range([height, 0]);

  /* HTML ELEMENTS */
  /** Select your container and append the visual elements to it */
  const rects = g.selectAll('rect').data(squirrelData);

  rects
    .enter()
    .append('rect')
    .attr('y', (d) => y(d.count))
    .attr('x', (d) => x(d.activity))
    .attr('width', x.bandwidth)
    .attr('height', (d) => height - y(d.count))
    .attr('fill', (d) => color(d.activity));

  const xAxisCall = d3.axisBottom(x);
  g.append('g')
    .attr('class', 'x axis')
    .attr('transform', `translate(0, ${height})`)
    .call(xAxisCall)
    .selectAll('text')
    .attr('y', '10')
    .attr('x', '-25')
    .attr('text-achor', 'end')
    .attr('transform', 'rotate(-50)');

  const yAxisCall = d3
    .axisLeft(y)
    .ticks(10)
    .tickFormat((d) => d);
  g.append('g').attr('class', 'y axis').call(yAxisCall);
});
