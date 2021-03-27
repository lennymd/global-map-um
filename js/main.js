async function main() {
  // load data

  // load country shapes
  const countryShapes = await d3.json('./data/world-geojson.json');

  // load coordinate data
  const countryData = await d3.csv('./data/world_coords.csv');
  // accessors for coordinate data
  const countryName = d => d.country;

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
}

main();
