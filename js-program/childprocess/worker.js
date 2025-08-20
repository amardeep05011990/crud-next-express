const {parentPort} = require("worker_threads")

parentPort.postMessage("i am  worker child")

parentPort.on("message", (data)=>{
    console.log(data)
})
