module.exports = (ee, privateKey)=>{
    return new Promise((resolve,reject)=>{
        ee.reset()
        const initEE = () =>{
            ee.initialize(null,null,()=>{
                console.log(`Google Earth Engine Init`)
                resolve()
            }, (e)=>{
                console.error(`Init error: ${e}`)
                reject(e)
            })
        }
        ee.data.authenticateViaPrivateKey(privateKey, initEE, (e)=>{
            console.error('Authentication error: ' + e);
            reject(e)
        });
    });
}