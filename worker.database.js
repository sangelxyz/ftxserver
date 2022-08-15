// Input
// x Time, y price in percent
// bars

// Worker, Spin markets for notfications.
// Set Markets, run: node worker.spinmarkets.js

// Load specific time.


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
    
    //const logData= [0,0,[],0,[],[],0,0,0,0,0] // buy, sell, order id, last fill price, market strenth 15mins, price 15mins, high, last high,low, last low, last close
    const candle=[0,0,0,0,0,0] // current price, current high, current low, current price time, current high time, current low time
    const backHistory = {"high":[],"lows":[],"close":[],"highTime":[],"lowsTime":[],"closeTime":[]}
    const maxBars = 40

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
        //"high":[],"lows":[],"close":[],"highTime":[],"lowsTime":[],"closeTime":[]
        backHistory['high'].push(candle[1])  //Current High
        backHistory['lows'].push(candle[2]) //Current Low
        backHistory['close'].push(candle[0]) // Close price (price now)
        backHistory['highTime'].push(candle[4]) // High time
        backHistory['lowsTime'].push(candle[5]) // lows time
        backHistory['closeTime'].push(candle[3]) // Current bar close time.

        // clean backHistory
        if(backHistory['high'].length > maxBars) {
            backHistory['high'].shift()
            backHistory['lows'].shift()
            backHistory['close'].shift()
            backHistory['highTime'].shift()
            backHistory['lowsTime'].shift()
            backHistory['closeTime'].shift()
        }
    },1000*60*marketSampleSize) // 15mins


    function setCandle({price, size, side, id, time}) {
        
        const priceFloat = parseFloat(price)
        const FromDateTS = toTimeStamp(time)
        candle[0] = priceFloat // Current price
        candle[3] = FromDateTS // Current order time
        //Set high
        //if(price > candle[1]) candle[1]=price // Set High
        //if(price < candle[2] || candle[2]===0 ) candle[2]=price // Set Low

        if(priceFloat>candle[1]) {
            candle[1]= priceFloat // Current high.
            candle[4] = FromDateTS // Order time
        }
        //Set Low
        if(priceFloat < candle[2] || candle[2] === 0) {
            candle[2] = priceFloat // Current low
            candle[5] = FromDateTS // Order Time
        }
    }

    wss.on('open', function open() {
    //   ws.isAlive = true;
    //   ws.on('pong', heartbeat);
    wss.send(JSON.stringify({'op': 'subscribe', 'channel': 'trades', 'market': market})); 
    });
    
    wss.on('message', function message(data) {

        const rawData = JSON.parse(data.toString()) // from binary string.
        
        if(rawData['data']) {
            
            for (const items of rawData['data']) {
                //console.log(items.side)
                const {price, size, side, id, time} = items
                
                const priceFloat = parseFloat(price)
                const FromDateTS = toTimeStamp(time)
                candle[0] = priceFloat // Current price
                candle[3] = FromDateTS // Current order time
                //Set high
        
                if(priceFloat>candle[1]) {
                    candle[1]= priceFloat // Current high.
                    candle[4] = FromDateTS // Order time
                }
                //Set Low
                if(priceFloat < candle[2] || candle[2] === 0) {
                    candle[2] = priceFloat // Current low
                    candle[5] = FromDateTS // Order Time
                }
            }
    
        }

        
        if(backHistory['close'].length > 1) {
            const [currentPrice, currentHigh, currentLow, currentPriceTime, currentHighTime, currentlowTime] = candle // current price, current high, current low, current price time, current high time, current low time


        //if(currentDateTS > lastMessage ){
            let minutesToAdd=marketSampleSize*2
            let futureDate = new Date(currentDate.getTime())
            let futureDateTS = Number(futureDate.getTime()+ 1000 * 60 * 10)
            const humanDateFormat = futureDate.toLocaleString() 

            currentDate = new Date()
            currentDateTS = Number(currentDate.getTime())

            console.log(currentPrice)

            //console.log(`${backHistory['high'][backHistory['high'].length-1]} - ${currentLow}`)
            if(getPercentageChange(backHistory['close'][backHistory['close'].length-1], currentPrice) > 0.6 ) { // current low, current high
                if(currentDateTS > lastMessage ){
                    //const humanDateFormat = futureDate.toLocaleString() 
                    if(currentPrice < backHistory['close'][backHistory['close'].length-1]) {
                        fs.appendFile('log2.txt', `Dump ${humanDateFormat}  low: ${currentLow} high: ${currentHigh} Market: ${market} ${getPercentageChange(backHistory['lows'][backHistory['lows'].length-1], candle[1])}`+"\n", function (err) {
                            if (err) throw err;
                            console.log('Dump!');
                            });
                        const pushmsg = async () => pushNotifications(`Dump Alert - ${market} - $${currentPrice.toFixed(3)} <br> <a href="https://ftx.com/trade/${market}">https://ftx.com/trade/${market}</a>`)
                        pushmsg()
                        lastMessage=futureDateTS
                    }
                }
            }
            
            
            if(getPercentageChange(currentLow, currentPrice) > 0.9 ) {
                if(currentPrice > currentLow) {
                    if(currentDateTS > lastMessage ){
                        fs.appendFile('log2.txt', `Pump ${humanDateFormat}   low: ${currentLow} high: ${currentHigh} Market: ${market} ${getPercentageChange(currentLow, currentHigh)}`+"\n", function (err) {
                            if (err) throw err;
                            console.log('Pump!');
                            });
                        const pushmsg = async () => pushNotifications(`Pump Alert - ${market} - $${currentPrice.toFixed(3)} <br> <a href="https://ftx.com/trade/${market}">https://ftx.com/trade/${market}</a>`)
                        pushmsg()
                        currentTrendUp=true
                        lastMessage=futureDateTS
                    }
                }
            }
            
        }

    });

    
}

function getPercentageChange(a, b) {
    return  100 * Math.abs( ( a - b ) / ( (a+b)/2 ) );
}


function toTimeStamp(formatedDate) { // String Date input
    const d = new Date(formatedDate)
    // Return Float, Timestamp
    return d.getTime()
}  

//client.connect('wss://ftx.com/ws/', 'server time');
