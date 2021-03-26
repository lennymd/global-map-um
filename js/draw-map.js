function drawMap(countryShapes, countryData, nestedData) {
  // create chart dimensions
  let dimensions = {
    width: window.innerWidth * 0.9,
    margin: {
      top: 10,
      right: 10,
      bottom: 10,
      left: 10,
    },
  };
  dimensions.boundedWidth =
    dimensions.width - dimensions.margin.left - dimensions.margin.right;

  const sphere = {type: 'Sphere'};
  const projection = d3
    .geoEqualEarth()
    .fitWidth(dimensions.boundedWidth, countryShapes);

  const pathGenerator = d3.geoPath(projection);
  const [[x0, y0], [x1, y1]] = pathGenerator.bounds(countryShapes);
  dimensions.boundedHeight = y1;
  dimensions.height =
    dimensions.boundedHeight + dimensions.margin.top + dimensions.margin.bottom;

  // Draw canvas

  const wrapper = d3
    .select('#wrapper')
    .append('svg')
    .attr('width', dimensions.width)
    .attr('height', dimensions.height);

  const bounds = wrapper
    .append('g')
    .style(
      'transform',
      `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`
    );

  // Create scales

  const eventCount = nestedData.map(d => d.values.length);
  const rScale = d3
    .scaleLinear()
    .domain(d3.extent(eventCount))
    .range([4, 50])
    .nice();

  // 5. Draw data

  const earth = bounds
    .append('path')
    .attr('class', 'earth')
    .attr('d', pathGenerator(sphere));

  const graticuleJson = d3.geoGraticule10();
  const graticule = bounds
    .append('path')
    .attr('class', 'graticule')
    .attr('d', pathGenerator(graticuleJson));

  const countries = bounds
    .selectAll('.country')
    .data(countryShapes.features)
    .enter()
    .append('path')
    .attr('class', 'country')
    .attr('d', pathGenerator)
    .attr('fill', '#d2d3d4')
    .attr('stroke', '#fff');

  function getCoordinates(country) {
    let country_name;
    if (country == 'Congo, Dem. Rep.') {
      country_name = 'Congo [DRC]';
    } else if (country == 'Trinidad & Tobago') {
      country_name = 'Trinidad and Tobago';
    } else if (country == 'Korea, Rep.') {
      country_name = 'South Korea';
    } else if (country == 'Russian Federation') {
      country_name = 'Russia';
    } else if (country == 'North Macedonia') {
      country_name = 'Macedonia [FYROM]';
    } else if (country == 'Venezuela, RB') {
      country_name = 'Venezuela';
    } else if (country == 'Taiwan, China') {
      country_name = 'Taiwan';
    } else if (country == 'Slovak Republic') {
      country_name = 'Slovakia';
    } else {
      country_name = country;
    }
    let _data = countryData.filter(d => d.country == country_name)[0];
    return [_data.longitude, _data.latitude];
  }

  const countryList = nestedData.map(d => d.key);

  nestedData.forEach(d => {
    const country = d.key;
    const countryId = countryList.indexOf(country);
    const activities = +d.values.length;
    const [x, y] = getCoordinates(country);
    const p = projection([x, y]);
    const bubble = bounds
      .append('circle')
      .attr('cx', p[0])
      .attr('cy', p[1])
      .attr('id', `country_${countryId}`)
      .attr('r', rScale(activities))
      .attr('class', 'country_bubble');
  });

  // Add interactivity
  // TODO On hover, highlight the dot and show country name
  // TODO On click smooth scroll to the country on the list below

  d3.selectAll('.country_bubble')
    .on('mouseenter', onMouseEnter)
    .on('mouseleave', onMouseLeave)
    .on('click', navigateToRow);

  function onMouseEnter() {
    d3.select(this).classed('country_bubble_active', true);
    const countryIndex = this.id.split('_')[1];
    const _data = nestedData[countryIndex];
    const name = _data.key;
    const value = _data.values.length;
    const cx = this.getAttribute('cx');
    const cy = this.getAttribute('cy');
    const r = this.getAttribute('r');
    const delta = r * 0.3;

    // TODO put this text and number in a tooltip
    const textLabel = bounds
      .append('text')
      .attr('class', 'label_country_name')
      .text(name)
      .attr('x', cx)
      .attr('y', cy)
      .attr('dy', -delta)
      .attr('text-anchor', 'middle')
      .attr('font-size', '0.7em');

    const valueLabel = bounds
      .append('text')
      .attr('class', 'label_country_value')
      .text(value)
      .attr('x', cx)
      .attr('y', cy)
      .attr('dy', delta)
      .attr('text-anchor', 'middle')
      .attr('font-size', '0.7em');

    let a = d3.select('.label_country_name')._groups[0][0];
    let b = d3.select('.label_country_value')._groups[0][0];
  }
  function onMouseLeave() {
    d3.select(this).classed('country_bubble_active', false);
    d3.selectAll('.label_country_name').remove();
    d3.selectAll('.label_country_value').remove();
  }

  function navigateToRow() {
    const countryIndex = this.id.split('_')[1];
    console.log(countryIndex);
  }
}
