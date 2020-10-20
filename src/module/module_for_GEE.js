var ee = require('@google/earthengine')

module.exports.sendRequest = (parameters) => {
    /*
      {
        //TODO coordinates: coordinates,
        //TODO date: date,
        //TODO area: area,
        //TODO cloudPercent: cloudPercent,
        //TODO scale: scale,
        //TODO satellite: satellite,
        //TODO bands: bands,
        //TODO postFunction: postFunction,
        TODO colorImage: colorImage,
      })
    */
   console.log("Отправка")
   const square = new ee.Geometry(ee.Geometry.Point([parameters.coordinates.longitude, parameters.coordinates.latitude])).buffer(new ee.Number(parameters.area * 1e6).sqrt().divide(2)).bounds();
   let defaultShot = new ee.ImageCollection(parameters.satellite)
   .filterBounds(square)
   .filterDate(ee.Date(parameters.date[0]), ee.Date(parameters.date[1]))
   .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', parameters.cloudPercent))
   .sort('CLOUDY_PIXEL_PERCENTAGE',false)
   switch(parameters.postFunction){
    case 'median': defaultShot = defaultShot.median();break; // ! Отправляет непросматриваемые "обычным способом" картинки
    case 'mean': defaultShot = defaultShot.mean();break;
    case 'first': defaultShot = defaultShot.first();break;
  }
  console.log(defaultShot.getInfo())
  const urlZip = defaultShot.getDownloadURL({
    bands: parameters.bands,
    crs: 'EPSG:32653',
    region: square,
    scale: parameters.scale
  });
  return urlZip;
}
// TODO Перепроверить работу запроса