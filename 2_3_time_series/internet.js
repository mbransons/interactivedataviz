// set margins, width/height
const margin = { left: 90, right: 305, top: 15, bottom: 40 };
const width = 1780 - margin.left - margin.right;
const height = 1570 - margin.top - margin.bottom;

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
// Legend Group bottom-right
const legend = g
  .append('g')
  .attr('transform', `translate(${width - 10}, ${height - 150})`);

const regionCodes = ['NAC', 'ECS', 'LCN', 'EAS', 'MEA', 'WLD', 'SAS', 'SSF'];

// Parsing tools
const percentFormat = d3.format(',%');
const parseYear = d3.timeParse('%Y');
const formatTime = d3.timeFormat('%Y');
const formatPop = d3.format('.3s');

//Scales
// Initially set ranges based on the visualization width/height
const startDate = d3.timeDay.offset(parseYear(1990), -80);
const endDate = d3.timeDay.offset(parseYear(2016), 80);
const x = d3.scaleTime().range([0, width]).domain([startDate, endDate]);
const y = d3.scaleLinear().range([height, 0]).domain([0, 100]);
const regColor = d3
  .scaleOrdinal()
  .range([
    '#009245',
    '#f7cb4b',
    '#39b54a',
    '#f24a53',
    '#5761a2',
    '#a3745c',
    '#ff9696',
    '#0071bc',
  ])
  .domain(regionCodes);

//Line Generator
const line = d3
  .line()
  .x((d) => x(d.year))
  .y((d) => y(d.percent));

const xAxisCall = d3
  .axisBottom(x)
  .ticks(30)
  .tickFormat((d) => formatTime(d));

//Y Axis
const yAxisCall = d3
  .axisLeft(y)
  .ticks(10)
  .tickFormat((d) => `${d}%`);

g.append('g')
  .attr('class', 'x axis')
  .attr('transform', `translate(0, ${height})`)
  .call(xAxisCall);

g.append('g').attr('class', 'y axis').call(yAxisCall);

// grid lines
// gridlines in x axis function
function make_x_gridlines() {
  return d3.axisBottom(x).ticks(20);
}

// gridlines in y axis function
function make_y_gridlines() {
  return d3.axisLeft(y).ticks(20);
}

// add the X gridlines
g.append('g')
  .attr('class', 'grid grid-x')
  .attr('transform', 'translate(0,' + height + ')')
  .call(make_x_gridlines().tickSize(-height).tickFormat(''));

// add the Y gridlines
g.append('g')
  .attr('class', 'grid grid-y')
  .call(make_y_gridlines().tickSize(-width).tickFormat(''));

let pop, meta, internet, countries, countriesLast, regions;

// Call Data
// https://ourworldindata.org/internet
// https://data.worldbank.org/indicator/it.net.user.zs
// https://data.worldbank.org/indicator/SP.POP.TOTL
Promise.all([
  d3.csv(
    '../data/pop-internet/Internet_Percentage_Usage_By_Country_and_Region.csv'
  ),
  d3.csv('../data/pop-internet/Population_By_Country_and_Region_1960-2020.csv'),
  d3.csv('../data/pop-internet/Metadata_Country.csv'),
]).then(([i, p, m]) => {
  pop = p;
  internet = i;
  meta = m;

  meta.forEach((c) => {
    let matchI = internet.find((i) => i['Country Code'] === c['Country Code']);
    let matchP = pop.find((p) => p['Country Code'] === c['Country Code']);
    let data = [];
    for (let prop in matchI) {
      if (Number(prop)) {
        if (Number(prop) >= 1990 && Number(prop <= 2016)) {
          if (matchI[prop]) {
            data.push({
              year: parseYear(Number(prop)),
              percent: Number(matchI[prop]),
              pop: Number(matchP[prop]),
            });
          }
        }
      }
    }
    c.data = data;
  });

  countries = meta.filter((c) => c.Region);
  regions = meta.filter((r) =>
    regionCodes.some((code) => code === r['Country Code'])
  );

  // North Korea final data point fix
  countries
    .find((c) => c['Country Code'] === 'PRK')
    .data.push({ year: parseYear(2016), percent: 0 });

  countriesLast = countries
    .filter((c) => c.data.some((val) => formatTime(val.year) === '2016'))
    .map((c) => {
      return {
        TableName: c.TableName,
        'Country Code': c['Country Code'],
        data: c.data[c.data.length - 1],
      };
    });

  g.selectAll('.country')
    .data(countries)
    .enter()
    .append('path')
    .attr('fill', 'none')
    .attr('stroke', '#b3b3b3')
    .attr('stroke-width', 1)
    .attr('d', (d) => line(d.data));

  g.selectAll('.country-last')
    .data(countriesLast)
    .enter()
    .append('circle')
    .attr('cx', (d) => x(d.data.year))
    .attr('cy', (d) => y(d.data.percent))
    .attr('r', '3')
    .attr('fill', '#b3b3b3');

  g.selectAll('.region')
    .data(regions)
    .enter()
    .append('path')
    .attr('fill', 'none')
    .attr('stroke', (d) => regColor(d['Country Code']))
    .attr('stroke-width', 5)
    .attr('d', (d) => line(d.data));

  const regionsLabel = g
    .selectAll('.region-last')
    .data(regions)
    .enter()
    .append('g')
    .attr(
      'transform',
      (d) =>
        `translate(${x(d.data[d.data.length - 1].year)}, ${y(
          d.data[d.data.length - 1].percent
        )})`
    );
  regionsLabel
    .append('circle')
    .attr('r', '7')
    .attr('fill', (d) => regColor(d['Country Code']));
  regionsLabel
    .append('text')
    .attr('class', 'region-label')
    .attr('id', (d) => `${d['Country Code']}-txt`)
    .text(
      (d) => `${Math.round(d.data[d.data.length - 1].percent)}% ${d.TableName}`
    )
    .attr('fill', (d) => regColor(d['Country Code']))
    .attr('transform', 'translate(10, 5)');
});
