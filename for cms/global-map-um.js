async function main() {
  // load country shapes & coordinate data
  const countryShapes = await d3.json('./data/world-geojson.json');
  const countryData = await d3.csv('./data/world_coords.csv');

  // load working data
  const _dataset = await d3.csv('./data/activities_by_country_20210208.csv');

  // accessors for working data
  const activityNameAccessor = d => d['International Activity Name'];
  const countryAccessor = d => d['IA Country'];

  // clean and prep working data
  let dataset = _dataset.filter(d => countryAccessor(d) != 'NA');

  const nestedData = d3.nest().key(countryAccessor).entries(dataset);

  drawMap(countryShapes, countryData, nestedData);
  drawTable(nestedData);

  function drawMap(countryShapes, countryData, nestedData) {
    // create chart dimensions
    let dimensions = {
      width: window.innerWidth * 0.8,
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
      dimensions.boundedHeight +
      dimensions.margin.top +
      dimensions.margin.bottom;

    // Draw canvas

    const wrapper = d3
      .select('#lmd-wrapper')
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
        .attr('class', 'country-bubble');
    });

    // Add interactivity
    // TODO On hover, highlight the dot and show country name
    // TODO On click smooth scroll to the country on the list below

    d3.selectAll('.country-bubble')
      .on('mouseenter', onMouseEnter)
      .on('mouseleave', onMouseLeave)
      .on('click', navigateToRow);

    const tooltip = d3.select('#lmd-tooltip');
    function onMouseEnter() {
      d3.select(this).classed('bubble-active', true);
      const countryIndex = this.id.split('_')[1];
      const _data = nestedData[countryIndex];
      const name = _data.key;
      const value = _data.values.length;
      const cx = this.getAttribute('cx');
      const cy = this.getAttribute('cy');
      const r = this.getAttribute('r');

      const value_tense = value == 1 ? 'activity' : 'activities';

      tooltip.style('opacity', 1);

      tooltip.select('#country').text(() => {
        if (name == 'Congo, Dem. Rep.') {
          return 'Democratic Republic of the Congo';
        } else if (name == 'Trinidad & Tobago') {
          return 'Trinidad and Tobago';
        } else if (name == 'Korea, Rep.') {
          return 'South Korea';
        } else if (name == 'Russian Federation') {
          return 'Russia';
        } else if (name == 'North Macedonia') {
          return 'North Macedonia (Former Yugoslavic Republic of Macedonia)';
        } else if (name == 'Venezuela, RB') {
          return 'Venezuela';
        } else if (name == 'Taiwan, China') {
          return 'Taiwan';
        } else if (name == 'Slovak Republic') {
          return 'Slovakia';
        } else {
          return name;
        }
      });
      tooltip.select('#value').text(`${value} ${value_tense}`);

      const tooltipRect = document
        .getElementById('lmd-tooltip')
        .getBoundingClientRect();

      const tooltipDeltaX = tooltipRect.width * 0.4;
      const tooltipDeltaY = tooltipRect.height;

      tooltip
        .style('left', `${cx - tooltipDeltaX}px`)
        .style('top', `${cy - tooltipRect.height}px`);
    }
    function onMouseLeave() {
      d3.select(this).classed('bubble-active', false);
      tooltip.style('opacity', 0);
    }
    function navigateToRow() {
      console.log(this.id);
      const countryIndex = this.id.split('_')[1];
      document
        .getElementById(`country_row_${countryIndex}`)
        .scrollIntoView({behavior: 'smooth', block: 'start'});
    }
  }

  function drawTable(nestedData) {
    const container = d3.select('.activity-list');

    const order = [
      'Education and Research',
      'Study Abroad',
      'Creative Work',
      'Professional Practice',
      'Service',
      'Innovation Project',
      'Other',
    ];

    const colorScale = d3
      .scaleOrdinal()
      .domain(order)
      .range([
        '#00429d',
        '#5681b9',
        '#93c4d2',
        '#ffa59e',
        '#dd4c65',
        '#93003a',
        '#666',
      ]);

    function getType(a) {
      let d = a['Activity Sub-Type'];
      let t;
      if (d.includes('Education') || d.includes('Research')) {
        t = 'Education and Research';
      } else if (d.includes('Service')) {
        t = 'Service';
      } else if (d == 'General Collaboration' || d == 'Civic Engagement') {
        t = 'Other';
      } else {
        t = d;
      }

      return t;
    }

    // populate legend
    const legendBox = d3.select('.activity-legend');
    order.forEach(opt => {
      const box = legendBox.append('div').attr('class', 'legend-group');
      box
        .append('div')
        .attr('class', 'legend-dot')
        .style('background-color', colorScale(opt));

      box.append('p').attr('class', 'legend-opt').text(opt);
    });

    nestedData.forEach((d, i) => {
      const row = container.append('div').attr('class', 'country-row');

      const countrySection = row
        .append('div')
        .attr('class', 'country-name-box')
        .attr('id', `country_row_${i}`);

      countrySection.append('h3').text(() => {
        if (d.key == 'Congo, Dem. Rep.') {
          return 'Democratic Republic of the Congo';
        } else if (d.key == 'Trinidad & Tobago') {
          return 'Trinidad and Tobago';
        } else if (d.key == 'Korea, Rep.') {
          return 'South Korea';
        } else if (d.key == 'Russian Federation') {
          return 'Russia';
        } else if (d.key == 'North Macedonia') {
          return 'North Macedonia (Former Yugoslavic Republic of Macedonia)';
        } else if (d.key == 'Venezuela, RB') {
          return 'Venezuela';
        } else if (d.key == 'Taiwan, China') {
          return 'Taiwan';
        } else if (d.key == 'Slovak Republic') {
          return 'Slovakia';
        } else {
          return d.key;
        }
      });

      const activityBox = row.append('div').attr('class', 'activity-box');

      activityBox
        .selectAll('activities')
        .data(
          d.values.sort(function (a, b) {
            const t = getType(a);
            const w = getType(b);
            let x = order.indexOf(t),
              y = order.indexOf(w);

            if (x > y) {
              return 1;
            }
            if (x < y) {
              return -1;
            }
            return 0;
          })
        )
        .enter()
        .append('div')
        .attr('class', 'activity')
        .attr('title', d => d['International Activity Name'])
        .style('background-color', d => colorScale(getType(d)));
    });

    // Modal open event
    d3.selectAll('.activity').on('click', showActivityInfo);
    function showActivityInfo() {
      const d = this.__data__;
      console.log(d);
      d3.select('#lmd-modal_section').style('display', 'block');
      const content = d3.select('#lmd-modal_content');

      content
        .append('h2')
        .attr('class', 'activity_hed')
        .text(d['International Activity Name']);

      const grid1 = content.append('div').attr('class', 'activity_grid');
      const grid1_left = grid1.append('div');
      const grid1_right = grid1.append('div');
      grid1_left
        .append('p')
        .attr('class', 'activity_description')
        .text(d['Description']);

      grid1_right.append('h3').attr('class', 'info_hed').text('Faculty member');
      grid1_right
        .append('p')
        .attr('class', 'info_txt')
        .html(`${d['Salutation']} ${d['UM Contact']}`);
      grid1_right.append('h3').attr('class', 'info_hed').text('Activity Dates');
      grid1_right
        .append('p')
        .attr('class', 'info_txt')
        .html(() => {
          let start = d['Activity Start Date'];
          let end = d['Activity End Date'];
          if (d['Activity Status'] == 'Published') {
            return `${start} &ndash; ${end}`;
          } else {
            return `${d['Activity Start Date']} &ndash; Present`;
          }
        });
      grid1_right
        .append('h3')
        .attr('class', 'info_hed')
        .text('Type of Activity');
      grid1_right.append('p').attr('class', 'info_txt').html(getType(d));
      grid1_right.append('h3').attr('class', 'info_hed').text('Country');
      grid1_right.append('p').attr('class', 'info_txt').html(d['IA Country']);
    }
    // Modal close event
    window.onclick = function (event) {
      const modal = document.getElementById('lmd-modal_section');
      if (event.target == modal) {
        const container = d3.select('#lmd-modal_content');
        container.html('');
        modal.style.display = 'none';
      }
    };

    d3.selectAll('.lmd-modal_close').on('click', function () {
      d3.select('#lmd-modal_content').html('');
      d3.select('#lmd-modal_section').style('display', 'none');
    });
  }
}

main();
