// Worker, Spin markets for notfications.
// Set Markets, run: node worker.spinmarkets.js


// Settings
const marketPair = ['BTC-PERP','ETH-PERP','CEL-PERP','MANA-PERP','LOOKS-PERP','FLOW-PERP','DYDX-PERP','SNX-PERP','XEM-PERP'] // 'BTC-PERP',
const marketSampleSize = 3 // Mins
let marketOutput = []

//import WebSocket from 'ws';
import WebSocket, { WebSocketServer } from 'ws'
import pushNotifications from './src/notifications/pushOver.js'

for(const market of marketPair) {
    trackMarket(market,marketSampleSize)
}

setInterval(()=> {
    console.clear()
    marketPair.forEach((pair)=> {
        console.log('')
        console.log('-----'+pair+'-----')
        console.log(`Market Strength: ${(marketOutput[pair].marketStrength === undefined ? '0' : marketOutput[pair].marketStrength)}`)
        console.log(`Volume Strength: ${(marketOutput[pair].volumeStrength === undefined ? '0' : marketOutput[pair].volumeStrength)}`)
        console.log(`Volume Range: ${(marketOutput[pair].volumeRange === undefined ? 'Loading..' : marketOutput[pair].volumeRange)}`)
        console.log(`Current Price:  ${(marketOutput[pair].price === undefined ? '0' : marketOutput[pair].price)}`)
        console.log(`Current Price Range:  ${(marketOutput[pair].priceRange === undefined ? 'Loading..' : marketOutput[pair].priceRange)}`)
        console.log('')
        console.log('--------------------------------------------------------------')
    })
    //console.clear()
    //console.log(marketOutput)
    //console.clear()
},1000) 

