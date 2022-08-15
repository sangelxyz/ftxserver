// FTX Websocket client, track  Volume/Price.
// Attempts to detect colidated breakouts.

// node --max-old-space-size=4096


// Settings
const marketPair = 'BTC-PERP' //CEL-PERP
const marketSampleSize = 15 // Mins

//import WebSocket from 'ws';
import WebSocket, { WebSocketServer } from 'ws'
import pushNotifications from './src/notifications/pushOver.js'


let lastMessage = 0
let currentDate = new Date()
let currentDateTS = Number(currentDate.getTime())

const ws = new WebSocket('wss://ftx.com/ws/')

const logData= [0,0,[],0,[],[]] // buy, sell, order id, last fill price, market strenth 15mins, price 15mins

//const pushmsg = async () => pushNotifications(`Online Market ${marketPair} - ${currentDate}`)
//pushmsg()

ws.on('open', function open() {
//   ws.isAlive = true;
//   ws.on('pong', heartbeat);
  ws.send(JSON.stringify({'op': 'subscribe', 'channel': 'trades', 'market': marketPair})); 
});

setInterval(async()=> ws.send(JSON.stringify({'op': 'ping'})),10000) 

  setInterval(async()=> {
    // 15mins last strength
    logData[4].push(logData[0]-logData[1])
    // price 15mins
    logData[5].push(logData[3])
},1000*60*marketSampleSize) // 15mins

ws.on('message', function message(data) {
    // 10 sec heart beat
    //setInterval(async()=> ws.send(JSON.stringify({'op': 'ping'})),10000) 

    // 


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
        console.clear()
        //console.log(getPercentageChange(logData[4][logData[4].length-1], (logData[0]-logData[1])))
        console.log('Market Stregth: '+(logData[0]-logData[1]).toFixed(2))
        currentDate = new Date()
        currentDateTS = Number(currentDate.getTime())

        if(logData[4].length > 0) {
            // if previous volume ± (1%) && price (+-1%) within is Neutral area (support, resistence)
            
            // +_
            
            // console.log(logData[4][logData[4].length-1])
            // console.log(getPercentageChange(logData[4][logData[4].length-1]-(logData[4][logData[4].length-1], (logData[0]-logData[1]))))
            // console.log((logData[0]-logData[1]))
            if(getPercentageChange(logData[4][logData[4].length-1], (logData[0]-logData[1])) < 2.5 &&  getPercentageChange(logData[4][logData[4].length-1], (logData[0]-logData[1])) > -2.5) {
                console.log('Neutral Volume Range - Resistance')
                //console.log(`${(logData[0]-logData[1]).toFixed(2)} Change: ${getPercentageChange(logData[4][logData[4].length-1]-(logData[4][logData[4].length-1]))}`)
            }
            //less) 20600 > 20000 && 20000 > less
            //logData[5][logData[5].length-1]*1.02 > logData[3] && logData[3] > logData[5][logData[5].length-1]-1.02
            if( getPercentageChange(logData[3], logData[5][logData[5].length-1]) < 2.5 &&  getPercentageChange(logData[3], logData[5][logData[5].length-1]) > -2.5 ) {
                console.log(`Neutral Price Range - Resistance, Change: ${getPercentageChange(logData[3], logData[5][logData[5].length-1]).toFixed(2)}`)
                //console.log(`${(logData[5][logData[5].length-1]-1.04).toFixed(2)} - ${logData[3].toFixed(2)} - ${(logData[5][logData[5].length-1]*1.04).toFixed(2)}`)
                //If market strength  is gaining on neutral  price(Bullish)
                // if(Math.sign(logData[4][logData[4].length-1]*1.10) === -1) {
                //     const volumeAdj = logData[4][logData[4].length-1]*1.10
                // }
                
                // Bullish Volume more then 5% change, Price Action stable.
                if(getPercentageChange(logData[4][logData[4].length-1], (logData[0]-logData[1])) > 5) {
                    // more then 2% and price is neutral. slightly bullish.
                    const neutralPriceBullishVolume = `Bullish Resistance Break ${marketPair} Price: ${logData[3].toFixed(2)} `
                    console.log(neutralPriceBullishVolume)
                    console.log(`${currentDateTS} ${lastMessage}`)
                    if (currentDateTS > lastMessage ){
                        const pushmsg = async () => pushNotifications(neutralPriceBullishVolume)
                        pushmsg()
                        let minutesToAdd=5;
                        let futureDate = new Date(currentDate.getTime() + minutesToAdd*60000);
                        let futureDateTS = Number(futureDate.getTime())
                        lastMessage=futureDateTS
                    }
                }
                // Bearish Volume more then 5% change, Price Action stable.
                // else if(getPercentageChange(logData[4][logData[4].length-1], (logData[0]-logData[1])) > -5) {
                //     // more then 2% and price is neutral. slightly bullish.
                //     const neutralPriceBullishVolume = `Bearish Resistance ${marketPair} Vol Change: ${getPercentageChange(logData[4][logData[4].length-1], (logData[0]-logData[1])).toFixed(2)}% }`
                //     console.log(neutralPriceBullishVolume)
                //     if (lastMessage === false){
                //         const pushmsg = async () => pushNotifications(neutralPriceBullishVolume)
                //         pushmsg()
                //     }
                // }

            }



            console.log('Last 15min Market Stregth: '+logData[4][logData[4].length-1].toFixed(2))
            console.log('Last 15min Market Price: '+logData[5][logData[5].length-1].toFixed(2))
            //console.log(`getPercentageChange(,(logData[0]+logData[1]))`)
        }
        
        console.log('Last Fill Price: $'+logData[3].toFixed(2))
        console.log('Volume-+: '+(logData[0]+logData[1]).toFixed(2))
        
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


function getPercentageChange(oldNumber, newNumber){
    const decreaseValue = (newNumber - oldNumber) / Math.abs(oldNumber)

    return (decreaseValue / oldNumber) * 100;
}




//client.connect('wss://ftx.com/ws/', 'server time');
