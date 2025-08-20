process.on('message', (data)=>{
    console.log("data", data);
    process.send("yes i receiving the datan"+ data)
})