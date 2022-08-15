const ftx = require('./src/exchange/ftx.js') 

//console.log(async () => ftxEndpoints.getAccountPositions())

// endpoints = {get: {
//     account: '/account',
//     positions: '/positions',
//     futures: '/futures', // list
// }}

// Open Positions
const ftxPositions = (type='all')=> { // open, closed, All positions
    ftx.get('/positions').then((data)=> {

        for(const result of data.ftx.result) {
            const {future, size, side, netSize, longOrderSize, shortOrderSize, cost, entryPrice, unrealizedPnl, realizedPnl, initialMarginRequirement, maintenanceMarginRequirement, openSize, collateralUsed, estimatedLiquidationPrice} = result
            // Open postions
            
            if(parseFloat(result.openSize) !== 0 && type=='open') {
                //console.log(result)
                //const pnl = unrealizedPnl/size
                //To calculate pnl we need price
                console.log(`${future} : entry: ${entryPrice} : size: ${size}`) //.openSize
            }
            // closed positions
            else if (parseFloat(result.openSize) === 0  && type=='closed') {
                console.log(`${future} : entry: ${entryPrice} : size: ${size} Closed`) //.openSize
            }
            // All positions, open and closed
            else if (type=='all') {
                console.log(`${future} : entry: ${entryPrice} : size: ${size} All Positions`) //.openSize
            }
            
        }
    }) 
}

// ftx.get('/account').then((data)=> {
//     //const {takerFee, makerFee, futuresLeverage} = data.ftx.result
//     console.log(data.ftx.result)
// }) // Past positions..

console.log(ftxPositions('all'))

//console.log(getAccountPositions)