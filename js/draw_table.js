function drawTable(nestedData) {
  // console.log(nestedData);
  const container = d3.select('.activity_list');

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
      '#4771b2',
      '#73a2c6',
      '#a5d5d8',
      '#ffbcaf',
      '#f4777f',
      '#cf3759',
      '#93003a',
    ]);
  function getType(a) {
    let d = a['Activity Sub-Type'];
    let _a;
    if (d.includes('Education') || d.includes('Research')) {
      _a = 'Education and Research';
    } else if (d.includes('Service')) {
      _a = 'Service';
    } else if (d == 'General Collaboration' || d == 'Civic Engagement') {
      _a = 'Other';
    } else {
      _a = d;
    }

    return _a;
  }

  nestedData.forEach((d, i) => {
    const row = container.append('div').attr('class', 'country_row');

    const countrySection = row
      .append('div')
      .attr('class', 'country_name_box')
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

    const activityBox = row.append('div').attr('class', 'activity_box');
    const activities = activityBox
      .selectAll('activities')
      .data(
        d.values.sort(function (a, b) {
          let _a = getType(a);
          let _b = getType(b);
          let x = order.indexOf(_a);
          let y = order.indexOf(_b);

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
    d3.select('#modal_section').style('display', 'block');
    const content = d3.select('#modal_content');

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
        if (d['Activity Status'] == 'Published') {
          return `${d['Activity Start Date']} &ndash; ${d['Activity End Date']}`;
        } else {
          return `${d['Activity Start Date']} &ndash; Present`;
        }
      });
    grid1_right.append('h3').attr('class', 'info_hed').text('Type of Activity');
    grid1_right.append('p').attr('class', 'info_txt').html(getType(d));
  }
  // Modal close event
  window.onclick = function (event) {
    const modal = document.getElementById('modal_section');
    if (event.target == modal) {
      const container = d3.select('#modal_content');
      container.html('');
      modal.style.display = 'none';
    }
  };

  d3.selectAll('.modal_close').on('click', function () {
    d3.select('#modal_content').html('');
    d3.select('#modal_section').style('display', 'none');
  });
}
