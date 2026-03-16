// Q. Find max no in array
const arr = [5,3,1,8,10,2];

// let max = -Infinity;

// for(let i =0; i< arr.length; i++){
//     if(arr[i] > max){
//         max = arr[i]
//     }
// }
// console.log(max)

//  calculate  2nd max
// let max = -Infinity;
// let secondmax = -Infinity;
// for(let i =0; i< arr.length; i++){
//     if(arr[i] > max){
//         secondmax = max;
//         max = arr[i]
//     }else if(arr[i] != max && arr[i] > secondmax ){
//         secondmax = arr[i]
//     }
// }
// console.log(max)
// console.log(secondmax)

// 
// let min =arr[0]-arr[1];
// for (let j = 0; j < arr.length; j++) {
//    for (let i = j+1; i < arr.length; i++) {
//     let diff = arr[i] > arr[j] ? arr[i]-arr[j] : arr[j]-arr[i]
//     console.log(diff)
//     if(diff<  min){
//         min = diff
//     }
    
// }
    
// }

// console.log("min", min)

const mindiff = arr.sort((a,b)=> a-b).map((ele, i)=> {
    console.log(ele, arr[i+1])
    return  arr[i-1] -ele
}, 0 );
console.log(Math.min(...mindiff))