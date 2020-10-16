var ee = require('@google/earthengine')

module.exports = () => {
    console.log("Вызов из модуля")
    var defaultShot = ee.ImageCollection('COPERNICUS/S2_SR')
    var filterShots = defaultShot.filterDate(ee.Date('2019-06-01'))
    console.log(filterShots)
}