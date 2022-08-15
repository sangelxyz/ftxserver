// const ftxConnection = require("./src/exchange/ftx.js")
const pushNotifications = require("./src/notifications/pushOver.js")

// console.log(ftxConnection())
const ftx = require('./src/exchange/ftx.js') 
//const returnFtxData = async() => await(ftxConnection()).then()

//console.log(await returnFtxData())
let promised = [], ftxData = {}
// Todo Scheduler
//console.log(ftxConnection())

setInterval(()=> {
    promised.push(ftx.get('/futures/CEL-PERP'))

    Promise.all(promised).then(msg=> {
        //msg array
        for(const i of msg) {
        
        if (i.ftx){
            //console.log(i.ftx)
            let {name, last, bid, ask, change1h} = i.ftx.result
            //console.log(i.ftx)
            //ftxData=i.ftx
            const pushmsg = async () => pushNotifications(`Token: ${name} Bid: ${bid} Ask: ${ask} Change 1hour: ${change1h}`)
            pushmsg()

        }
        
        }
    })
    promised = [], ftxData = {}
},(1000)) // 1000ms * 60 sec * 10 mins

