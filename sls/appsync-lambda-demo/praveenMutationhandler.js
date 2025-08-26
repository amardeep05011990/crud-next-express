import { v4 as uuidv4 } from "uuid";   
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: process.env.AWS_REGION || "us-west-2" });
const dynamodb = DynamoDBDocumentClient.from(client);

export const abc = async (event) => {
  console.log("Praveen mutation data:", JSON.stringify(event, null, 2));

  // Get GraphQL mutation arguments
  const { title, author } = event.arguments;

  // Generate a unique ID for the item
  const id = uuidv4();

  const params = {
    TableName: process.env.TODO_TABLE_NAME,
    Item: {
      id,       // no need for { S: id }
      title,
      author
    }
  };

  try {
    await dynamodb.send(new PutCommand(params));

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
