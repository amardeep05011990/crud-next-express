process.on('message', (data)=>{
    console.log("child received", data)
    process.send(data)
})