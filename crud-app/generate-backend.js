const fs = require('fs');
const path = require('path');

function createMongooseSchema(fields) {
  return fields
    .map(({ name, type }) => `  ${name}: { type: ${type} }`)
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
return collections.map((col) => {
  const schemaFields = createMongooseSchema(col.fields);

  const related = relations
    .filter((r) => r.from === col.id || r.to === col.id)
    .map((r) => {
      const isFrom = r.from === col.id;
      const relatedCollectionId = isFrom ? r.to : r.from;

      // Lookup the name of the related collection
      const relatedCollection = collections.find(c => c.id === relatedCollectionId);
      const relatedName = relatedCollection ? relatedCollection.name : 'Unknown';

      const fieldName = isFrom ? r.toField : r.fromField;

      return `  ${fieldName}: { type: mongoose.Schema.Types.ObjectId, ref: "${relatedName}" }`;
    })
    .join(',\n');

  const schema = `
const mongoose = require("mongoose");

const ${col.name}Schema = new mongoose.Schema({
  ${schemaFields}
  ${related ? ',\n' + related : ''}
});

module.exports = mongoose.model("${col.name}", ${col.name}Schema);
`;

  return {
    fileName: `${col.name}.js`,
    content: schema,
    folder: 'models',
  };
});

}

function generateRoutes(collections) {
  return collections.map((col) => {
    const lc = col.name.toLowerCase();
    const content = `
const express = require("express");
const router = express.Router();
const ${col.name} = require("../models/${col.name}");

// CREATE
router.post("/", async (req, res) => {
  const item = new ${col.name}(req.body);
  const saved = await item.save();
  res.json(saved);
});

// READ ALL
router.get("/", async (req, res) => {
  const items = await ${col.name}.find();
  res.json(items);
});

// READ ONE
router.get("/:id", async (req, res) => {
  const item = await ${col.name}.findById(req.params.id);
  res.json(item);
});

// UPDATE
router.put("/:id", async (req, res) => {
  const updated = await ${col.name}.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

// DELETE
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

function generateServerFile(collections) {
  const imports = collections
    .map((c) => `app.use("/api/${c.name.toLowerCase()}", require("./routes/${c.name.toLowerCase()}.routes"));`)
    .join('\n');

  const content = `
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://localhost:27017/autogen_crud");

${imports}

app.listen(5000, () => console.log("Server running on port 5000"));
`;

  return {
    fileName: 'server.js',
    content,
    folder: '',
  };
}

// 🔥 Run this
function generateBackendFiles(schema) {
  const basePath = path.join(__dirname, 'backendapp');
  const { collections, relations } = schema;

  const files = [
    ...generateModels(collections, relations),
    ...generateRoutes(collections),
    generateServerFile(collections),
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

generateBackendFiles(schema);

