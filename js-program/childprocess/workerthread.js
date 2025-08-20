const {Worker , workerData} = require("worker_threads");

const wt = new Worker("./worker.js");

wt.on("message", (data)=>{
    console.log(data)
    wt.postMessage("im from worker parent")
})