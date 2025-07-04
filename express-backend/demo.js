var x = 10;

var fun = ()=>{
    var out = "out"
    return ()=>{
        var ind = "ind"
        return ind+out
    }
}

console.log(x)
console.log(fun()())