const width = 975;
const height = 610;

const zoom = d3.zoom().scaleExtent([1, 8]).on('zoom', zoomed);

const svg = d3
  .select('#chart-area')
  .append('svg')
  .attr('viewBox', [0, 0, width, height]);

svg
  .append('rect')
  .attr('class', 'background')
  .attr('width', width)
  .attr('height', height)
  .on('click', reset);

const g = svg.append('g');

const projection = d3.geoAlbersUsa();
const states = g
  .append('g')
  .attr('fill', '#ffffff98')
  .attr('stroke', 'white')
  .attr('stroke-width', 1);

let us, path, selected, ufos, shapes, countries, filteredUfos;

// parsing tools
// '10/10/1949 20:30'
const parseTime = d3.timeParse('%m/%d/%Y %H:%M');
const formatTime = d3.timeFormat('%A, %B %d, %I:%M%p');

//ToolTip
const tip = d3
  .tip()
  .attr('class', 'd3-tip')
  .html((event, d) => {
    let div = `<div class="box box--tip p-3">
    <article class="columns is-gapless is-mobile">
      <div class="column is-12">
        <div class="content">
        <table>
        <tbody>
          <tr>
            <td class="p-1 has-text-weight-semibold is-uppercase is-size-6">${
              d.city
            }, ${d.state}
            </td>
          </tr>
          <tr>
            <td class="p-1 is-size-6">${formatTime(d.datetime)} </td>
          </tr>
          <tr>
            <td class="p-1 is-size-6">${d.comments}</td>
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

Promise.all([
  d3.json('../data/usState.json'),
  d3.csv('../data/ufoData.csv', d3.autoType),
]).then(([geojson, ufoData]) => {
  us = geojson;
  ufos = ufoData;
  shapes = new Set();
  countries = new Set();
  ufos.forEach((ufo) => {
    ufo.datetime = parseTime(ufo.datetime);
    ufo.longitude = ufo['longitude '];
    shapes.add(ufo.shape);
  });
  filteredUfos = ufos.filter((ufo) => {
    return ufo.country === 'us' && ufo.datetime.getFullYear() === 2012;
  });
  filteredUfos.forEach((ufo) => {
    countries.add(ufo.country);
  });
  projection.fitSize([width, height], geojson);
  path = d3.geoPath(projection);
  states
    .selectAll('path.states')
    .data(geojson.features)
    .join('path')
    .attr('class', 'states')
    .on('click', clicked)
    .attr('d', path)
    .attr('cursor', 'pointer')
    .attr('id', (d) => d.properties.NAME)
    .append('title')
    .text((d) => d.properties.NAME)
    .attr('d', (d) => path(d));

  const ufoSighting = g
    .selectAll('circle')
    .data(filteredUfos)
    .join('circle')
    .attr('r', 1)
    .attr('fill', 'black')
    .attr('transform', (d) => {
      const [x, y] = projection([d.longitude, d.latitude]);
      return `translate(${x}, ${y})`;
    })
    .on('mouseover', tip.show)
    .on('mouseout', tip.hide);
});

function reset() {
  states.selectAll('path').transition().style('fill', null);
  svg
    .transition()
    .duration(750)
    .call(
      zoom.transform,
      d3.zoomIdentity,
      d3.zoomTransform(svg.node()).invert([width / 2, height / 2])
    );
  selected = undefined;
}

function clicked(event, d) {
  console.log(d.properties);
  const [[x0, y0], [x1, y1]] = path.bounds(d);
  event.stopPropagation();
  states.selectAll('path').transition().style('fill', null);

  if (selected !== d.properties.NAME) {
    d3.select(this).transition().style('fill', '#ffffff');
    svg
      .transition()
      .duration(750)
      .call(
        zoom.transform,
        d3.zoomIdentity
          .translate(width / 2, height / 2)
          .scale(
            Math.min(8, 0.9 / Math.max((x1 - x0) / width, (y1 - y0) / height))
          )
          .translate(-(x0 + x1) / 2, -(y0 + y1) / 2),
        d3.pointer(event, svg.node())
      );
    selected = d.properties.NAME;
  } else {
    reset();
  }
}

svg.call(zoom);

function zoomed(event) {
  const { transform } = event;
  g.attr('transform', transform);
  g.attr('stroke-width', 1 / transform.k);
}
