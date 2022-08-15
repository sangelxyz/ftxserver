// Worker, Spin markets for notfications.
// Set Markets, run: node worker.spinmarkets.js

// Settings
//const marketPair = ['BTC-PERP','ETH-PERP','CEL-PERP','MANA-PERP','LOOKS-PERP','FLOW-PERP','DYDX-PERP','SNX-PERP','XEM-PERP'] // 'BTC-PERP',

const marketPair = ['BTC-PERP','ETH-PERP','SOL-PERP','MATIC-PERP','ETC-PERP','AVAX-PERP','BNB-PERP','APE-PERP','ADA-PERP','XRP-PERP','GMT-PERP','AAVE-PERP','DOT-PERP','LINK-PERP','CRV-PERP','FTM-PERP','NEAR-PERP','SAND-PERP','AXS-PERP','GALA-PERP','LOOKS-PERP','RUNE-PERP','FTT-PERP','DYDX-PERP']
const marketSampleSize = 1 // Mins
const marketLookBack = 20 // lookback period MarketSamplesize * lookback
let marketOutput = []

let alertState = []

import mysql from 'mysql'

//import WebSocket from 'ws';
import WebSocket, { WebSocketServer } from 'ws'
import pushNotifications from './src/notifications/pushOver.js'

import fs from 'fs'

// Database Connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'sangel',
    password: 'faith123',
    database: 'ftxServer'
  })

function toTimeStamp(formatedDate) { // String Date input
    const d = new Date(formatedDate)
    // Return Float, Timestamp
    return d.getTime()
}  

for(const market of marketPair) {
    trackMarket(market,marketSampleSize)
}

