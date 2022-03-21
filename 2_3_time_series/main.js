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

//Scales
// Initially set ranges based on the visualization width/height
const x = d3.scaleTime().range([0, width]);
const y = d3.scaleLinear().range([height, 0]);

//Line Generator
const line = d3
  .line()
  .x((d) => x(d.year))
  .y((d) => y(d.population));

const xAxisCall = d3
  .axisBottom(x)
  .ticks(10)
  .tickFormat((d) => formatTime(d));

//Y Axis
const yAxisCall = d3
  .axisLeft(y)
  .ticks(10)
  .tickFormat((d) => formatPop(d).replace(/G/, 'B'));

// Parsing tools
const parseYear = d3.timeParse('%Y');
const formatTime = d3.timeFormat('%Y');
const formatPop = d3.format('.3s');

let pop, meta, internet;

// Call Data
d3.csv('../data/populationOverTime.csv', (d) => {
  return {
    year: parseYear(d.Year),
    country: d.Entity,
    population: +d.Population,
  };
}).then((d) => {
  data = d;

  // set domains to your scales
  x.domain(d3.extent(data, (d) => d.year));
  y.domain(d3.extent(data, (d) => d.population));

  // Axis generators
  // X Axis

  g.append('g')
    .attr('class', 'x axis')
    .attr('transform', `translate(0, ${height})`)
    .call(xAxisCall);

  g.append('g').attr('class', 'y axis').call(yAxisCall);

  let curr, obj;
  // reduces data returning a new array of objects one per country
  // sample object structure
  // {country: name, data: [{year: date Obj, population: num}, {}, {}]}
  const sort = data.reduce((acc, val) => {
    if (curr === val.country) {
      acc
        .find((countryObj) => countryObj.country === val.country)
        .data.push({
          year: val.year,
          population: val.population,
        });
    } else {
      curr = val.country;
      obj = {};
      obj.country = val.country;
      obj.data = [];
      obj.data.push({
        year: val.year,
        population: val.population,
      });
      acc.push(obj);
    }
    return acc;
  }, []);

  sort.forEach((country) => {
    g.append('path')
      .attr('class', 'line')
      .attr('fill', 'none')
      .attr('stroke', 'blue')
      .attr('d', line(country.data));
  });
  data = sort;
});
