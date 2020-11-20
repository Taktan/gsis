const ee = require("@google/earthengine")
const private = require("../../../private.json");
const gee = require("../../module/requester-for-gee")

gee.init(private).then(()=>{
    gee.allYearsShots(135.213773, 48.643276, 1, __dirname + "/files/allShotsYears")
}).catch(e=>{
    console.log("Ошибка: " + e)
});

/* (async ()=>{
    const result = gee.init(private);
    console.log(result);
})(); */
