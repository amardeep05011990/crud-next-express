// function moveZeros(arr) { 
// let nonZeros=0;
// for(let i=0; i<arr.length;i++){
//  if(arr[i] !==0){
//     arr[nonZeros++]= arr[i]
//  }
// }
// for(let i=nonZeros; i<arr.length;i++){
//     arr[i]=0
// }
// console.log(arr, nonZeros);

// }

// moveZeros([1, 0, 1, 2, 0, 1, 3]);

// function moveZeros(arr) {
//    const nonZeroElements = arr.filter(num => num !== 0);
//    const zeroCount = arr.length - nonZeroElements.length;
//    return [...nonZeroElements, ...Array(zeroCount).fill(0)];
// }

// console.log(moveZeros([1, 0, 1, 2, 0, 1, 3]));

const obj = {name: "John", age: 30, city: "New York"};
// console.log(Object.keys(obj))
// for(let key of Object.keys(obj)){
//       console.log(key, obj[key])
// }
Object.entries(obj).filter(([key, value]) => {
    console.log(key, value)
    return value=== "John"
})
// console.log()
const sortedObj = Object.keys(obj)
   .sort()
   .reduce((acc, key) => {
      acc[key] = obj[key];
      return acc;
   }, {});

console.log(sortedObj);

const sortedObjAlt = Object.fromEntries(
   Object.entries(obj).sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
);

console.log(sortedObjAlt);