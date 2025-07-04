const fun1= ()=>{
    return new Promise((resolve, reject)=>{
        resolve("fun1")
    });
}

const fun2= ()=>{
    return new Promise((resolve, reject)=>{
        resolve("fun2")
    });
}
const fun3= ()=>{
    return new Promise((resolve, reject)=>{
        resolve("fun3")
    });
}
const fun4= ()=>{
    return new Promise((resolve, reject)=>{
    try{
        throw new Error('i got error')

        resolve("fun4")
    }catch(err){
        reject(err.message)
    }
    });
}

Promise.allSettled([fun1(), fun2(), fun3(), fun4()]).then(data=>{
    console.log(data);
}).catch((err)=>{
    console.log(err)
})