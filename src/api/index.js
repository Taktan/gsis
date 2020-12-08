const express = require('express');
const app = express();
const cors = require('cors')
const axios = require('axios');
const JSzip = require('jszip');

app.use(express.json())
app.use(cors({
    origin: ['http://localhost:8080','http://example.com']
}))

/*-------------Авторизация в GEE----------------*/
const ee = require('@google/earthengine')
const privateKey = require('../../private.json')
ee.reset()
const initEE = () =>{
    ee.initialize(null,null,()=>{
        console.log(`Google Earth Engine Init`)
        app.listen(3000, ()=>{
            console.log('Стартанул сервер на 3000 порту')
        })
    }, (e)=>{
        console.error(`Init error: ${e}`)
    })
}
ee.data.authenticateViaPrivateKey(privateKey, initEE, (e)=>{
    console.error('Authentication error: ' + e);
});
/*----------Конец авторизации в GEE-------------*/


/** 
 * Проверка готовности сервера и GEE
 */
app.get('/api/check-status-gee', (req,res)=>{
    if(ee.ready_ == "ready"){
        res.send("Ok")
    }else{
        res.status(503).send("Не готов GEE")
    }
})

const gee = require('../module/requester-for-gee')
/**
 * Запрос получения архива с изображениями
 * @param {Object} req.body параметры для получения шота
 * @param {Object} req.body.coordinates координаты центра запроса
 * @param {Array} req.body.date временные ограничения запросов
 * @param {Number} req.body.area площадь запроса
 * @param {Number} req.body.cloudPercent процент заоблочности
 * @param {Number} req.body.scale масштаб картинки
 * @param {String} req.body.satellite название спутника
 * @param {Array} req.body.bands массив названий нужных спектров
 * @param {String} req.body.postFunction название последней функции
 * @return {Buffer} архив с изображениями
 */
app.post('/api/get-zip-for-shot', (req,res)=>{
    try{
        if(req.body && !Object.keys(req.body).length){
            res.status(400).send('Отсутствуют параметры')
        }else{
            let urlWithBands = gee.manyBands(req.body);
            axios.get(urlWithBands, {responseType: 'arraybuffer'}).then((responseZIP)=>{
                if(responseZIP.status == 200){
                    if(req.body.colorImage){
                        if(req.body.satellite == "COPERNICUS/S2_SR"){
                            JSzip.loadAsync(responseZIP.data).then(async (zip)=>{
                                const red = await zip.file('thumbnail.TCI_R.tif').async("nodebuffer");
                                const green = await zip.file('thumbnail.TCI_G.tif').async("nodebuffer")
                                const blue = await zip.file('thumbnail.TCI_B.tif').async("nodebuffer")
                                require('../module/create-color-image.js')(red,green,blue,'tiff').then(async colorFile=>{
                                    await zip.file('thumbnail.color.tif', colorFile);
                                    zip.generateAsync({type: 'nodebuffer'}).then(result => {
                                        res.send(result)
                                    })
                                })
                            })
                        }
                        //TODO Проработать получение цветных изображений у других спутников
                    }
                    else{
                        res.send(responseZIP.data)
                    }
                }else{
                    res.status(500).send("Невозможно получить ZIP архив с сервера")
                }
            });
            
        }
    }catch(e){
        res.status(500).send(`Error: ${e}`)
    }
})
app.get('/api/test-data', async (req,res)=>{
    require('fs').readFile(__dirname + "/tests/files/test.zip", (err,data)=>{
        res.send(data)
    })
    
});