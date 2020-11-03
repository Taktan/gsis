const colorImage = require("../../module/create-color-image")
const JSZip = require('jszip');
const fs = require('fs');
fs.readFile(__dirname + '/files/test.zip', (err,data)=>{
    if (err) throw err;
    JSZip.loadAsync(data).then(async zip=>{
        const red = await zip.file('thumbnail.TCI_R.tif').async("nodebuffer");
        const green = await zip.file('thumbnail.TCI_G.tif').async("nodebuffer")
        const blue = await zip.file('thumbnail.TCI_B.tif').async("nodebuffer")
        colorImage(red,green,blue,'tiff')
        .then(res=>{
            console.log(res)
        })
    })
})