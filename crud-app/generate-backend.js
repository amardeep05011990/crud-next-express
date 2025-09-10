const fs = require('fs');
const path = require('path');
const swaggerSpecObject = require("./swaggerspec");

// import fs from "fs";
// import path from "path";
// import swaggerSpecObject from "./swaggerspec.js";

function createMongooseSchema(fields) {
  return fields
    .map(({ name, type, form }) => 
      { 
        if(type == "ObjectId"){

        return `  ${name}: { type: mongoose.Schema.Types.ObjectId, ref: "${form?.collection}"}`
        }else{
        return `  ${name}: { type: ${type} }`
        }

      })
    .join(',\n');
}

function generateModels(collections, relations) {
//   return collections.map((col) => {
//       const schemaFields = createMongooseSchema(col.fields);

//       const related = relations
//         .filter((r) => {
//          return  r.from === col.id || r.to === col.id
//         })
//         .map((r) => `  ${col.name}: { type: mongoose.Schema.Types.ObjectId, ref: "${col.name}" }`)
//         .join(',\n');
// console.log("related", related)
//       const schema = `
//         const mongoose = require("mongoose");

//         const ${col.name}Schema = new mongoose.Schema({
//         ${schemaFields}
//         ${related ? ',\n' + related : ''}
//         });

//         module.exports = mongoose.model("${col.name}", ${col.name}Schema);
//         `;
//         console.log("schema", schema)

//       return {
//         fileName: `${col.name}.js`,
//         content: schema,
//         folder: 'models',
//       };
//     });
console.log("collections", collections)
return collections.map((col) => {
  const schemaFields = createMongooseSchema(col.fields);

  const related = relations
    .filter((r) => r.from === col.id || r.to === col.id)
    .map((r) => {
      console.log("related data", r)
      const isFrom = r.from === col.id;
      const relatedCollectionId = isFrom ? r.to: r.from;

      // Lookup the name of the related collection
      const relatedCollection = collections.find(c => c.id === relatedCollectionId);
      const relatedName = relatedCollection ? relatedCollection.name : 'Unknown';

      const fieldName = isFrom ? r.fromField : r.toField;

      // const fromFieldName = r.fromField;
      // let fromFieldCollectionName ;
      // if(r.from == col.id){
      //   fromFieldCollectionName =  relations.find((rel)=> {
      //     console.log("rel", rel)
      //   })
      // }
      // const toFieldName = r.toField;
      // console.log("fromField data", fromFieldName, fromFieldCollectionName)
if (r.relationType === 'one-to-many') {
        if(r.from == col.id){
              return `  ${relatedName}: [{ type: mongoose.Schema.Types.ObjectId, ref: "${relatedName}" }]`;
        }else if(r.to == col.id){
              return `  ${relatedName}: { type: mongoose.Schema.Types.ObjectId, ref: "${relatedName}" }`; 
        }
      }else if (r.relationType === 'many-to-many') {
        return `  ${relatedName}: [{ type: mongoose.Schema.Types.ObjectId, ref: "${relatedName}" }]`;
      }else if (r.relationType === 'one-to-one') {
        return `  ${relatedName}: { type: mongoose.Schema.Types.ObjectId, ref: "${relatedName}" }`;
      }
    })
    .join(',\n');

  const schema = `
const mongoose = require("mongoose");

const ${col.name}Schema = new mongoose.Schema({
  ${schemaFields}
  ${related ? ',\n' + related : ''}
});

module.exports = mongoose.models.${col.name} || mongoose.model("${col.name}", ${col.name}Schema);
`;

  return {
    fileName: `${col.name}.js`,
    content: schema,
    folder: 'models',
  };
});

}

// function generateRoutes(collections) {
//   return collections.map((col) => {
//     const lc = col.name.toLowerCase();
//     const content = `
// const express = require("express");
// const router = express.Router();
// const ${col.name} = require("../models/${col.name}");

