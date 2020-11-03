var ee = require('@google/earthengine')

/**
 * Отправка запроса на сервер GEE для получения нескольких спектров
 * @param {Object} parameters параметры для получения шота
 * @param {Object} parameters.coordinates координаты центра запроса
 * @param {Array} parameters.date временные ограничения запросов
 * @param {Number} parameters.area площадь запроса
 * @param {Number} parameters.cloudPercent процент заоблочности
 * @param {Number} parameters.scale масштаб картинки
 * @param {String} parameters.satellite название спутника
 * @param {Array} parameters.bands массив названий нужных спектров
 * @param {String} parameters.postFunction название последней функции
 * @return {String} ссылка на архив из шотов
 */
module.exports.manyBands = (parameters) => {
   const square = new ee.Geometry(ee.Geometry.Point([parameters.coordinates.longitude, parameters.coordinates.latitude])).buffer(new ee.Number(parameters.area * 1e6).sqrt().divide(2)).bounds();
   let defaultShot = new ee.ImageCollection(parameters.satellite)
   .filterBounds(square)
   .filterDate(ee.Date(parameters.date[0]), ee.Date(parameters.date[1]))
   .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', parameters.cloudPercent))
   .sort('CLOUDY_PIXEL_PERCENTAGE',false)
   switch(parameters.postFunction){
    case 'median': defaultShot = defaultShot.median();break; 
    case 'mean': defaultShot = defaultShot.mean();break; 
    case 'first': defaultShot = defaultShot.first();break;
  }
  parameters.bands.forEach(band => { // нужно для "нормализации" картинки
    defaultShot = defaultShot.addBands(defaultShot.visualize({bands: [band]}).rename([band]), null, true)
  })
  const urlZip = defaultShot.getDownloadURL({
    name: "thumbnail",
    bands: parameters.bands,
    crs: 'EPSG:32653',
    region: square,
    scale: parameters.scale,
  });
  return urlZip;
}