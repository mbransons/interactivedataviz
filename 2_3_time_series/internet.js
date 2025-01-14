// set margins, width/height
const margin = { left: 90, right: 305, top: 15, bottom: 40 };
const width = 1780 - margin.left - margin.right;
const height = 1570 - margin.top - margin.bottom;

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

// Arrays of values from data set to help build
const regionCodes = ['NAC', 'ECS', 'LCN', 'EAS', 'MEA', 'WLD', 'SAS', 'SSF'];
const regionNames = [
  'North America',
  'Europe & Central Asia',
  'Latin America & Caribbean',
  'East Asia & Pacific',
  'Middle East & North Africa',
  'World',
  'South Asia',
  'Sub-Saharan Africa',
];

// Parsing tools
const percentFormat = d3.format(',%');
const parseYear = d3.timeParse('%Y');
const formatTime = d3.timeFormat('%Y');
const formatPop = d3.format('.3s');

//Scales
// Given this simplicity of the domains, both ranges and domains are set without data
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

// X Axis
const xAxisCall = d3
  .axisBottom(x)
  .ticks(30)
  .tickFormat((d) => formatTime(d));

g.append('g')
  .attr('class', 'x axis')
  .attr('transform', `translate(0, ${height})`)
  .call(xAxisCall);

// Y Axis
const yAxisCall = d3
  .axisLeft(y)
  .ticks(10)
  .tickFormat((d) => `${d}%`);

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
  .attr('transform', `translate(0, ${height})`)
  .call(make_x_gridlines().tickSize(-height).tickFormat(''));

// add the Y gridlines
g.append('g')
  .attr('class', 'grid grid-y')
  .call(make_y_gridlines().tickSize(-width).tickFormat(''));

// variables declared in the global scope that are used after the data call
let pop,
  meta,
  internet,
  countries,
  countriesAdd,
  countriesLast,
  countriesLabelSort,
  regions;

