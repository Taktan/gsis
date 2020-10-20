const express = require('express');
const app = express();
const axios = require('axios');
app.use(express.json())

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

const gee = require('../module/requester-for-gee')
/**
 * Запрос получения ссылок на архивы с шотами
 */
app.post('/api/get-urls-for-shot', (req,res)=>{ //TODO Сделать нормальное название запроса и совершить проверки
    try{
        if(!Object.keys(req.body).length){
            res.status(400).send('Отсутствуют параметры')
        }else{
            res.send(gee.manyBands(req.body));
            // axios.get(url,)
            if(req.body.colorImage){
                //TODO Получение цветного изображения
            }
        }
    }catch(e){
        res.status(500).send(`Error: ${e}`)
    }
})