// // CREATE
// router.post("/", async (req, res) => {
//   const item = new ${col.name}(req.body);
//   const saved = await item.save();
//   res.json(saved);
// });

// // READ ALL
// router.get("/", async (req, res) => {
//   const items = await ${col.name}.find();
//   res.json(items);
// });

// // READ ONE
// router.get("/:id", async (req, res) => {
//   const item = await ${col.name}.findById(req.params.id);
//   res.json(item);
// });

// // UPDATE
// router.put("/:id", async (req, res) => {
//   const updated = await ${col.name}.findByIdAndUpdate(req.params.id, req.body, { new: true });
//   res.json(updated);
// });

// // DELETE
// router.delete("/:id", async (req, res) => {
//   await ${col.name}.findByIdAndDelete(req.params.id);
//   res.json({ message: "${col.name} deleted" });
// });

// module.exports = router;
// `;

//     return {
//       fileName: `${lc}.routes.js`,
//       content,
//       folder: 'routes',
//     };
//   });
// }

function generateRoutes(collections) {
  return collections.map((col) => {
    const lc = col.name.toLowerCase();
        // Define searchable fields (you can customize this later to mark which fields are searchable)
    const searchableFields = col.fields.map((f) => f.name);
    const content = `
const express = require("express");
const { ${col.name}Validator } = require("../validators/${lc}.validator");
const validate = require("../middlewares/validate");
const router = express.Router();
const ${col.name} = require("../models/${col.name}");
const authenticate = require('./../auth/middleware/authenticate')
const authorize = require('./../auth/middleware/authorize')
/**
 * @swagger
 * tags:
 *   name: ${col.name}
 *   description: CRUD operations for ${col.name}
 */

// CREATE
/**
 * @swagger
 * /api/${lc}:
 *   post:
 *     summary: Create a new ${col.name}
 *     tags: [${col.name}]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/${col.name}'
 *     responses:
 *       200:
 *         description: The created ${col.name}
 */
router.post("/", ${col.name}Validator, validate, async (req, res) => {
  const item = new ${col.name}(req.body);
  const saved = await item.save();
  res.json(saved);
});



// READ ALL
/**
 * @swagger
 * /api/${lc}:
 *   get:
 *     summary: Get all ${col.name}
 *     tags: [${col.name}]
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filter by name
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         description: Filter by email
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *         description: Filter by status
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Field to sort by
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Limit number of results
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *     responses:
 *       200:
 *         description: List of ${col.name}
 */
// router.get("/", async (req, res) => {
//   const items = await ${col.name}.find();
//   res.json(items);
// });

// READ ALL with search, filter, and pagination
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 10, search, ...filters } = req.query;
    const query = {};

    // 🔹 Add filters
    // Object.keys(filters).forEach((key) => {
    //   if (typeof filters[key] === "string") {
    //     // Supports: ^start, end$, and contains (default)
    //     query[key] = { $regex: filters[key], $options: "i" };
    //   } else {
    //     query[key] = filters[key];
    //   }
    // });

    // 🔹 Add filters (lookup-aware)
Object.keys(filters).forEach((key) => {
  if ([${col.fields
    .filter((f) => f.form?.input === "lookup")
    .map((f) => `"${f.name}"`)
    .join(", ")}].includes(key)) {
    // Lookup fields: match ObjectId directly
    query[key] = filters[key];
  } else if (typeof filters[key] === "string") {
    // String fields: regex search
    query[key] = { $regex: filters[key], $options: "i" };
  } else {
    query[key] = filters[key];
  }
});


    // 🔹 Add search across searchable fields
    // if (search) {
    //   query["$or"] = ${JSON.stringify(searchableFields)}.map((field) => ({
    //     [field]: { $regex: search, $options: "i" }
    //   }));
    // }
    if (search) {
        query["$or"] = ${JSON.stringify(
        col.fields.filter((f) => f.type !== "ObjectId" &&  f.type !== "Date").map((f) => f.name)
      )}.map((field) => ({
        [field]: { $regex: search, $options: "i" }
      }));
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await ${col.name}.countDocuments(query);

    // 🔹 Base query
    let mongooseQuery = ${col.name}.find(query).skip(skip).limit(parseInt(limit));

    // 🔹 Auto-populate lookup fields
    ${col.fields
      .filter((f) => f.form?.input === "lookup")
      .map(
        (f) => `mongooseQuery = mongooseQuery.populate("${f.name}", "${f.form?.labelField || "name"}");`
      )
      .join("\n    ")}

    const data = await mongooseQuery;

    res.json({
      data,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ ONE
/**
 * @swagger
 * /api/${lc}/{id}:
 *   get:
 *     summary: Get a ${col.name} by ID
 *     tags: [${col.name}]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ${col.name} ID
 *     responses:
 *       200:
 *         description: The ${col.name} data
 */
// router.get("/:id", async (req, res) => {
//   const item = await ${col.name}.findById(req.params.id);
//   res.json(item);
// });
router.get("/:id", async (req, res) => {
  try {
    let mongooseQuery = ${col.name}.findById(req.params.id);

    // 🔹 Auto-populate lookup fields (only if any exist in schema.json)
    ${col.fields
      .filter((f) => f.form?.input === "lookup")
      .map(
        (f) =>
          `mongooseQuery = mongooseQuery.populate("${f.name}", "${f.form?.labelField || "name"}");`
      )
      .join("\n    ")}

    const item = await mongooseQuery;

    if (!item) {
      return res.status(404).json({ message: "${col.name} not found" });
    }

    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE
/**
 * @swagger
 * /api/${lc}/{id}:
 *   put:
 *     summary: Update a ${col.name} by ID
 *     tags: [${col.name}]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ${col.name} ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/${col.name}'
 *     responses:
 *       200:
 *         description: The updated ${col.name}
 */
router.put("/:id", ${col.name}Validator, validate, async (req, res) => {
  const updated = await ${col.name}.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

// DELETE
/**
 * @swagger
 * /api/${lc}/{id}:
 *   delete:
 *     summary: Delete a ${col.name} by ID
 *     tags: [${col.name}]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ${col.name} ID
 *     responses:
 *       200:
 *         description: ${col.name} deleted
 */
router.delete("/:id", async (req, res) => {
  await ${col.name}.findByIdAndDelete(req.params.id);
  res.json({ message: "${col.name} deleted" });
});

module.exports = router;
`;
    return {
      fileName: `${lc}.routes.js`,
      content,
      folder: 'routes',
    };
  });
}


