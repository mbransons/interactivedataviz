// data source https://www.kaggle.com/sanjeetsinghnaik/top-1000-highest-grossing-movies/version/1
const apiKey = 'f7f9fe195f863c63a5e2f42428f3c16b';

// set margins, width/height
const margin = { left: 80, right: 100, top: 70, bottom: 50 };
const width = 900 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

// declare data variable to assign value after data call
let movies;

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

//Scales
// Initially set ranges based on the visualization width/height
const x = d3.scaleTime().range([0, width]);
const y = d3.scaleLog().range([height, 0]).base(10);

// Labels
// Title top-center
const chartTitle = g
  .append('text')
  .attr('class', 'x axis-label title')
  .attr('x', width / 2)
  .attr('y', -30)
  .attr('font-size', '15px')
  .attr('font-family', 'sans-serif')
  .attr('text-anchor', 'middle')
  .text('Top Grossing Hollywood Films');

// X Axis bottom-center
const xLabel = g
  .append('text')
  .attr('class', 'x axis-label')
  .attr('x', width / 2)
  .attr('y', height + 40)
  .attr('font-size', '16px')
  .attr('font-family', 'sans-serif')
  .attr('text-anchor', 'middle')
  .text('Year');

// Y Axis label left-center-rotated
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

//data key names
const sales = 'World Sales (in $)';
const date = 'Release Date';
const title = 'Title';
const desc = 'Movie Info';
const length = 'Movie Runtime';
const genre = 'Genre';

//parsing tools
const formatTime = d3.timeFormat('%B %d, %Y');
const parseTime = d3.timeParse('%B %d, %Y');
const parseYear = d3.timeParse('%Y');
const formatYear = d3.timeFormat('%Y');
const parseTitle = (title) => title.slice(0, title.length - 7);
const parseDateFromTitle = (title) =>
  title.slice(title.length - 5, title.length - 1);

// regex based function to convert string enclosed array
// Ex: "['Action', 'Adventure', 'Sci-Fi']" to an array
// ['Action', 'Adventure', 'Sci-Fi']
// https://stackoverflow.com/questions/7998180/regex-how-to-extract-text-from-between-quotes-and-exclude-quotes
// rewritten with matchAll
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/matchAll
const parseGenres = (str) => {
  let regexp = /'([^']*)'/g;
  return Array.from(str.matchAll(regexp), (m) => m[1]);
};

//request to movie database to search for movie
function search(movie) {
  let movieTitle = parseTitle(movie.Title);
  return axios
    .get(
      `https://api.themoviedb.org/3/search/movie?api_key=f7f9fe195f863c63a5e2f42428f3c16b&language=en-US&query=${movieTitle}&page=1&include_adult=false`
    )
    .then((res) => res.data)
    .then((data) => data.results[0])
    .then((data) => {
      return !data.poster_path
        ? 'img/no-poster-movie.png'
        : `https://image.tmdb.org/t/p/w92${data.poster_path}`;
    });
}

//ToolTip
const tip = d3
  .tip()
  .attr('class', 'd3-tip')
  .html((event, d) => {
    let div = `<div class="box box--tip p-3">
    <article class="columns is-gapless is-mobile">
      <div class="column is-4 mr-2">
        <figure class="image">
        <img src=${d.posterURL}>
        </figure>
      </div>
      <div class="column is-8">
        <div class="content">
        <table>
        <tbody>
          <tr>
            <td class="p-1 has-text-weight-semibold is-uppercase is-size-7">${parseTitle(
              d[title]
            )}
            </td>
          </tr>
          <tr>
            <td class="p-1 is-size-7">${formatTime(d[date])} </td>
          </tr>
          <tr>
            <td class="p-1 is-size-7">${d3
              .format('$,.3s')(d[sales])
              .replace(/G/, 'B')}</td>
          </tr>
        </tbody>
      </table>
        </div>
      </div>
    </article>
  </div>`;
    return div;
  });

g.call(tip);

// An asynchronous function to return each search promise to an array
// via https://stackoverflow.com/questions/57979376/multiple-api-calls-with-fetch-in-chain-and-promise-all
async function fetchMovies(data) {
  const promises = data.map((movie) => search(movie));
  return await Promise.all(promises);
}

