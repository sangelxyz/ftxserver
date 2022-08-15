const toTimestamp = (strDate) => {  
    const dt = Date.parse(strDate);  
    return dt / 1000;  
  }  

  var d = new Date("2022-07-24T10:19:31.559939+00:00");
  let timeStamp = d.getTime();

  console.log(d.getTime());

let timestamp = d.getTime()
let date = new Date(timestamp);
console.log(date.getTime())
console.log(date)