const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
rl.question('Номер теста:\n', answer => {
    console.log(answer)
    startTest(+answer)
    rl.close();
})

const startTest = (answer) => {
    switch(answer){
        case 1:
            require("./tests/test1")
            break;
        case 2:
            require("./tests/test2")
            break;
    }
}