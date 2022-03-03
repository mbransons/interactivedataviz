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
/* LOAD DATA */
d3.csv('../data/populationOverTime.csv', (d) => {
  return {
    year: parseYear(d.Year),
    country: d.Entity,
    population: +d.Population,
  };
}).then((data) => {
  console.log('data :>> ', data);

  // SCALES

  // CREATE SVG ELEMENT

  // BUILD AND CALL AXES

  // LINE GENERATOR FUNCTION

  // DRAW LINE
});
