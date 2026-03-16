//subset  of array
let result =[];
function backtrack(path, start){
    result.push([...path])
    for(let i=start;i<arr.length;i++){
        path.push(arr[i])
        backtrack(path, i+1)
        path.pop()
    }
}

let arr = [1,2,3]

backtrack([],0)

console.log(result)





