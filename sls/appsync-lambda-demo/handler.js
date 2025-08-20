// 'use strict';

// module.exports.hello = async (event) => {
//   return {
//     statusCode: 200,
//     body: JSON.stringify(
//       {
//         message: 'Go Serverless v1.0! Your function executed successfully!',
//         input: event,
//       },
//       null,
//       2
//     ),
//   };

//   // Use this code if you don't use the http event with the LAMBDA-PROXY integration
//   // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
// };

// export const hello = async (event) => {
//   console.log("AppSync Event:", JSON.stringify(event, null, 2));

//   const name = event.arguments?.name || "World";
//   return `Hello, ${name}!`;
// };

export const hello = async (event) => {
  console.log("Event:", JSON.stringify(event, null, 2));
  const name = event.arguments?.name || "World" ; // AppSync passes args here
  return `Hello ${name}`;
};