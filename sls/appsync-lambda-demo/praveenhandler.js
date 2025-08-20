
export const klm = async (event) => {
  console.log("Event:", JSON.stringify(event, null, 2));
  const name = event.arguments?.address || "India" ; // AppSync passes args here
  return `Hello ${name}`;
};