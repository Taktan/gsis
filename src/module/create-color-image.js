const sharp = require("sharp");

module.exports = (red, green, blue, format = "tiff") => {
    return new Promise((resolve,reject)=>{
        let image = sharp(red).joinChannel([green,blue]).toFormat(format);
        image.toBuffer().then(data => {
            resolve(data);
        }).catch(err=>{
            reject(err)
        })
    })
}