const fs = require("fs");

let readStream = fs.createReadStream("./xyz.txt");
let WriteStream = fs.createWriteStream("./writefile.txt");

// readStream.on("data", (rdata)=>{
//     // console.log(rdata.toString().toUpperCase());

//     WriteStream.write(rdata.toString().toUpperCase())
// })

readStream.pipe((rdata)=>rdata.toString().toUpperCase()).pipe(WriteStream);