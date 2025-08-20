const {fork} =  require('child_process')

const child = fork('child.js')

child.send("i'm parent")

child.on("message", (data)=>{
console.log("data from child ", data)
})