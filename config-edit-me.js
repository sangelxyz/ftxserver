// Rename to config.js
const config = {
    pushOver : {
        server: 'https://api.pushover.net:443',
        endpoint: '/1/messages.json',
        api_key: '',
        user_key: '', 
        deviceID: ''        
    },
    ftxExchange : { // Use ReadOnly keys.
        api_key: '',
        api_secret: '',
        api_server: 'https://ftx.com/api',
        
    }

}

export default config
//module.exports = config;