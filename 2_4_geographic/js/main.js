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
  .attr('fill', '#444')
  .attr('stroke', 'white')
  .attr('stroke-width', 1);

let us, path, selected, ufos;

Promise.all([
  d3.json('../data/usState.json'),
  d3.csv('../data/ufoData.csv', d3.autoType),
]).then(([geojson, ufoData]) => {
  us = geojson;
  ufos = ufoData;
  const types = new Set();
  ufos.forEach((ufo) => types.add(ufo.shape));
  console.log(types);
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

  g.append('path')
    .attr('fill', 'none')
    .attr('stroke', 'white')
    .attr('stroke-width', 2)
    .attr('stroke-linejoin', 'round')
    .attr('d', (d) => path(d));
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
  console.log(d);

  const [[x0, y0], [x1, y1]] = path.bounds(d);
  event.stopPropagation();
  states.selectAll('path').transition().style('fill', null);

  if (selected !== d.properties.NAME) {
    d3.select(this).transition().style('fill', 'red');
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
