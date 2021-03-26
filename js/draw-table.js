function drawTable(nestedData) {
  // console.log(nestedData);
  const container = d3.select('.activity_list');

  nestedData.forEach(d => {
    const row = container.append('div').attr('class', 'country_row');

    const countrySection = row.append('div').attr('class', 'country_name_box');

    countrySection.append('h3').text(d.key);

    const activityBox = row.append('div');
  });
}
