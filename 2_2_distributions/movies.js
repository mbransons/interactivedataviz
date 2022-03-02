// data source https://www.kaggle.com/sanjeetsinghnaik/top-1000-highest-grossing-movies/version/1

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
  .text('Gross');

let movieData;
//data key names
const sales = 'World Sales (in $)';
const date = 'Release Date';
const title = 'Title';
const desc = 'Movie Info';
const length = 'Movie Runtime';

const parseTime = d3.timeParse('%B %d, %Y');
const parseYear = d3.timeParse('%Y');
const formatYear = d3.timeFormat('%Y');
const parseTitle = (title) => title.slice(0, title.length - 7);
const parseDateFromTitle = (title) =>
  title.slice(title.length - 5, title.length - 1);
/* LOAD DATA */
d3.csv('../data/highest-grossing-1000-movies.csv', d3.autoType).then((data) => {
  console.log(data);
  movieData = data;
  movieData.forEach((movie) => {
    // movie[date] = parseTime(movie[date]);
    movie[date] = parseYear(parseDateFromTitle(movie[title]));
  });
  /* SCALES */
  const minDate = d3.min(data, (d) => d[date]);
  //   const minDate = parseTime('January 1, 1920');
  const maxDate = d3.max(data, (d) => d[date]);
  const minSales = d3.min(data, (d) => d[sales]);
  const maxSales = d3.max(data, (d) => d[sales]);
  console.log(`
  minDate: ${minDate} 
  maxDate: ${maxDate}
  minSales: ${minSales}
  maxSales: ${maxSales}`);
  const x = d3.scaleTime().domain([minDate, maxDate]).range([0, width]);
  const y = d3
    .scaleLog()
    .domain([70000000, maxSales])
    .range([height, 0])
    .base(10);

  const xAxisCall = d3.axisBottom(x).ticks(10).tickFormat(d3.timeFormat('%Y'));
  g.append('g')
    .attr('class', 'x axis')
    .attr('transform', `translate(0, ${height})`)
    .call(xAxisCall);

  const yAxisCall = d3
    .axisLeft(y)
    .ticks(10)
    .tickFormat((d) => d3.format('$,.3s')(d).replace(/G/, 'B'));
  g.append('g').attr('class', 'y axis').call(yAxisCall);

  const circles = g.selectAll('circle').data(data);
  circles
    .enter()
    .append('circle')
    .attr('class', 'circle')
    .attr('fill', '#ffff33')
    .attr('stroke', '#000000')
    .attr('stroke-width', '1')
    .attr('cx', (d) => x(d[date]))
    .attr('cy', (d) => y(d[sales]))
    .attr('r', 3);
});
