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
  .attr('class', 'x axis-label title')
  .attr('x', width / 2)
  .attr('y', -30)
  .attr('font-size', '15px')
  .attr('font-family', 'sans-serif')
  .attr('text-anchor', 'middle')
  .text('Top 1000 Grossing Hollywood Films');

const xLabel = g
  .append('text')
  .attr('class', 'x axis-label')
  .attr('x', width / 2)
  .attr('y', height + 40)
  .attr('font-size', '16px')
  .attr('font-family', 'sans-serif')
  .attr('text-anchor', 'middle')
  .text('Year');

const yLabel = g
  .append('text')
  .attr('class', 'y axis-label')
  .attr('x', -(height / 2))
  .attr('y', -60)
  .attr('font-size', '16px')
  .attr('font-family', 'sans-serif')
  .attr('text-anchor', 'middle')
  .attr('transform', 'rotate(-90)')
  .text('Gross (billions)');

let movieData;
//data key names
const sales = 'World Sales (in $)';
const date = 'Release Date';
const title = 'Title';
const desc = 'Movie Info';
const length = 'Movie Runtime';

const parseTime = d3.timeParse('%B %d, %Y');
const parseTitle = (title) => title.slice(0, title.length - 7);
/* LOAD DATA */
d3.csv('../data/highest-grossing-1000-movies.csv', d3.autoType).then((data) => {
  movieData = data;

  /* SCALES */
  const minDate = d3.min(data, (d) => parseTime(d[date]));
  const maxDate = d3.max(data, (d) => parseTime(d[date]));
  const minSales = d3.min(data, (d) => d[sales]);
  const maxSales = d3.max(data, (d) => d[sales]);
  console.log(`
  minDate: ${minDate} 
  maxDate: ${maxDate}
  minSales: ${minSales}
  maxSales: ${maxSales}`);
  const x = d3.scaleTime().domain([minDate, maxDate]).range([0, width]);
  const y = d3.scaleLinear().domain([minSales, maxSales]).range([height, 0]);
});
