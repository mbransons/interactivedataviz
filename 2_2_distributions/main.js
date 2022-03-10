/* CONSTANTS AND GLOBALS */
const margin = { left: 80, right: 10, top: 100, bottom: 70 };
const width = 700 - margin.left - margin.right;
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

/* LOAD DATA */
d3.json('../data/environmentRatings.json', d3.autoType).then((data) => {
  console.log(data);

  /* SCALES */
  const x = d3.scaleLinear().domain([0, 100]).range([0, width]);
  const y = d3.scaleLinear().domain([0, 1]).range([height, 0]);
  /* HTML ELEMENTS */

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

  const t = d3.transition().duration(1000).delay(500);

  const circles = g.selectAll('circle').data(data);

  // join version
  // circles.join((enter) =>
  //   enter
  //     .append('circle')
  //     .attr('class', 'circle')
  //     .attr('fill', '#000000')
  //     .attr('stroke', '#000000')
  //     .attr('stroke-width', '1')
  //     .attr('cx', 0)
  //     .attr('cy', height)
  //     .attr('r', 1)
  //     .transition(t)
  //     .attr('fill', (d) => c(d.Party))
  //     .attr('r', 6)
  //     .attr('cx', (d) => x(d.envScore2020))
  //     .attr('cy', (d) => y(d.ideologyScore2020))
  // );

  // separate enter call version
  circles
    .enter()
    .append('circle')
    .attr('class', 'circle')
    .attr('fill', '#000000')
    .attr('stroke', '#000000')
    .attr('stroke-width', '1')
    .attr('cx', 0)
    .attr('cy', height)
    .attr('r', 1)
    .transition(t)
    .attr('fill', (d) => c(d.Party))
    .attr('r', 6)
    .attr('cx', (d) => x(d.envScore2020))
    .attr('cy', (d) => y(d.ideologyScore2020));
});
