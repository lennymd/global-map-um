function drawTable(nestedData) {
  // console.log(nestedData);
  const container = d3.select('.activity_list');

  nestedData.forEach((d, i) => {
    const row = container.append('div').attr('class', 'country_row');

    const countrySection = row.append('div').attr('class', 'country_name_box');

    countrySection.append('h3').text(d.key);

    const activityBox = row.append('div').attr('class', 'activity_box');
    console.log(d);
    const activities = activityBox
      .selectAll('activities')
      .data(d.values)
      .enter()
      .append('div')
      .attr('class', 'activity')
      .attr('title', d => d['International Activity Name']);
  });
}
