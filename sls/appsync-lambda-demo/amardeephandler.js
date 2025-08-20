
export const xyz = async (event) => {
  console.log("Event:", JSON.stringify(event, null, 2));
  const name = event.arguments?.name || "World" ; // AppSync passes args here
  return `Hello ${name}`;
};