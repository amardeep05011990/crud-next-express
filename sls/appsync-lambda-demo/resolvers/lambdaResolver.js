// export function request(ctx) {
//   // return {
//   //   operation: "Invoke",
//   //   payload: {
//   //     // field: ctx.info.fieldName,
//   //     // arguments: ctx.args,
//   //     // identity: ctx.identity,
//   //   },
//   // };
//     // Forward GraphQL args (none in this case)
//   return {
//     operation: "Invoke",
//     payload: ctx.args || {}
//   };
// }

// export function response(ctx) {
//   return ctx.result;
// }


export function request(ctx) {
  return {
    operation: "Invoke",
    payload: {
      arguments: ctx.arguments
    }
  };
}

export function response(ctx) {
  return ctx.result;
}
