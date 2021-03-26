async function drawMap2() {
  // 1. Access data

  const countryShapes = await d3.json('./data/world-geojson.json');

  const countryData = await d3.csv('./data/world_coords.csv');
  // Accessors for countryData
  const countryName = d => d.country;

  const _dataset = await d3.csv('./data/test.csv');
  // Accessors for dataset
  // TODO add accessors
  const activityNameAccessor = d => d['International Activity Name'];
  const countryAccessor = d => d['IA Country'];

  let dataset = _dataset.filter(d => countryAccessor(d) != 'NA');

  const nested_data = d3.nest().key(countryAccessor).entries(dataset);
  const country_key_list = nested_data.map(d => d.key);
  const event_count_list = nested_data.map(d => d.values.length);

  // 2. Create chart dimensions
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

  // 3. Draw canvas

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

  // 4. Create scales

  const rScale = d3
    .scaleLinear()
    .domain(d3.extent(event_count_list))
    .range([4, 80])
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
    let _data = countryData.filter(d => countryName(d) == country_name)[0];
    return [_data.longitude, _data.latitude];
  }

  nested_data.forEach(d => {
    const country = d.key;
    const activities = +d.values.length;
    const [x, y] = getCoordinates(country);
    const p = projection([x, y]);
    console.log(country, activities);
    bounds
      .append('circle')
      .attr('cx', p[0])
      .attr('cy', p[1])
      .attr('r', rScale(activities))
      .attr('class', 'country_bubble');
  });

  // 7. Set up interactions
  // TODO On hover, highlight the dot and show country name
  // TODO On click smooth scroll to the country on the list below
}
drawMap2();
