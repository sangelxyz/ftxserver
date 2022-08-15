//const WebSocket = require('ws');
//const ws = new WebSocket.Server({ port: 7071 });

//const WebSocket = require('websocket').client;
//let ws = client('wss://ftx.com/ws/')

// node --max-old-space-size=4096


//import WebSocket from 'ws';
import WebSocket, { WebSocketServer } from 'ws';
import pushNotifications from './src/notifications/pushOver.js'
//const pushNotifications = require("./src/notifications/pushOver.js")

const ws = new WebSocket('wss://ftx.com/ws/');

const logData= [0,0,[],0,[],[]] // buy, sell, order id, last fill price, market strenth 15mins, price 15mins

ws.on('open', function open() {
  ws.send(JSON.stringify({'op': 'subscribe', 'channel': 'trades', 'market': 'MATIC-PERP'})); //  CHZ-PERP
});

ws.on('message', function message(data) {
    // 10 sec heart beat
    //setInterval(async()=> ws.send(JSON.stringify({'op': 'ping'})),10000) 

    // 
    setInterval(async()=> {
        // 15mins last strength
        logData[4].push(logData[0]-logData[1])
        // price 15mins
        logData[5].push(logData[3])
    },1000*60) // 15mins

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
        console.log('Market Stregth: '+(logData[0]-logData[1]).toFixed(2))
        
// Price
        if(logData[4].length > 0) {
            // if previous volume ± (1%) && price (+-1%) within is Neutral area (support, resistence)
            
            if(getPercentageChange(logData[4][logData[4].length-1], (logData[0]-logData[1])) > 1 ) {
                console.log('Neutral Volume Range - Resistance')
                console.log(`${(logData[4][logData[4].length-1]-1.04).toFixed(2)} - ${(logData[0]-logData[1]).toFixed(2)} - ${(logData[4][logData[4].length-1]*1.04).toFixed(2)}`)
            }
            //less) 20600 > 20000 && 20000 > less
            if(logData[5][logData[5].length-1]*1.02 > logData[3] && logData[3] > logData[5][logData[5].length-1]-1.02 ) {
                console.log('Neutral Price Range - Resistance')
                console.log(`${(logData[5][logData[5].length-1]-1.04).toFixed(2)} - ${logData[3].toFixed(2)} - ${(logData[5][logData[5].length-1]*1.04).toFixed(2)}`)
                //If market strength  is gaining on neutral  price(Bullish)
                //if(Math.sign(logData[4][logData[4].length-1]*1.10) === -1) {
                    //const pushmsg = async () => pushNotifications(`Bullish Break Matic `)
                    // pushmsg()
                    // const volumeAdj = logData[4][logData[4].length-1]*1.10
                //}
                

                if(getPercentageChange(logData[4][logData[4].length-1], (logData[0]-logData[1])) > 2) {
                    // more then 2% and price is neutral. slightly bullish.
                    const pushmsg = async () => pushNotifications(`Bullish Break Matic `)
                    pushmsg()
                    console.log(`Bullish Volume, Resistance Break: ${(logData[0]-logData[1])} ${Math.sign(getPercentageChange(logData[4][logData[4].length-1], (logData[0]-logData[1])))}%`)
                }
            }



            console.log('Last 15min Market Stregth: '+logData[4][logData[4].length-1])
            console.log('Last 15min Market Price: '+logData[5][logData[5].length-1])
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
    var decreaseValue = oldNumber - newNumber;

    return (decreaseValue / oldNumber) * 100;
}

function bin2string(array){
	let result = "";
	for(let i = 0; i < array.length; ++i){
		result+= (String.fromCharCode(array[i]));
	}
	return result;
}

//client.connect('wss://ftx.com/ws/', 'server time');