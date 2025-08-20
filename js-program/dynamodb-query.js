// dynamodb crud and search and filter by name and email query give me with clientdynamodb lib


// ChatGPT said:
// Here's a complete CRUD + search & filter example in DynamoDB using the AWS SDK @aws-sdk/lib-dynamodb (DynamoDBDocumentClient) in Node.js.

// ✅ Prerequisites
// Install AWS SDK v3:

// bash
// Copy
// Edit
// npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb
// 📦 Setup: DynamoDBDocumentClient
// js
// Copy
// Edit
// const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
// const { DynamoDBDocumentClient, PutCommand, GetCommand, DeleteCommand, ScanCommand, UpdateCommand } = require("@aws-sdk/lib-dynamodb");

// const client = DynamoDBDocumentClient.from(new DynamoDBClient({ region: "us-east-1" }));
// ✅ 1. Create (Add User)
// js
// Copy
// Edit
// async function createUser(user) {
//   await client.send(new PutCommand({
//     TableName: "Users",
//     Item: user
//   }));
// }
// ✅ 2. Read (Get by userId)
// js
// Copy
// Edit
// async function getUser(userId) {
//   const result = await client.send(new GetCommand({
//     TableName: "Users",
//     Key: { userId }
//   }));
//   return result.Item;
// }
// ✅ 3. Update User
// js
// Copy
// Edit
// async function updateUser(userId, email) {
//   await client.send(new UpdateCommand({
//     TableName: "Users",
//     Key: { userId },
//     UpdateExpression: "set email = :e",
//     ExpressionAttributeValues: { ":e": email }
//   }));
// }
// ✅ 4. Delete User
// js
// Copy
// Edit
// async function deleteUser(userId) {
//   await client.send(new DeleteCommand({
//     TableName: "Users",
//     Key: { userId }
//   }));
// }
// 🔍 5. Search / Filter by Name or Email
// Use ScanCommand with filter expression:

// js
// Copy
// Edit
// async function searchUsers(name, email) {
//   const result = await client.send(new ScanCommand({
//     TableName: "Users",
//     FilterExpression: "#name = :n OR email = :e",
//     ExpressionAttributeNames: { "#name": "name" },
//     ExpressionAttributeValues: {
//       ":n": name,
//       ":e": email
//     }
//   }));
//   return result.Items;
// }
// Note: Scan is costly; use GSI on name or email for better performance.

// ✅ Example Usage:
// js
// Copy
// Edit
// createUser({ userId: "u123", name: "Alice", email: "alice@example.com" });
// const user = await getUser("u123");
// await updateUser("u123", "new@example.com");
// const users = await searchUsers("Alice", "alice@example.com");


// import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
// import { QueryCommand } from "@aws-sdk/lib-dynamodb";

// const client = new DynamoDBClient({ region: "us-east-1" });

// const params = {
//   TableName: "Orders",
//   KeyConditionExpression: "userId = :uid",
//   ExpressionAttributeValues: {
//     ":uid": "123"
//   },
//   ScanIndexForward: false, // false = DESC, true = ASC
//   Limit: 5
// };

// const command = new QueryCommand(params);
// const result = await client.send(command);

// console.log(result.Items);