// Call Data downloaded from
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

  // meta array is used to add values from the internet data (i) and population data (p)
  // the country code 'ABC' is used to find values
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

  // With all values in the meta array, two filtered sets are created
  // all countries have a region defined
  // regions are picked out from the regionCodes
  countries = meta.filter((c) => c.Region);
  regions = meta.filter((r) =>
    regionCodes.some((code) => code === r['Country Code'])
  );

  // A bit of data massaging here. For countries that do not have data all the way to 2016
  // This adds a value to the year 2016 as a repeat of the last recorded value
  // Prevents all these countries from having their final value kick down to 0% from a higher value
  // Also removes any countries that do not have data
  countriesAdd = countries.map((c) => {
    if (c.data.some((val) => formatTime(val.year) === '2016')) {
      return c;
    } else {
      if (c.data.length > 0) {
        let last = c.data[c.data.length - 1];
        last.year = parseYear(2016);
        c.data.push(last);
        return c;
      }
      return c;
    }
  });

  // With work on the data completed, the countries paths are generated
  g.selectAll('.country-path')
    .data(countriesAdd)
    .enter()
    .append('path')
    .attr('id', (d) => d['Country Code'])
    .attr('class', 'country-path')
    .attr('fill', 'none')
    .attr('stroke', '#b3b3b3')
    .attr('stroke-width', 2)
    .attr('d', (d) => line(d.data));

  // simplified array of data is built for managing the labels to be added
  // after the final year 2016
  countriesLast = countriesAdd
    .filter((c) => c.data.some((val) => formatTime(val.year) === '2016'))
    .map((c) => {
      return {
        TableName: c.TableName,
        'Country Code': c['Country Code'],
        data: c.data[c.data.length - 1],
      };
    });

  // a group is created for countries and positioned in the SVG
  // at the end of the country path line
  const countryLabel = g
    .selectAll('.country-label')
    .data(countriesLast)
    .enter()
    .append('g')
    .attr(
      'transform',
      (d) => `translate(${x(d.data.year)}, ${y(d.data.percent)})`
    );

  // circles are then added to the group which appear at the end of the country path line
  countryLabel
    .append('circle')
    .attr('r', '3')
    .attr('class', (d) => d['Country Code'])
    .attr('fill', '#b3b3b3');

  // then the data is sorted by percentage and then reduced to groupings
  // based on rounded percentage number of users in 2016
  // countriesLabelSort
  let curr, obj;
  countriesLabelSort = countriesLast
    .sort((a, b) => a.data.percent - b.data.percent)
    .reduce((acc, val) => {
      if (curr === Math.round(val.data.percent)) {
        acc
          .find((perObj) => perObj.percent === Math.round(val.data.percent))
          .data.push({ name: val.TableName, code: val['Country Code'] });
      } else {
        curr = Math.round(val.data.percent);
        obj = {};
        obj.percent = curr;
        obj.data = [];
        obj.data.push({ name: val.TableName, code: val['Country Code'] });
        acc.push(obj);
      }
      return acc;
    }, []);

  // The sorted country groups need a group to build the rounded percentage
  // and the list of countries at that percent
  const countryLabelText = g
    .selectAll('.country-label')
    .data(countriesLabelSort)
    .enter()
    .append('g')
    .attr(
      'transform',
      (d) => `translate(${x(parseYear(2016))}, ${y(d.percent)})`
    );

  // a text element is added to the group and a multiple function is used
  // to allow for iteration through the array of countries at the percent
  countryLabelText
    .append('text')
    .attr('class', 'country-label')
    .attr('id', (d) => `percent${d.percent}`)
    .attr('transform', 'translate(10, 2)')
    .attr('fill', '#b3b3b3')
    .each(multiple);

  // adds tspans for each value needed in the text element
  // this allows for classes to be assigned to each tspan
  // which can be used to select and modify based on the value
  function multiple(d) {
    let text = d3.select(this);
    text
      .append('tspan')
      .attr('class', 'percent-label')
      .text((d) => `${d.percent}% `);
    let countryObjs = d.data.map((obj) => {
      obj.name = shorten(obj.name);
      return obj;
    });

    // for (let i = 0; i < countryObjs.length; i++) {
    //   if (countryObjs.length === 1) {
    //     text
    //       .append('tspan')
    //       .attr('class', countryObjs[i].code)
    //       .text(countryObjs[i].name);
    //   } else if (countryObjs.length === 2) {
    //     text
    //     .append('tspan')
    //     .attr('class', countryObjs[i].code)
    //     .text(countryObjs[i].name);
    //   }
    // }

    countryObjs.forEach((obj) => {
      text.append('tspan').attr('class', obj.code).text(`${obj.name}, `);
    });
  }

  // using the filtered meta array into the regions array
  // the regions paths are created using the color scale
  // for path fills
  g.selectAll('.region')
    .data(regions)
    .enter()
    .append('path')
    .attr('fill', 'none')
    .attr('stroke', (d) => regColor(d['Country Code']))
    .attr('stroke-width', 6)
    .attr('d', (d) => line(d.data));

  // a group for the regions label is created at the end of the regions path line
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

  // a circle is added to the regions label group
  regionsLabel
    .append('circle')
    .attr('r', '7')
    .attr('fill', (d) => regColor(d['Country Code']));

  // the region name is added to the regions label group
  regionsLabel
    .append('text')
    .attr('class', 'region-label')
    .attr('id', (d) => `${d['Country Code']}-txt`)
    .text(
      (d) => `${Math.round(d.data[d.data.length - 1].percent)}% ${d.TableName}`
    )
    .attr('fill', (d) => regColor(d['Country Code']))
    .attr('transform', 'translate(10, 5)');

  // country path hover state interaction
  // all paths are selected by the common class
  // two event listeners 'mouseover' and 'mouseout' on the path
  // The id attached to each path is its 'Country Code' so it
  // can be used to look up country object in countries and use
  // it's region to set the color of the path
  // also the country code is the class of the circle and country
  // in the country label to change their colors
  const countryPaths = document.querySelectorAll('.country-path');
  for (let path of countryPaths) {
    path.addEventListener('mouseover', function () {
      let country = countries.find((c) => c['Country Code'] === this.id);
      let idx = regionNames.findIndex((r) => r === country.Region);
      let fill = regColor(regionCodes[idx]);
      this.style.stroke = fill;
      this.style.strokeWidth = 4;
      let countryLabels = document.querySelectorAll(`.${this.id}`);
      for (let label of countryLabels) {
        label.style.fill = fill;
        label.style.transform = 'scale(2)';
        label.style.fontSize = '20px';
      }
      countryLabels[1].parentElement.firstChild.style.fill = fill;
      countryLabels[1].parentElement.firstChild.style.fontSize = '20px';
    });
    path.addEventListener('mouseout', function () {
      this.style.stroke = '#b3b3b3';
      this.style.strokeWidth = 2;
      let countryLabels = document.querySelectorAll(`.${this.id}`);
      for (let label of countryLabels) {
        label.style.fill = '#b3b3b3';
        label.style.transform = 'scale(1)';
        label.style.fontSize = '10px';
      }
      countryLabels[1].parentElement.firstChild.style.fill = '#b3b3b3';
      countryLabels[1].parentElement.firstChild.style.fontSize = '10px';
    });
  }
});

function shorten(str) {
  if (str.indexOf(',') !== -1) {
    return str.slice(0, str.indexOf(','));
  }
  return str;
}
