/* CONSTANTS AND GLOBALS */
const margin = { left: 80, right: 10, top: 100, bottom: 70 };
const width = 600 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;
const c = d3
  .scaleOrdinal()
  .domain(['R', 'D', 'I'])
  .range(['#e41a1c', '#377eb8', '#ffff33']);

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
const parseYear = d3.timeParse('%Y');
const formatTime = d3.timeFormat('%Y');
/* LOAD DATA */
d3.csv('../data/populationOverTime.csv', (d) => {
  return {
    year: parseYear(d.Year),
    country: d.Entity,
    population: +d.Population,
  };
}).then((data) => {
  console.log('data :>> ', data);

  /* SCALES */
  const x = d3
    .scaleTime()
    .domain(d3.extent(data, (d) => d.year))
    .range([0, width]);

  const y = d3
    .scaleLinear()
    .domain(d3.extent(data, (d) => d.population))
    .range([height, 0]);

  const xAxisCall = d3
    .axisBottom(x)
    .ticks(10)
    .tickFormat((d) => formatTime(d));
  g.append('g')
    .attr('class', 'x axis')
    .attr('transform', `translate(0, ${height})`)
    .call(xAxisCall);

  const yAxisCall = d3
    .axisLeft(y)
    .ticks(10)
    .tickFormat((d) => d);
  g.append('g').attr('class', 'y axis').call(yAxisCall);

  const line = d3
    .line()
    .x((d) => x(d.year))
    .y((d) => y(d.population));

  // CREATE SVG ELEMENT

  // BUILD AND CALL AXES

  // LINE GENERATOR FUNCTION
  // add line to chart
  g.selectAll('.line')
    .data([data])
    .join('path')
    .attr('class', 'line')
    .attr('fill', 'none')
    .attr('stroke', 'blue')
    .attr('d', line(data));
  // DRAW LINE
});
