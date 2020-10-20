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
   console.log("Отправка")
   const square = new ee.Geometry(ee.Geometry.Point([parameters.coordinates.longitude, parameters.coordinates.latitude])).buffer(new ee.Number(parameters.area * 1e6).sqrt().divide(2)).bounds();
   let defaultShot = new ee.ImageCollection(parameters.satellite)
   .filterBounds(square)
   .filterDate(ee.Date(parameters.date[0]), ee.Date(parameters.date[1]))
   .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', parameters.cloudPercent))
   .sort('CLOUDY_PIXEL_PERCENTAGE',false)
   switch(parameters.postFunction){
    case 'median': defaultShot = defaultShot.median();break; // ! Отправляет непросматриваемые "обычным способом" картинки
    case 'mean': defaultShot = defaultShot.mean();break; // ! То же самое
    case 'first': defaultShot = defaultShot.first();break;
  }
  console.log(defaultShot.getInfo())
  const urlZip = defaultShot.getDownloadURL({
    name: new Date().toISOString(),
    bands: parameters.bands,
    crs: 'EPSG:32653',
    region: square,
    scale: parameters.scale,
    filePerBand: false
  });
  return urlZip;
}