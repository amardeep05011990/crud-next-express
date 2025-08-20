import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";   // to generate unique IDs

const dynamodb = new AWS.DynamoDB();

export const abc = async (event) => {
  console.log("paraveen mutation data :", JSON.stringify(event, null, 2));

  // Get GraphQL mutation arguments
  const { title, author } = event.arguments;

  // Generate a unique ID for the item
  const id = uuidv4();

  const params = {
    Item: {
      "id": { S: id },
      "title": { S: title },
      "author": { S: author }
    },
    TableName: process.env.TODO_TABLE_NAME,
    ReturnConsumedCapacity: "TOTAL"
  };

  try {
    await dynamodb.putItem(params).promise();

    // Return back the stored item
    return {
      id,
      title,
      author
    };
  } catch (err) {
    console.error("DynamoDB Error:", err);
    throw new Error("Failed to save item");
  }
};
