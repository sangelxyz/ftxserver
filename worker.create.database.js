// Worker, Spin markets for notfications.
// Set Markets, run: node worker.spinmarkets.js

// Settings
//const marketPair = ['BTC-PERP','ETH-PERP','CEL-PERP','MANA-PERP','LOOKS-PERP','FLOW-PERP','DYDX-PERP','SNX-PERP','XEM-PERP'] // 'BTC-PERP',

// max_allowed_packet
// 

const marketPair = ['BTC-PERP','ETH-PERP','SOL-PERP','MATIC-PERP','ETC-PERP','AVAX-PERP','BNB-PERP','APE-PERP','ADA-PERP','XRP-PERP','GMT-PERP','AAVE-PERP','DOT-PERP','LINK-PERP','CRV-PERP','FTM-PERP','NEAR-PERP','SAND-PERP','AXS-PERP','GALA-PERP','LOOKS-PERP','RUNE-PERP','FTT-PERP','DYDX-PERP']
const marketSampleSize = 1 // Mins
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
    const isAlive = false   
    const wss = new WebSocket('wss://ftx.com/ws/')
    
    setInterval(async()=> {
        wss.send(JSON.stringify({'op': 'ping'}))
        // set isAlive = false while we wait for pong {'type': 'pong'}
        // then set true.
        // If connection dead reconnect.
    },15000) 
    
    wss.on('open', function open() {
    wss.send(JSON.stringify({'op': 'subscribe', 'channel': 'trades', 'market': market})); 
    });
    

    wss.on('message', function message(data) {

        const rawData = JSON.parse(data.toString()) // from binary string.
        
        if(rawData['data']) {
            
            for (const items of rawData['data']) {
                //console.log(items.side)
                const {price, size, side, id, time} = items
                
                let sql = `INSERT INTO candle 
                (
                    marketPair, price, time, amt, side, tradeID
                )
                VALUES
                (
                    '${market}', ${price}, ${toTimeStamp(time)}, ${size}, ${(side==='buy' ? 0 : 1)}, ${id}
                );`

                console.log(`${market} - ${price}`)
                
                connection.query(sql, (err, data)=> {
                    if (err) {
                        console.log(err)
                    }
                })


    
            }
    
        }


    });

    
}

function logEvent(message) {
    fs.appendFile('log3.txt', `${message}
    `, function (err) {
        if (err) throw err;
        console.log('Saved!');
        });
}

function getPercentageChange(a, b) {
    return  100 * Math.abs( ( a - b ) / ( (a+b)/2 ) );
   }


