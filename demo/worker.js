const {parentPort, workerData} = require('worker_threads');

console.log(workerData);
let sum = 0;
for (let i = workerData.start; i <= workerData.end; i++) {
  sum += i;
}
parentPort.postMessage(sum)