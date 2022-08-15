//require crypto from 'crypto';
const crypto = require("crypto")
const config = require('../../config.js')

const {api_key, api_secret, api_server} = config.ftxExchange

function ftxCreateSignature(endpoint, method='GET', payload='') {
    // time stamp, from server
    const d = new Date();
    const ts = Number(d.getTime())

    //Create Signature.
    const reqMethod = method === 'POST' ?  'POST' : 'GET'
    const signature = `${ts}${reqMethod}/api${endpoint}${payload}` //${ts}

    const sha256Hasher = crypto.createHmac("sha256", api_secret);
    const hash = sha256Hasher.update(signature).digest("hex");
    
    return {signature: hash, time: ts}
}


function get(endpoint) {
    
    
    return new Promise(async(resolve, reject)=> {
      
        // const ftxAPI = 'https://ftx.com/api'

        // // time stamp, from server
        // const d = new Date();
        // const ts = Number(d.getTime())


        // //Create Signature.
        // const signature = `${ts}GET/api${ftxEndPoint}` //${ts}

        // const sha256Hasher = crypto.createHmac("sha256", api_secret);
        // const hash = sha256Hasher.update(signature).digest("hex");

        const {signature, time} = ftxCreateSignature(endpoint,'GET')

        fetch(api_server+endpoint,
        {
            method: "GET",
            headers: {
            "FTX-KEY": api_key,
            "FTX-SIGN": signature,
            "FTX-TS": time.toString(),
            }
        })
        .then(response=> response.json())
        .then(data => resolve({ftx:data}))
        .catch(err => reject(err))
    })

}

function marketOrder() {
    
    //  Market Order
    const endpoint = '/orders'

    return new Promise(async(resolve, reject)=> {
      
        // const ftxAPI = 'https://ftx.com/api'

        // // time stamp, from server
        // const d = new Date();
        // const ts = Number(d.getTime())


        // //Create Signature.
        // const signature = `${ts}GET/api${ftxEndPoint}` //${ts}

        // const sha256Hasher = crypto.createHmac("sha256", api_secret);
        // const hash = sha256Hasher.update(signature).digest("hex");

        const orderPayload = {
            "market": "XRP-PERP",
            "side": "buy",
            "price": null,
            "type": "market",
            "size": 10         
        }
        const orderPayloadJson = JSON.stringify(orderPayload)
        //console.log(signature+orderPayloadJson)

        const {signature, time} = ftxCreateSignature(endpoint,'POST', orderPayloadJson)


// POST /orders
// {
//   "market": "XRP-PERP",
//   "side": "sell",
//   "price": 0.306525,
//   "type": "limit",
//   "size": 31431.0,
//   "reduceOnly": false,
//   "ioc": false,
//   "postOnly": false,
//   "clientId": null
// }

        fetch(api_server+endpoint,
        {
            method: "POST",
            headers: {
            "FTX-KEY": api_key,
            "FTX-SIGN": signature,
            "FTX-TS": time.toString(),
            },
            body: orderPayloadJson
        })
        .then(response=> response.json())
        .then(data => resolve({ftx:data}))
        .catch(err => reject(err))
    })

}

module.exports = {get,marketOrder};