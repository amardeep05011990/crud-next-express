
const swaggerJsdoc = require("swagger-jsdoc");
const mongooseToSwagger = require("mongoose-to-swagger");
const fs = require("fs");
const path = require("path");

// Dynamically load all models
const modelsPath = path.join(__dirname, "./models");
const files = fs.readdirSync(modelsPath);

// Generate Swagger schemas from Mongoose models
const schemas = {};

files.forEach((file) => {
  if (file.endsWith(".js")) {
    const modelName = path.basename(file, ".js");
    const model = require(`./models/${modelName}`);
    const swaggerSchema = mongooseToSwagger(model);
    schemas[modelName] = swaggerSchema;
  }
});

// Swagger configuration
const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Auto-Generated CRUD API",
      version: "1.0.0",
    },
    components: {
      schemas, // Inject the generated schemas here
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./routes/*.js","./auth/routes/*.js"], // path to your route files with Swagger comments
});

module.exports = swaggerSpec;
