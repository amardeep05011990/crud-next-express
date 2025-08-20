// handler.js
const { v4: uuidv4 } = require("uuid");
const AWS = require("aws-sdk");

const dynamodb = new AWS.DynamoDB.DocumentClient();

module.exports.addBook = async (event) => {
  try {
    console.log("Add Book Event:", JSON.stringify(event, null, 2));

    const args = event.arguments;

    const book = {
      id: uuidv4(),
      title: args.title,
      author: args.author,
      price: args.price,
      publishedYear: args.publishedYear,
    };

    await dynamodb
      .put({
        TableName: process.env.BOOK_TABLE,
        Item: book,
      })
      .promise();

    return book; // return newly created book
  } catch (error) {
    console.error("Error adding book:", error);
    throw new Error("Failed to add book");
  }
};
