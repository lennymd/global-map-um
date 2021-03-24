async function drawMap() {
  // 1. Access data

  const countryShapes = await d3.json('./data/world-geojson.json');
  const countryData = await d3.csv('./data/world_coords.csv');
  const _dataset = await d3.csv('./data/test.csv');

  // TODO add accessors
  const activityNameAccessor = d => d['International Activity Name'];
  const countryAccessor = d => d['IA Country'];
  // Accessors for countryData
  const countryName = d => d.country;

  let dataset = _dataset.filter(d => countryAccessor(d) != 'NA');
  // Figure out which countries have 2 or more activities so I can wiggle their dots
  let countryList = [];
  let multipleActivitiesList = [];
  for (let i = 0; i < dataset.length; i++) {
    const country = countryAccessor(dataset[i]);
    if (countryList.includes(country)) {
      if (multipleActivitiesList.includes(country)) {
        continue;
      } else {
        multipleActivitiesList.push(country);
      }
    } else {
      countryList.push(country);
    }
  }
  console.log(countryList.length, multipleActivitiesList.length);

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

  dataset.forEach((a, i) => {
    const country_name = countryAccessor(a);
    let country_data_name;

    if (country_name == 'Congo, Dem. Rep.') {
      country_data_name = 'Congo [DRC]';
    } else if (country_name == 'Trinidad & Tobago') {
      country_data_name = 'Trinidad and Tobago';
    } else if (country_name == 'Korea, Rep.') {
      country_data_name = 'South Korea';
    } else if (country_name == 'Russian Federation') {
      country_data_name = 'Russia';
    } else if (country_name == 'North Macedonia') {
      country_data_name = 'Macedonia [FYROM]';
    } else if (country_name == 'Venezuela, RB') {
      country_data_name = 'Venezuela';
    } else if (country_name == 'Taiwan, China') {
      country_data_name = 'Taiwan';
    } else if (country_name == 'Slovak Republic') {
      country_data_name = 'Slovakia';
    } else {
      country_data_name = country_name;
    }

    let country_data = countryData.filter(
      d => countryName(d) == country_data_name
    )[0];

    const long = country_data.longitude;
    const lat = country_data.latitude;
    const [x, y] = projection([long, lat]);
    let p = [];
    if (multipleActivitiesList.includes(country_name)) {
      console.log('yes', country_name, i);
      p = [x + jitter(5, 1), y + jitter(5, 1)];
    } else {
      p = [x, y];
    }

    bounds
      .append('circle')
      .attr('cx', p[0])
      .attr('cy', p[1])
      .attr('r', 1.5)
      .attr('fill', '#f9423a')
      .attr('opacity', 0.4);
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

function jitter(base, n) {
  const sign = Math.random(1);
  const v = sign > 0.5 ? +1 : -1;
  return v * base * Math.random(n);
}
