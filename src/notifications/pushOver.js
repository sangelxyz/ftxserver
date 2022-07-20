// Use push over to send Apple, Android push notifications
// Todo : Multi-device, Groups, Async


//const config = require('../../config.js')
import config from '../../config.js'

function pushOverMessage(msg) {
    const {server, endpoint, api_key, user_key, deviceID} = config.pushOver
    const urlencoded = new URLSearchParams();
    urlencoded.append("token", api_key);
    urlencoded.append("user", user_key);
    urlencoded.append("message", msg.toString());
    fetch(server+endpoint,
    {
        method: "POST",
        'device': deviceID,
        body: urlencoded,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",            
        }
        
    })
    .then(response=> response.text())
    .then(data => {
        //console.log(data)
        return data
        //resolve(data)
    })
    .catch(err => reject(err))
//}) // promise end


}

//module.exports = pushOverMessage;
export default pushOverMessage