// function generateServerFile(collections) {
//   const imports = collections
//     .map((c) => `app.use("/api/${c.name.toLowerCase()}", require("./routes/${c.name.toLowerCase()}.routes"));`)
//     .join('\n');

//   const content = `
// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");

// const app = express();
// app.use(cors());
// app.use(express.json());

// // mongoose.connect("mongodb://localhost:27017/autogen_crud");
// // MongoDB Connection URI
// const mongoURI = 'mongodb://localhost:27017/autogen_crud'; // replace with your URI
// // Connect to MongoDB
// mongoose.connect(mongoURI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// })
// .then(() => console.log('MongoDB connected'))
// .catch(err => console.error('MongoDB connection error:', err));

// ${imports}

// app.listen(5000, () => console.log("Server running on port 5000"));
// `;

//   return {
//     fileName: 'server.js',
//     content,
//     folder: '',
//   };
// }

function generateServerFile(collections) {
  const imports = collections
    .map((c) => `app.use("/api/${c.name.toLowerCase()}", require("./routes/${c.name.toLowerCase()}.routes"));`)
    .join('\n');

//   const schemaDefs = collections
//     .map((c) => {
//       const props = c.fields.map(f => `        ${f.name}: { type: "${f.type}" }`).join(',\n');
//       return `
//         ${c.name}: {
//           type: "object",
//           properties: {
// ${props}
//           }
//         }
//       `;
//     })
//     .join(',\n');
const schemaDefs ="";

  const content = `
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
// ${schemaDefs}
//       }
//     }
//   },
//   apis: ["./routes/*.js"],
// });

// app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

${imports}
app.use("/api/auth", require("./auth/routes/auth"));
app.listen(5000, () => console.log("Server running on port 5000"));
`;

  return {
    fileName: 'server.js',
    content,
    folder: '',
  };
}