async function trackMarket(market, marketSampleSize){    
    let lastMessage = 0
    let currentDate = new Date()
    let currentDateTS = Number(currentDate.getTime())
    
    marketOutput[market] = {'marketStrength': ''}

    const wss = new WebSocket('wss://ftx.com/ws/')
    
    const logData= [0,0,[],0,[],[]] // buy, sell, order id, last fill price, market strenth 15mins, price 15mins
    
    //const pushmsg = async () => pushNotifications(`Online Market ${marketPair} - ${currentDate}`)
    //pushmsg()

    if(!marketOutput[market]) {
        marketOutput[market] = {'marketStrength': 0, 'volumeRange' : '', 'volumeStrength' : 0, 'priceRange' : '','price': 0}

    }

    // wss.on('close', function() {
    //     setTimeout(connect, reconnectInterval);
    // })
    
    wss.on('open', function open() {
    //   ws.isAlive = true;
    //   ws.on('pong', heartbeat);
    wss.send(JSON.stringify({'op': 'subscribe', 'channel': 'trades', 'market': market})); 
    });
    
    setInterval(async()=> wss.send(JSON.stringify({'op': 'ping'})),10000) 
    
      setInterval(async()=> {
        // 15mins last strength
        logData[4].push(logData[0]-logData[1])
        // price 15mins
        logData[5].push(logData[3])
    },1000*60*marketSampleSize) // 15mins
    
    wss.on('message', function message(data) {
        // 10 sec heart beat
        //setInterval(async()=> ws.send(JSON.stringify({'op': 'ping'})),10000) 
    
        // 
        //console.log(market)
        //console.log(data.toString())
        //ws.send('something');
    
        //const rawData = JSON.parse(data)
    
        //for(const bids of rawData) {
        const rawData = JSON.parse(data.toString()) //bin2string(data) convert binary data to string.
        
        //console.log(JSON.parse(data))
        if(rawData['data']) {
            
            for (const items of rawData['data']) {
                //console.log(items.side)
                const {price, size, side, id} = items
    
    
                
                //if(!logData[2].includes(id)) {
                    //logData[2].push(id)
                    
                    logData[3] = price
                    if(side == 'buy') {
                        //logData[0].push(size)
                        logData[0] = logData[0]+size
                    }
                    else {
                        //logData[1].push(size)
                        logData[1] = logData[1]+size
                    }
                //}
    
    
            }
    
        }
        // if(logData[0].length > 0) {
        //     console.log('total Buy:'+logData[0].reduce((total, val)=> total+val))
        // }
        // if(logData[1].length > 0) {
        //     console.log('Total Sell:'+logData[1].reduce((total, val)=> total+val))
        // }
        //const [sellSide, buySide, orderId, lastFill, pastMarketStrenth, pastMarketPrice] = logData;
        if(logData[0] > 0 && logData[1] > 0) {
            //const sellSide = logData[1].reduce((total, val)=> total+val)
            //const buySide = logData[0].reduce((total, val)=> total+val)
            //console.clear()
            //console.log(getPercentageChange(logData[4][logData[4].length-1], (logData[0]-logData[1])))
            
            marketOutput[market].marketStrength = (logData[0]-logData[1]).toFixed(2)
            //console.log('hihi')
            //console.log('Market Strength: '+(logData[0]-logData[1]).toFixed(2))
            currentDate = new Date()
            currentDateTS = Number(currentDate.getTime())
    
            if(logData[4].length > 0) {

                if(getPercentageChange(logData[4][logData[4].length-1], (logData[0]-logData[1])) < 2.5 &&  getPercentageChange(logData[4][logData[4].length-1], (logData[0]-logData[1])) > -2.5) {
                    // --- console.log('Neutral Volume Range - Resistance')
                    marketOutput[market].volumeRange = 'Neutral'
                    //console.log('test')
                 }
                if(getPercentageChange(logData[5][logData[5].length-1], logData[3]) > 5) {
                    marketOutput[market].priceRange = 'Bullish'
                    if (currentDateTS > lastMessage ){
                        const pushmsg = async () => pushNotifications(`${market} price increased more then 5%`)
                        pushmsg()
                        let minutesToAdd=5;
                        let futureDate = new Date(currentDate.getTime() + minutesToAdd*60000);
                        let futureDateTS = Number(futureDate.getTime())
                        lastMessage=futureDateTS
                    }
                }
                //less) 20600 > 20000 && 20000 > less
                //logData[5][logData[5].length-1]*1.02 > logData[3] && logData[3] > logData[5][logData[5].length-1]-1.02
                if( getPercentageChange(logData[5][logData[5].length-1], logData[3]) < 2.5 &&  getPercentageChange(logData[5][logData[5].length-1], logData[3]) > -2.5 ) {
                    // --- console.log(`Neutral Price Range - Resistance, Change: ${getPercentageChange(logData[3], logData[5][logData[5].length-1]).toFixed(2)}`)

                    // Bullish Volume more then 5% change, Price Action stable.
                    if(getPercentageChange(logData[4][logData[4].length-1], (logData[0]-logData[1])) > 5) {
                        // more then 2% and price is neutral. slightly bullish.
                        const neutralPriceBullishVolume = `Bullish Resistance Break ${market} Price: ${logData[3].toFixed(2)} `
                        marketOutput[market].volumeRange = 'Bullish'
                        marketOutput[market].priceRange = 'Neutral'
                        // --- console.log(neutralPriceBullishVolume)
                        // --- console.log(`${currentDateTS} ${lastMessage}`)
                        if (currentDateTS > lastMessage ){
                            const pushmsg = async () => pushNotifications(neutralPriceBullishVolume)
                            pushmsg()
                            let minutesToAdd=5;
                            let futureDate = new Date(currentDate.getTime() + minutesToAdd*60000);
                            let futureDateTS = Number(futureDate.getTime())
                            lastMessage=futureDateTS
                        }
                    }
    
                }
    
    
    
                // --- console.log('Last 15min Market Stregth: '+logData[4][logData[4].length-1].toFixed(2))
                // --- console.log('Last 15min Market Price: '+logData[5][logData[5].length-1].toFixed(2))

            }
            
            // --- console.log('Last Fill Price: $'+logData[3].toFixed(2))
            // --- console.log('Volume-+: '+(logData[0]+logData[1]).toFixed(2))
            marketOutput[market].volumeStrength = (logData[0]+logData[1]).toFixed(2)
            marketOutput[market].price = logData[3].toFixed(2)
            
        }
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


function getPercentageChange(oldNumber, newNumber){
    const decreaseValue = (newNumber - oldNumber) / Math.abs(oldNumber)

    return (decreaseValue / oldNumber) * 100;
}




//client.connect('wss://ftx.com/ws/', 'server time');
