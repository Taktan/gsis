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
 * Получение архива с шотами
 * TODO Дописать документацию к запросу
 */
app.post('/api/get-zip-for-shot', (req,res)=>{ //TODO Сделать нормальное название запроса и совершить проверки
    try{
        if(req.body && !Object.keys(req.body).length){
            res.status(400).send('Отсутствуют параметры')
        }else{
            let urlWithBands = gee.manyBands(req.body);
            axios.get(urlWithBands, {responseType: 'arraybuffer'}).then((responseZIP)=>{
                if(responseZIP.status == 200){
                    if(req.body.colorImage){
                        //TODO Получение цветного изображения
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
