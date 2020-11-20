const ee = require('@google/earthengine')
const axios = require('axios');
const fs = require('fs');
const JSzip = require('jszip');

function pad(s) 
  { 
    while (s.length < 3) 
        s = '0' + s; 
    return s; 
  };

module.exports.init = (privateKey) =>{
  return new Promise((resolve,reject)=>{
    ee.reset()
    const initEE = () =>{
        ee.initialize(null,null,()=>{
            console.log(`Google Earth Engine Init`)
            resolve()
        }, (e)=>{
            console.error(`Init error: ${e}`)
            reject(false)
        })
    }
    ee.data.authenticateViaPrivateKey(privateKey, initEE, (e)=>{
        console.error('Authentication error: ' + e);
        reject(false)
    });
  });
}

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
    if(band != "TCI_R" && band != "TCI_G" && band != "TCI_B") defaultShot = defaultShot.addBands(defaultShot.visualize({bands: [band], min: 500, max: 1500}).rename([band]), null, true)
    else defaultShot = defaultShot.addBands(defaultShot.visualize({bands: [band]}).rename([band]), null, true)
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
module.exports.allYearsShots = async (longitude, latitude, month, startPath) => {

  const square = new ee.Geometry(ee.Geometry.Point([longitude, latitude])).buffer(new ee.Number(1e6).sqrt().divide(2)).bounds();
  let bands =  ["B2", "B3", "B4", "B5", "B12", "B11", "B8A", "B8", "B7", "B6", "TCI_R", "TCI_G", "TCI_B"];
  let icList = new ee.ImageCollection("COPERNICUS/S2_SR")
    .filterBounds(square)
    .filterDate(ee.Date(`2019-01-01`), ee.Date(`2020-01-01`))
    .sort('GENERATION_TIME', true) 
    .toList(200).getInfo();
  
  icList.forEach(async (shot,index)=>{
    // let shot = icList[0];
    let name = new Date(shot.properties.GENERATION_TIME).toLocaleDateString("ru")
    console.log(`Начало ${name}`)
    let image = new ee.Image(shot.id).clip(square);
    bands.forEach(band => { // нужно для "нормализации" картинки
      if(band != "TCI_R" && band != "TCI_G" && band != "TCI_B") image = image.addBands(image.visualize({bands: [band], min: 500, max: 1500}).rename([band]), null, true)
      else image = image.addBands(image.visualize({bands: [band]}).rename([band]), null, true)
    })
    let url = await image.getDownloadURL({
      name: name,
      bands: bands,
      crs: 'EPSG:32653',
      region: square,
      scale: 1,
    })
    await axios.get(url, {responseType: 'arraybuffer'}).then((responseZIP)=>{
      JSzip.loadAsync(responseZIP.data).then(async (zip)=>{
        const red = await zip.file(`${name}.TCI_R.tif`).async("nodebuffer");
        const green = await zip.file(`${name}.TCI_G.tif`).async("nodebuffer")
        const blue = await zip.file(`${name}.TCI_B.tif`).async("nodebuffer")
        require('../module/create-color-image')(red,green,blue,'tiff').then(async colorFile=>{
          await fs.writeFileSync(startPath + `/COLOR/${pad(''+index)}.tif`, colorFile);
          await fs.writeFileSync(startPath + `/TCI_R/${pad(''+index)}.tif`, red);
          await fs.writeFileSync(startPath + `/TCI_G/${pad(''+index)}.tif`, green);
          await fs.writeFileSync(startPath + `/TCI_B/${pad(''+index)}.tif`, blue);

          await fs.writeFileSync(startPath + `/B2/${pad(''+index)}.tif`, await zip.file(`${name}.B2.tif`).async("nodebuffer"));
          await fs.writeFileSync(startPath + `/B3/${pad(''+index)}.tif`, await zip.file(`${name}.B3.tif`).async("nodebuffer"));
          await fs.writeFileSync(startPath + `/B4/${pad(''+index)}.tif`, await zip.file(`${name}.B4.tif`).async("nodebuffer"));
          await fs.writeFileSync(startPath + `/B5/${pad(''+index)}.tif`, await zip.file(`${name}.B5.tif`).async("nodebuffer"));
          await fs.writeFileSync(startPath + `/B6/${pad(''+index)}.tif`, await zip.file(`${name}.B6.tif`).async("nodebuffer"));
          await fs.writeFileSync(startPath + `/B7/${pad(''+index)}.tif`, await zip.file(`${name}.B7.tif`).async("nodebuffer"));
          await fs.writeFileSync(startPath + `/B8/${pad(''+index)}.tif`, await zip.file(`${name}.B8.tif`).async("nodebuffer"));
          await fs.writeFileSync(startPath + `/B8A/${pad(''+index)}.tif`, await zip.file(`${name}.B8A.tif`).async("nodebuffer"));
          await fs.writeFileSync(startPath + `/B11/${pad(''+index)}.tif`, await zip.file(`${name}.B11.tif`).async("nodebuffer"));
          await fs.writeFileSync(startPath + `/B12/${pad(''+index)}.tif`, await zip.file(`${name}.B12.tif`).async("nodebuffer"));
          console.log(`Конец ${name}`)
        })
      });
    });
  }) // конец цикла forEach
}