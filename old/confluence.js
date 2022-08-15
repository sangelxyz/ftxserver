// const ftxConnection = require("./src/exchange/ftx.js")

//const pushNotifications = require("./src/notifications/pushOver.js")

// console.log(ftxConnection())
const ftx = require('./src/exchange/ftx.js') 
//const returnFtxData = async() => await(ftxConnection()).then()

//console.log(await returnFtxData())
let promised = [], ftxData = {}

// normalise, xx over 15mins


// Todo Scheduler
//console.log(ftxConnection())

// sum up buys
// sells
// compare order ids
const data= [[],[]] // buy, order id

setInterval(()=> {
    promised.push(ftx.get('/trades?market=CHZ-PERP'))
    
    Promise.all(promised).then(msg=> {
        //msg array
        for(const i of msg) {
        
        if (i.ftx){
            // store orderID remove duplicates.
            console.log(i.ftx)
            for(const bids of i.ftx.result) {
                //console.log(i.ftx)
                let {price, size, side, tradeId} = bids
                    
                if(side == 'buy') {
                    // check for duplicates.
                    console.log(tradeId)
                    if(!data[1].includes(tradeId)) {
                        data[1].push(tradeId)
                        data[0].push(size)
                        
                    }

                }
                // if(side == 'sell') {
                //     console.log('sell '+price)
                // }



            }
            console.log(data[0])
            //console.log(i.ftx)
            //ftxData=i.ftx
            //const pushmsg = async () => pushNotifications(`Token: ${name} Bid: ${bid} Ask: ${ask} Change 1hour: ${change1h}`)
            //pushmsg()

        }
        
        }
    })
    promised = [], ftxData = {}
},(1000)) // 1000ms * 60 sec * 10 mins



// const createCsvWriter = require('csv-writer').createObjectCsvWriter;
// const csvWriter = createCsvWriter({
//   path: 'out.csv',
//   header: [
//     {id: 'fill', title: 'fill'}
//   ]
// })

// const data = [
//   {
//     fill: 'fill'
//   }
// ]

// csvWriter
//   .writeRecords(data)
//   .then(()=> console.log('The CSV file was written successfully'))

