var ee = require('@google/earthengine')

module.exports = () => {
    console.log("Вызов из модуля")
    var defaultShot = ee.ImageCollection('COPERNICUS/S2_SR')
    var filterShots = defaultShot.filterDate(new ee.Date('2019-06-01'), new ee.Date('2019-09-01'))
    console.log(filterShots)
}