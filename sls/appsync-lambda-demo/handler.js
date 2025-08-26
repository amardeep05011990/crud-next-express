import { v4 as uuidv4 } from "uuid";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: process.env.AWS_REGION || "us-west-2" });
const dynamodb = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.BOOK_TABLE;

// ✅ Query: hello
export const hello = async (event) => {
  console.log("Event:", JSON.stringify(event, null, 2));
  const name = event.arguments?.name || "World";
  return `Hello ${name}`;
};

// ✅ Mutation: addBook
export const addBook = async (event) => {
  const { title, author, price, publishedYear } = event.arguments;

  const book = {
    id: uuidv4(),
    title,
    author,
    price,
    publishedYear,
  };

  await dynamodb.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: book,
    })
  );

  return book;
};

// ✅ Query: getBook
export const getBook = async (event) => {
  const { id } = event.arguments;

  const result = await dynamodb.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { id },
    })
  );

  return result.Item;
};
