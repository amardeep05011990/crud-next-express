import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";

const dynamodb = new AWS.DynamoDB.DocumentClient();
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

  await dynamodb
    .put({
      TableName: TABLE_NAME,
      Item: book,
    })
    .promise();

  return book;
};

// ✅ Query: getBook
export const getBook = async (event) => {
  const { id } = event.arguments;

  const result = await dynamodb
    .get({
      TableName: TABLE_NAME,
      Key: { id },
    })
    .promise();

  return result.Item;
};
