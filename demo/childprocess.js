const {fork} = require('child_process');
const child = fork('./child.js')

child.on('message', (data)=>{
    // process.send("i am")
    console.log("data receided back", data)
})

child.send({
    task: "started"
})