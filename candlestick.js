// fetch candle stick data, write to CSV

import fs from "fs"


const trackedCoins = ['YFII','YFI','ENS','CEL','OMG','SCRT','EGLD','RSR','AR'] //
//'BTC','ETH','SOL','MATIC','ETC'
//'AVAX','BNB','APE','ADA'
//'XRP','GMT','AAVE','DOT','LINK'
//'CRV','FTM','NEAR','SAND','AXS','GALA','LOOKS','RUNE','FTT','DYDX','DOGE','SNX','WAVESE','TRX','EOS','SUSHI','UNI','FIL','ALGO','FIDA','SRM','ICP','RAY','COMP','THEATA','ZEC','MANA','VET','PREP','1INCH','XTZ','PEOPLE','MKR','XLM','BSV','ZIL','KNC','DENT','YFII','YFI','ENS','CEL','OMG','SCRT','EGLD','RSR','AR'
//,'CRV','FTM','NEAR','SAND','AXS','GALA','LOOKS','RUNE','FTT','DYDX','DOGE','SNX','WAVESE','TRX','EOS','SUSHI','UNI','FIL','ALGO','FIDA','SRM','ICP','RAY','COMP','THEATA','ZEC','MANA','VET','PREP','1INCH','XTZ','PEOPLE','MKR','XLM','BSV','ZIL','KNC','DENT','YFII','YFI','ENS','CEL','OMG','SCRT','EGLD','RSR','AR',''
//,'ATOM','BCH'


const startDate = new Date(2022,5,1,0,0,0,0)
const startDateTS = Number(startDate.getTime())

const endDate = new Date(2022,6,1,0,0,0,0)
const endDateTS = Number(endDate.getTime())

// 86400 = 1 day
const chartResolution = 86400

// setInterval(()=> {
   for(const tracked of trackedCoins) {
      candleData(tracked) // need to add date.
   }
   
   function candleData(coin) {
      fetch('https://data.messari.io/api/v1/assets/'+coin+'/metrics/price/time-series?start=2022-06-17&interval=1d') // &end=2020-06-01
      .then(resp=> resp.json())
      .then(data=> {
        
         // Date,Open,High,Low,Close,Adj Close,Volume date format 2020-01-02
         let CSVdata = "Date,Open,High,Low,Close,Adj Close,Volume\r\n"
         //if (!data.data.values) throw('no data returned')
         for(const day of data.data.values) {
            const [timestamp, open, high, low, close, volume] = day
            let formatDate = new Date(timestamp)
            let newMonth = (formatDate.getMonth()+1).toString().padStart(2,'0')
            let  newDay = formatDate.getDate().toString().padStart(2,'0')
            CSVdata += `${formatDate.getFullYear()}-${newMonth}-${newDay},${open},${high},${low},${close},${close},${volume}`
            CSVdata += "\n"
         }
   console.log(CSVdata)

         // fs.writeFile('./csv/'+coin+".csv", CSVdata, "utf-8", (err) => {
         //    if (err) console.log(err);
         //    else console.log("Data saved");
         // });
         fs.writeFileSync('./csv/'+coin+".csv", CSVdata)
         
         //console.log(data.data.values)
      })
      .catch(err=> console.log(err))

   }

   // },(1000)) // 1000ms * 60 sec * 10 mins

