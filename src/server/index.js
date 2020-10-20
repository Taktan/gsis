
const express = require('express')
const app = express();
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

app.post('/test', (req,res)=>{ //TODO Сделать нормальное название запроса и совершить проверки
    const test = require('../module/module_for_GEE')
    res.send(test.sendRequest(req.body));
})
