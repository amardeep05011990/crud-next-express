const os = require("os");
const cluster = require('cluster');
const express = require('express');

console.log("cpu", os.cpus().length);

if (cluster.isMaster) {
    for (let i = 0; i < os.cpus().length; i++) {
        cluster.fork();
    }
    cluster.on('exit', (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died`);
    });
} else {
    const app = express();

    app.get('/', (req, res) => {
        // setTimeout(() => {
        //     console.log("timeout")
        // }, 10000)
        // blockEventLoop(5000); // blocks event loop for 5 seconds
        console.log("request received")
        res.send('Hello from worker ' + process.pid);
    });

    const PORT = 3000;
    app.listen(PORT, () => {
        console.log(`Worker ${process.pid} is listening on port ${PORT}`);
    });
}