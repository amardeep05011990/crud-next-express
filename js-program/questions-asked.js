// Question 1 ->
abc();
 xyz();

 function abc() {
   console.log('abc');
 }

 var xyz = () => {
   console.log('xyz');
 };

 console.log(x);
 var x = 10;

 console.log(y);
 let y = 20;

// Abc
// undedind
// Undifined
// Refrence error


// Question 2

// const main = () => {
//   console.log('Hello');
//   sleep(5000); // Blocks for 5 seconds
//   console.log('World');
// };


// Question 3 -> 
// Find 3rd highest salary from employees table.
// Select salary  from employees orderby salary desc limit 1, offset 2



// Question 4 - 

// function outer() {
//   var counter = 0;
//   return function () {
//     counter++;
//     console.log(counter);
//   };
// }

// const fn = outer();
// fn();
// fn();
// fn();
// output:-
// 1
// 2
// 3


// Question 5 ->
// function makeCounter() {
//   let count = 0;
//   return function () {
//     return count++;
//   };
// }

// const c1 = makeCounter();
// const c2 = makeCounter();

// console.log(c1()); //
// console.log(c1()); //
// console.log(c2()); //

// 0
// 1
// 0

