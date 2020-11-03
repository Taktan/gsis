const JSZip = require('jszip')
const fs = require('fs');
fs.readFile(__dirname + "/files/test.zip", (errZip,dataZip)=>{
    if (errZip) throw errZip;
    JSZip.loadAsync(dataZip).then(async zip =>{
        fs.readFile(__dirname + "/files/test.tif", (errFile, dataFile)=>{
            if (errZip) throw errZip;
            zip.file('color.tif', dataFile);
           
            zip.generateNodeStream({type:'nodebuffer',streamFiles:true})
                .pipe(fs.createWriteStream(__dirname + '/files/out.zip'))
                .on('finish', function () {
                    console.log("out.zip written.");
                });
        })
    })
})