// generate a file called middlewares/validate.js
const validateMiddleware = {
  fileName: "validate.js",
  folder: "middlewares",
  content: `
const { validationResult } = require("express-validator");

module.exports = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};`
};

function generateValidators(collections) {
  return collections.map(col => {
    const rules = col.fields
      .filter(f => f.validation)
      .map(f => {
        const validations = [];
        const v = f.validation;

        if (v.required?.value)
          validations.push(`body("${f.name}").notEmpty().withMessage("${v.required.message || f.name + ' is required'}")`);
        if (v.min?.value)
          validations.push(`body("${f.name}").isLength({ min: ${v.min.value} }).withMessage("${v.min.message || f.name + ' is too short'}")`);
        if (v.max?.value)
          validations.push(`body("${f.name}").isLength({ max: ${v.max.value} }).withMessage("${v.max.message || f.name + ' is too long'}")`);

        return validations.join(",\n  ");
      }).filter(Boolean).join(",\n  ");

    const validatorCode = `
const { body } = require("express-validator");

exports.${col.name}Validator = [
  ${rules}
];
`;

    return {
      fileName: `${col.name.toLowerCase()}.validator.js`,
      content: validatorCode,
      folder: "validators"
    };
  });
}

const swaggerSpecFile = {
  fileName: "swaggerspec.js",
  folder: "",
  content: `
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
    const model = require(\`./models/\${modelName}\`);
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
`
};




// 🔥 Run this
function generateBackendFiles(schema) {
  const basePath = path.join(__dirname, 'backendapp');
  const { collections, relations } = schema;

  const files = [
    ...generateModels(collections, relations),
     ...generateValidators(collections), 
    ...generateRoutes(collections),
    generateServerFile(collections),
    validateMiddleware,
    swaggerSpecFile
  ];

  files.forEach(({ fileName, content, folder }) => {
    const dir = path.join(basePath, folder);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, fileName), content, 'utf-8');
    console.log("✅", folder || ".", "/", fileName);
  });
}

// Load your exported JSON
const schema = require("./schema.json"); // 👈 your generated file
// import schema from "./schema.json";

generateBackendFiles(schema);


// Remove this line, because now schema will come from the API request
// const schema = require("./schema.json");

// // Export the function to generate files
// module.exports.generateBackendFiles = (schema) => {
//   const basePath = path.join(__dirname, 'backendapp');
//   const { collections, relations } = schema;

//   const files = [
//     ...generateModels(collections, relations),
//     ...generateValidators(collections),
//     ...generateRoutes(collections),
//     generateServerFile(collections),
//     validateMiddleware,
//     swaggerSpecFile,
//   ];

//   files.forEach(({ fileName, content, folder }) => {
//     const dir = path.join(basePath, folder);
//     if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
//     fs.writeFileSync(path.join(dir, fileName), content, 'utf-8');
//     console.log('✅', folder || '.', '/', fileName);
//   });

//   return { success: true, message: 'Backend files generated successfully.' };
// };


// Note-- some important points

// // In users model
// usersSchema.virtual("myPosts", {
//   ref: "posts",
//   localField: "_id",
//   foreignField: "users"
// });

// usersSchema.set("toObject", { virtuals: true });
// usersSchema.set("toJSON", { virtuals: true });
