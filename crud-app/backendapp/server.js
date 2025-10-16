
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
// const mongoURI = 'mongodb://localhost:27017/autogen_crud';
const mongoURI = 'mongodb+srv://amardeepk3db:Amar%4088258825@cluster0.ggymu.mongodb.net';

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
// Serve robots.txt to avoid 404 in ZAP scans
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send('User-agent: *\nDisallow: /');
});

// Serve a basic sitemap.xml
app.get('/sitemap.xml', (req, res) => {
  res.type('application/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>http://localhost:5000/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`);
});
// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/health", (req,res)=>{
  res.send({status: "healty"})
})
app.use("/api/students", require("./routes/students.routes"));
app.use("/api/assignments", require("./routes/assignments.routes"));
app.use("/api/users", require("./routes/users.routes"));
app.use("/api/posts", require("./routes/posts.routes"));
app.use("/api/demouser", require("./routes/demouser.routes"));
app.use("/api/demopost", require("./routes/demopost.routes"));
app.use("/api/auth", require("./auth/routes/auth"));
app.listen(5000, () => console.log("Server running on port 5000"));
