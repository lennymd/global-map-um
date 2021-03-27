function drawTable(nestedData) {
  // console.log(nestedData);
  const container = d3.select('.activity_list');

  const colorScale = d3
    .scaleOrdinal()
    .domain([
      'Education and Research',
      'Innovation Project',
      'Study Abroad',
      'Creative Work',
      'General Collaboration',
      'Professional Practice',
      'Civic Engagement',
      'Service',
      'Other',
    ])
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
      .data(d.values)
      .enter()
      .append('div')
      .attr('class', 'activity')
      .attr('title', d => d['International Activity Name'])
      .style('background-color', d => {
        let type = d['Activity Sub-Type'];
        if (type.includes('Education') || type.includes('Research')) {
          type = 'Education';
        } else if (type.includes('Service')) {
          type = 'Service';
        }
        return colorScale(type);
      });
  });
}