// call data
const dataCall = d3
  .csv('../data/highest-grossing-1000-movies.csv', d3.autoType)
  .then((data) => {
    data.forEach((movie) => {
      // parse time
      movie[date] = parseTime(movie[date]);
      // parse genres Array (not used yet)
      movie[genre] = parseGenres(movie[genre]);
      // make async request for poster images
      // in the future this needs to be set in a set of promise calls that can be attached to a promiseAll
    });
    data = data.filter((movie) => movie[date]);
    return data;
  })
  .then((data) => {
    const promises = fetchMovies(data);
    return Promise.all([data, promises]);
  })
  .then(([movies, posters]) => {
    // set posterURL from the promise value to the returned value
    return movies.map((movie, i) => {
      movie.posterURL = posters[i];
      return movie;
    });
  })
  .then((movieData) => {
    movies = movieData;
    // set min/max values from data set
    const minDate = d3.min(movieData, (d) => d[date]);
    const maxDate = d3.max(movieData, (d) => d[date]);
    const minSales = d3.min(movieData, (d) => d[sales]);
    const maxSales = d3.max(movieData, (d) => d[sales]);

    // set domains to your scales
    x.domain([minDate / 1.5, maxDate * 1.02]);
    y.domain([minSales / 1.25, maxSales * 1.25]);

    // Axis generator
    // X Axis
    const xAxisCall = d3
      .axisBottom(x)
      .ticks(10)
      .tickFormat(d3.timeFormat('%Y'));
    g.append('g')
      .attr('class', 'x axis')
      .attr('transform', `translate(0, ${height})`)
      .call(xAxisCall);

    //Y Axis
    const yAxisCall = d3
      .axisLeft(y)
      .ticks(10)
      .tickFormat((d) => d3.format('$,.3s')(d).replace(/G/, 'B'));
    g.append('g').attr('class', 'y axis').call(yAxisCall);

    // shade sales domains in chart background
    const salesRangeLow = g
      .append('rect')
      .attr('width', width)
      .attr('height', height - y(200000000))
      .attr('x', 0)
      .attr('y', y(200000000))
      .attr('fill', '#969696');

    const salesRangeMid = g
      .append('rect')
      .attr('width', width)
      .attr('height', y(200000000) - y(1000000000))
      .attr('x', 0)
      .attr('y', y(1000000000))
      .attr('fill', '#cccccc');

    const salesRangeHigh = g
      .append('rect')
      .attr('width', width)
      .attr('height', y(1000000000))
      .attr('x', 0)
      .attr('y', 0)
      .attr('fill', '#f7f7f7');

    // create els and attach data
    // background rectangles while awaiting poster image
    const posterRects = g.selectAll('rect').data(movieData);
    posterRects
      .enter()
      .append('rect')
      .attr('width', '10')
      .attr('height', '15')
      .attr('x', (d) => x(d[date]))
      .attr('y', (d) => y(d[sales]))
      .attr('class', 'poster')
      .attr('fill', '#666666')
      .attr('stroke', '#000000')
      .attr('stroke-width', '1px');

    // poster images called from data and set to SVG
    const images = g.selectAll('image').data(movieData);
    images
      .enter()
      .append('svg:image')
      .attr('xlink:href', (d) => d.posterURL)
      .attr('x', (d) => x(d[date]))
      .attr('y', (d) => y(d[sales]))
      .attr('class', 'poster')
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide)
      .attr('width', '10')
      .attr('height', '15');
    return movieData;
  });

// Inflation API to allow option to adjust the gross values by inflation
// https://www.statbureau.org/en/inflation-api
// to be used for a future version
const res = axios
  .get(
    'https://www.statbureau.org/calculate-inflation-price-jsonp?jsoncallback=?',
    {
      params: {
        country: 'united-states',
        start: parseTime('March 25, 1977'),
        end: new Date(),
        amount: 775000000,
        format: true,
      },
    }
  )
  .then((res) => res.data)
  .then((val) => val.slice(4, val.length - 2))
  .then((val) => Number(val.replaceAll(' ', '')));
