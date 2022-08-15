import pushNotifications from './src/notifications/pushOver.js'


const pushmsg = async () => pushNotifications(`Pump Alert - MATIC-PERP - $0.89 <br> <a href="https://ftx.com/trade/MATIC-PERP">https://ftx.com/trade/CRV-PERP</a>`)
pushmsg()