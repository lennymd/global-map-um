async function main() {
  // load data

  // load country shapes
  const countryShapes = await d3.json('./data/world-geojson.json');

  // load coordinate data
  const countryData = await d3.csv('./data/world_coords.csv');
  // accessors for coordinate data
  const countryName = d => d.country;

  // load working data
  const _dataset = await d3.csv('./data/test.csv');
  // accessors for working data
  // TODO add accessors
  const activityNameAccessor = d => d['International Activity Name'];
  const countryAccessor = d => d['IA Country'];

  // clean and prep working data
  let dataset = _dataset.filter(d => countryAccessor(d) != 'NA');

  const nested_data = d3.nest().key(countryAccessor).entries(dataset);
  const country_key_list = nested_data.map(d => d.key);
  const event_count_list = nested_data.map(d => d.values.length);

  drawMap(countryShapes, nested_data);
  drawTable();
}

main();