async function trackMarket(market, marketSampleSize){    
    
    let lastMessage = 0
    let currentDate = new Date()
    let currentDateTS = Number(currentDate.getTime())
    let currentTrendUp = false 
    
    marketOutput[market] = {'marketStrength': ''}

    const wss = new WebSocket('wss://ftx.com/ws/')
    
    const logData= [0,0,[],0,[],[],0,0,0,0,0] // buy, sell, order id, last fill price, market strenth 15mins, price 15mins, high, last high, low, last low, last close
    //candle=[0,0,0,0,0,0] //
    const backHistory = {"high":[],"lows":[],"close":[],"highTime":[],"lowsTime":[],"closeTime":[]}


    //const pushmsg = async () => pushNotifications(`Online Market ${marketPair} - ${currentDate}`)
    //pushmsg()

    if(!marketOutput[market]) {
        marketOutput[market] = {'marketStrength': 0, 'volumeRange' : '', 'volumeStrength' : 0, 'priceRange' : '','price': 0}
        alertState[market] = 0
    }

    // wss.on('close', function() {
    //     setTimeout(connect, reconnectInterval);
    // })
    
    setInterval(async()=> wss.send(JSON.stringify({'op': 'ping'})),10000) 
    
    setInterval(async()=> {
      // 15mins last strength
      logData[4].push(logData[0]-logData[1])
      // price 15mins
      logData[5].push(logData[3])
      
      logData[7]=logData[6] // set from previous high.
      logData[9]=logData[8] // set from previous low.
      // Reset current
      logData[6] = logData[3]
      logData[8] = logData[3]
    },1000*60*marketSampleSize) // 15mins


    wss.on('open', function open() {
    //   ws.isAlive = true;
    //   ws.on('pong', heartbeat);
    wss.send(JSON.stringify({'op': 'subscribe', 'channel': 'trades', 'market': market})); 
    });
    

    wss.on('message', function message(data) {
        // 10 sec heart beat
        //setInterval(async()=> ws.send(JSON.stringify({'op': 'ping'})),10000) 
    
        // 
        //console.log(market)
        //console.log(data.toString())
        //ws.send('something');
    
        //const rawData = JSON.parse(data)
    
        //for(const bids of rawData) {
        const rawData = JSON.parse(data.toString()) // from binary string.
        
        if(rawData['data']) {
            
            for (const items of rawData['data']) {
                //console.log(items.side)
                const {price, size, side, id, time} = items
                
                if(price > logData[6]) logData[6]=price // Set High
                if(price < logData[8] || logData[8]===0 ) logData[8]=price // Set Low
                //logData[9]=logData[8] // set from previous low.

                //console.log(`${price} ${toTimeStamp(time)}`)
                // sell side === 1, buy === 0
                // let sql = `INSERT INTO candle 
                // (
                //     marketPair, price, time, amt, side, tradeID
                // )
                // VALUES
                // (
                //     '${market}', ${price}, ${toTimeStamp(time)}, ${size}, ${(side==='buy' ? 0 : 1)}, ${id}
                // );`
                
                // connection.query(sql, (err, data)=> {
                //     if (err) {
                //         console.log(err)
                //     }
                // })

                
                
                //if(!logData[2].includes(id)) {
                    //logData[2].push(id)
                    
                    // logData[3] = price
                    // if(side == 'buy') {
                    //     //logData[0].push(size)
                    //     logData[0] = logData[0]+size
                    // }
                    // else {
                    //     //logData[1].push(size)
                    //     logData[1] = logData[1]+size
                    // }
                //}
    
    
            }
    
        }

        
        //if(logData[0] > 0 && logData[1] > 0) {

            
            //marketOutput[market].marketStrength = (logData[0]-logData[1]).toFixed(2)

            currentDate = new Date()
            currentDateTS = Number(currentDate.getTime())

            // Past 1min.
            //if(price > logData[6]) logData[6]=price // Set High
            //if(price < logData[8]) logData=price // Set Low
            //if(logData[4].length > 0) {
                // if price change more then 2%
                //console.log(logData[8])
                //console.log(logData[6])
                //console.log("")

                //console.log(getPercentageChange(logData[8], logData[6]))
                //if(getPercentageChange(logData[5][logData[5].length-1], logData[3]) > 0.2 ) {
                //    currentDateTS > lastMessage

                currentDate = new Date()
                currentDateTS = Number(currentDate.getTime())


                if(getPercentageChange(logData[8], logData[6]) > 0.9 ) { // low, current current price
                    //if(currentDateTS > lastMessage ){
                        //let msg = `https://ftx.com/trade/${market}`
                        //console.log(msg)
                        let minutesToAdd=marketSampleSize*2
                        let futureDate = new Date(currentDate.getTime());
                        let futureDateTS = Number(futureDate.getTime()+ 1000 * 60 * 10)
                        

                        //const date = new Date(ts*1000);
                        //console.log(date.getTime())
                        const humanDateFormat = futureDate.toLocaleString() 
                        // new price is more then last high
                        //if(logData[3] > logData[8]) {
                        //if(logData[6] > logData[8]) {
                            if(currentDateTS > lastMessage  ){
                                fs.appendFile('log3.txt', `Pump ${humanDateFormat}  Market: ${market} Last High: ${logData[8]} : Current High : ${logData[6]}   Current Fill: ${logData[3]} : ${logData[3]} : diff: ${getPercentageChange(logData[8], logData[6])}%`+"\n", function (err) {
                                    if (err) throw err;
                                    console.log('Pump!');
                                    });
                                const pushmsg = async () => pushNotifications(`Pump Alert - ${market} - $${logData[3].toFixed(3)} <br> <a href="https://ftx.com/trade/${market}">https://ftx.com/trade/${market}</a>`)
                                pushmsg()
                                currentTrendUp=true
                                lastMessage=futureDateTS
                            }
                        //}
                        // else {
                        //     if(currentDateTS > lastMessage || currentTrendUp==true ) {
                        //         fs.appendFile('log2.txt', `Dump ${humanDateFormat} - Market: ${market} Last High: ${logData[8]} : Current High : ${logData[6]}   Current Fill: ${logData[3]} : diff: ${getPercentageChange(logData[8], logData[6])}%`+"\n", function (err) {
                        //             if (err) throw err;
                        //             console.log('Dump!');
                        //             });
                        //         const pushmsg = async () => pushNotifications(`Dump Alert - ${market} - $${logData[3].toFixed(3)} <br> <a href="https://ftx.com/trade/${market}">https://ftx.com/trade/${market}</a>`)
                        //         pushmsg()
                        //         currentTrendUp=false
                        //     }
                        // }
                        //const pushmsg = async () => pushNotifications(`Pump Alert - ${market} - $${logData[3].toFixed(3)} <br> <a href="https://ftx.com/trade/${market}">https://ftx.com/trade/${market}</a>`)
                        
 
                        
                    //}


                }
            
            //}
            
        //}
        // channel
        // const {price, size, side, tradeId} = JSON.parse(rawData).data
        // if(!logData[1].includes(tradeId)) {
        //     logData[1].push(tradeId)
        //     logData[0].push(size)
        // }
        //console.log(logData)
        //console.log('received: %s', data);
    });

    
}


// function getPercentageChange(oldNumber, newNumber){
//     const decreaseValue = (newNumber - oldNumber) / oldNumber //Math.abs()

//     return ((decreaseValue / oldNumber) * 100).toFixed(10)
// }
function getPercentageChange(a, b) {
    return  100 * Math.abs( ( a - b ) / ( (a+b)/2 ) );
   }



//client.connect('wss://ftx.com/ws/', 'server time');
