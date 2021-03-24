async function drawMap() {
  // 1. Access data

  const countryShapes = await d3.json('./data/world-geojson.json');
  const countryData = await d3.csv('./data/world_coords.csv');
  const _dataset = await d3.csv('./data/activities_by_country_20210208.csv');
  // console.log(dataset);
  // TODO add accessors
  const activityNameAccessor = d => d['International Activity Name'];
  const countryAccessor = d => d['IA Country'];

  // Accessors for country_dataset
  const countryNameAccessor = d => d.country;

  let dataset = _dataset.filter(d => countryAccessor(d) != 'NA');

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

  // No scales needed because projection() takes care of scaling our points

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

  // TODO test adding circles for each line in the dataset
  dataset.forEach((a, i) => {
    const country_name = countryAccessor(a);

    let country_data = countryData.filter(
      d => countryNameAccessor(d) == country_name
    )[0];
    if (country_name == 'Congo, Dem. Rep.') {
      country_data = countryData.filter(
        d => countryNameAccessor(d) == 'Congo [DRC]'
      )[0];
    } else if (country_name == 'Trinidad & Tobago') {
      country_data = countryData.filter(
        d => countryNameAccessor(d) == 'Trinidad and Tobago'
      )[0];
    } else if (country_name == 'Korea, Rep.') {
      country_data = countryData.filter(
        d => countryNameAccessor(d) == 'South Korea'
      )[0];
    } else if (country_name == 'Russian Federation') {
      country_data = countryData.filter(
        d => countryNameAccessor(d) === 'Russia'
      )[0];
    } else if (country_name == 'North Macedonia') {
      country_data = countryData.filter(
        d => countryNameAccessor(d) === 'Macedonia [FYROM]'
      )[0];
    } else if (country_name == 'Venezuela, RB') {
      country_data = countryData.filter(
        d => countryNameAccessor(d) === 'Venezuela'
      )[0];
    } else if (country_name == 'Taiwan, China') {
      country_data = countryData.filter(
        d => countryNameAccessor(d) === 'Taiwan'
      )[0];
    } else if (country_name == 'Slovak Republic') {
      country_data = countryData.filter(
        d => countryNameAccessor(d) === 'Slovakia'
      )[0];
    }
    const long = country_data.longitude;
    const lat = country_data.latitude;
    const p = projection([long, lat]);
    bounds
      .append('circle')
      .attr('cx', p[0])
      .attr('cy', p[1])
      .attr('r', 5)
      .attr('fill', '#f9423a');
  });

  // 6. Draw peripherals

  // 7. Set up interactions

  // countries.on('mouseenter', onMouseEnter).on('mouseleave', onMouseLeave);

  // const tooltip = d3.select('#tooltip');
  // function onMouseEnter(datum) {
  //   tooltip.style('opacity', 1);

  //   // const metricValue = metricDataByCountry[countryIdAccessor(datum)];

  //   tooltip.select('#country').text(countryNameAccessor(datum));

  //   // tooltip.select('#value').text(`${d3.format(',.2f')(metricValue || 0)}%`);

  //   const [centerX, centerY] = pathGenerator.centroid(datum);

  //   const x = centerX + dimensions.margin.left;
  //   const y = centerY + dimensions.margin.top;

  //   tooltip.style(
  //     'transform',
  //     `translate(` + `calc( -50% + ${x}px),` + `calc(-100% + ${y}px)` + `)`
  //   );
  // }

  // function onMouseLeave() {
  //   tooltip.style('opacity', 0);
  // }
}
drawMap();
