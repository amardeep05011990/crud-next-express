
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerSpec = require("./swaggerspec");
const cookieParser = require('cookie-parser');


const app = express();
app.use(cookieParser());
// app.use(cors());
app.use(cors({
  origin: "http://localhost:4200",
  credentials: true // ✅ allow cookies
}));
app.use(express.json());

// MongoDB URI
const mongoURI = 'mongodb://localhost:27017/autogen_crud';
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// // Swagger setup
// const swaggerSpec = swaggerJsdoc({
//   definition: {
//     openapi: "3.0.0",
//     info: {
//       title: "Auto-Generated CRUD API",
//       version: "1.0.0",
//     },
//     components: {
//       schemas: {
// 
//       }
//     }
//   },
//   apis: ["./routes/*.js"],
// });

// app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/students", require("./routes/students.routes"));
app.use("/api/assignments", require("./routes/assignments.routes"));
app.use("/api/users", require("./routes/users.routes"));
app.use("/api/posts", require("./routes/posts.routes"));
app.use("/api/demouser", require("./routes/demouser.routes"));
app.use("/api/demopost", require("./routes/demopost.routes"));
app.use("/api/auth", require("./auth/routes/auth"));
app.listen(5000, () => console.log("Server running on port 5000"));
