const ftxConnection = require('./ftx.js') 


// /account

// todo

// list all futures
// GET /futures

//
//GET /futures/{future_name}
//
// stats
//GET /futures/{future_name}/stats
// 
// Funding rates
// GET /funding_rates

//  index weights ALT/MID/SHIT/EXCH/DRAGON.
//  GET /indexes/{index_name}/weights

//Historical index expired futures
// GET /indexes/{market_name}/candles?resolution={resolution}&start_time={start_time}&end_time={end_time}

// account positions
// GET /positions
function getAccountPositions() {
    // returns promise.
    return ftxConnection('/positions')
    
}

module.exports = {getAccountPositions};

// POST /orders
