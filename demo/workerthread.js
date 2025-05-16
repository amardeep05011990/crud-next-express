const {parentPort, Worker, workerData, isMainThread} = require('worker_threads');


const worker= new Worker('./worker.js', 
    {
        workerData:{start:0, end:3}
    }
)
worker.on('message', (data)=>{
    console.log("data from worker", data);
});
// function workerThreadMulti(start, end){

//     return new Promise((resolve, reject)=>{
//         const worker= new Worker('./worker.js', 
//             {
//                 workerData:{start:start, end:end}
//             }
//         )
//         worker.on('message', resolve);
// });

// Worker.on('message', resolve);

// }
// const toProcessWorker=[]
// for(i=0; i<3; i++){
//     toProcessWorker.push(workerThreadMulti(i,i+1))
// }
// // console.log(toProcessWorker)
// console.time("start worker")
// Promise.all(toProcessWorker).then((data)=>{
//     console.log("data from all worker", data)
//     const sum = data.reduce((acc, curr)=>{
//         return acc+curr;
//     }, 0)
//     console.log("sum", sum)
// console.timeEnd("start worker")

// });


// function havyTask(){
//     console.time("start")
//     let sum =  0;
//     let i = 0;
//     while(i<1000000){
//         i++;
//         sum = sum+i;
//         // console.log(i)
//     }
//     console.log("sum", sum)
//     console.timeEnd("start")

//     return sum
// }



// if(isMainThread){
//     // This is the main thread
//     console.log("main thread")
//     const worker = new Worker('./worker.js', {
//         workerData: {
//             name: "worker",
//             age: 23,
//         }
//     })
//     worker.on('message', (data)=>{
//         console.log("data from worker", data)
//     })
// }else{
//     // This is the worker thread
//     console.log("worker thread")
//     const sum = havyTask();
//     parentPort.postMessage(sum)
//     // parentPort.on('message', (data)=>{
//     //     console.log("data from main", data)
//     // })
// }

