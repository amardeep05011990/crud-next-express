const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const { func } = require("joi");
const app = express();
app.use(express.json());
app.use(cors());

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, "public")));

// Serve node_modules so that we can import directly from them
app.use("/node_modules", express.static(path.join(__dirname, "node_modules")));

// ✅ **MongoDB Connection**
mongoose.connect("mongodb://localhost:27017/form_builder_test_with_sms", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.pluralize(null);


// ✅ **Form Schema**
const formSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Form Name
  structure: { type: Array, required: true }, // Form Fields Structure
  collectionName: { type: String, required: true }, // Store the collection name for form submissions
});

const Form = mongoose.model("forms", formSchema);

// ✅ **Form Data Schema (For Storing User Inputs)**
const formDataSchema = new mongoose.Schema({
  formId: { type: mongoose.Schema.Types.ObjectId, ref: "Form", required: true },
  submittedData: { type: Object, required: true }, // Store User Inputs as JSON
  createdAt: { type: Date, default: Date.now },
});

const FormData = mongoose.model("formdatas", formDataSchema);

//
// ────────────────────────────────────────────────────────
//   ██████╗ ███████╗ ██████╗ ██╗███████╗███╗   ██╗
//  ██╔═══██╗██╔════╝██╔═══██╗██║██╔════╝████╗  ██║
//  ██║   ██║███████╗██║   ██║██║█████╗  ██╔██╗ ██║
//  ██║   ██║╚════██║██║   ██║██║██╔══╝  ██║╚██╗██║
//  ╚██████╔╝███████║╚██████╔╝██║███████╗██║ ╚████║
//   ╚═════╝ ╚══════╝ ╚═════╝ ╚═╝╚══════╝╚═╝  ╚═══╝
// ────────────────────────────────────────────────────────
//

// ✅ **Get All Forms**
app.get("/api/", async (req, res) => {
  try {
    // const forms = await Form.find();
    res.json({ status: "success", data: "yes working fine" });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// ✅ **Create a New Form**
app.post("/api/forms", async (req, res) => {
  try {
    // const { name, structure } = req.body;
    // const form = new Form({ name, structure });
    // await form.save();
    // res.status(201).json({ status: "success", data: form });
    const { name, structure } = req.body;
    const collectionName = `form_${name.toLowerCase().split(" ").join("_")}`; // Generate a unique collection name
    // ${new mongoose.Types.ObjectId().toHexString()}

    const form = new Form({ name, structure, collectionName });
    await form.save();

      // // ✅ Define a blank schema
      // const BlankSchema = new mongoose.Schema({}, { strict: false });

      // // ✅ Create a Mongoose model (collection will be created automatically when used)
      // const BlankCollection = mongoose.model(collectionName, BlankSchema);
      // try {
      //   await BlankCollection.createCollection(); // Creates a blank collection
      //   console.log("✅ Blank collection created successfully!");
      // } catch (error) {
      //   console.error("❌ Error creating collection:", error);
      // }
      
    res.status(201).json({ status: "success", data: form });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// ✅ **Get All Forms**
app.get("/api/forms", async (req, res) => {
  try {
    const forms = await Form.find();
    res.json({ status: "success", data: forms });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// ✅ **Get a Specific Form by ID**
app.get("/api/forms/:id", async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) return res.status(404).json({ status: "error", message: "Form not found" });

    res.json({ status: "success", data: form });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

async function renameCollection(oldName, newName) {
  try {

    const db = mongoose.connection.db;

    // Check if the collection exists before renaming
    const collections = await db.listCollections().toArray();
    const collectionExists = collections.some(col => col.name === oldName);

    if (!collectionExists) {
      console.log(`❌ Collection "${oldName}" does not exist.`);
      return;
    }

    // Rename the collection
    await db.collection(oldName).rename(newName);
    console.log(`✅ Collection "${oldName}" renamed to "${newName}" successfully.`);
  } catch (error) {
    console.error("❌ Error renaming collection:", error);
  } finally {
    // mongoose.disconnect();
  }
}

// ✅ **Update an Existing Form**
app.put("/api/forms/:id", async (req, res) => {
  try {
    const { name, structure } = req.body;

    const form = await Form.findById(req.params.id);
    const oldCollectionName = form?.collectionName.toLowerCase() ?? "";
    console.log("oldCollectionName", oldCollectionName)
    if (!form) return res.status(404).json({ status: "error", message: "Form not found" });

    const newCollectionName = `form_${name.toLowerCase().split(" ").join("_")}`; // Generate a unique collection name
    // ${new mongoose.Types.ObjectId().toHexString()}
    if(oldCollectionName != newCollectionName) await renameCollection(oldCollectionName, newCollectionName)
    const updatedForm = await Form.findByIdAndUpdate(req.params.id, { name, structure, collectionName: newCollectionName }, { new: true });

    if (!updatedForm) return res.status(404).json({ status: "error", message: "Form not found" });

    res.json({ status: "success", data: updatedForm });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// ✅ **Delete a Form**
app.delete("/api/forms/:id", async (req, res) => {
  try {
    await Form.findByIdAndDelete(req.params.id);
    res.json({ status: "success", message: "Form deleted successfully" });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

//
// ────────────────────────────────────────────────────────
//   ███████╗███╗   ███╗███████╗███╗   ██╗██████╗
//   ██╔════╝████╗ ████║██╔════╝████╗  ██║██╔══██╗
//   █████╗  ██╔████╔██║█████╗  ██╔██╗ ██║██║  ██║
//   ██╔══╝  ██║╚██╔╝██║██╔══╝  ██║╚██╗██║██║  ██║
//   ███████╗██║ ╚═╝ ██║███████╗██║ ╚████║██████╔╝
//   ╚══════╝╚═╝     ╚═╝╚══════╝╚═╝  ╚═══╝╚═════╝
// ────────────────────────────────────────────────────────
//

function getDynamicModel(collectionName) {
  if (mongoose.models[collectionName]) {
    return mongoose.models[collectionName]; // ✅ Return existing model
  }
  
  // ✅ Create a new model if it doesn't exist
  return mongoose.model(collectionName, new mongoose.Schema({}, { strict: false }));
}

// ✅ **Save User Submission**
app.post("/api/forms/:id/submit", async (req, res) => {
  try {
    // const { id } = req.params;
    // const { submittedData } = req.body;

    // const form = await Form.findById(id);
    // if (!form) return res.status(404).json({ status: "error", message: "Form not found" });

    // const formData = new FormData({ formId: id, submittedData });
    // await formData.save();
    // res.status(201).json({ status: "success", data: formData });

    const { id } = req.params;
    const { submittedData } = req.body;

    // ✅ Find the form to get its collection name
    const form = await Form.findById(id);
    if (!form) return res.status(404).json({ message: "Form not found" });


    let updatedSubmittedData = { ...submittedData };

    // ✅ Identify fields that need ObjectId conversion
    form.structure.forEach((row) => {
      row.columns.forEach((col) => {
        if (col.source === "collection" || col.source === "relation") {
          const key = `${row.id}-${col.id}`;

          // ✅ Convert to ObjectId (for single value fields)
          if (submittedData[key] && typeof submittedData[key] === "string") {
            updatedSubmittedData[key] = new mongoose.Types.ObjectId(submittedData[key]);
          }

          // ✅ Convert to ObjectId (for multi-select Many-to-Many)
          if (Array.isArray(submittedData[key])) {
            updatedSubmittedData[key] = submittedData[key].map((val) =>
              new mongoose.Types.ObjectId(val)
            );
          }
        }
      });
    });

    // ✅ Get the dynamic collection name
    const collectionName = form.collectionName;
    // const DynamicModel = mongoose.model(collectionName, new mongoose.Schema({ submittedData: Object }, { strict: false }));
    const DynamicModel = getDynamicModel(collectionName)

    // ✅ Save submission in the dynamic collection
    const newSubmission = new DynamicModel({ formId: id, submittedData: updatedSubmittedData });
    await newSubmission.save();

    res.status(201).json({ status: "success", data: newSubmission });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// // ✅ **Get All Submissions for a Form**
// app.get("/api/forms/:id/submissions", async (req, res) => {
//   try {
//     // const { id } = req.params;
//     // const submissions = await FormData.find({ formId: id });

//     // res.json({ status: "success", data: submissions });
//     const { id } = req.params;

//     // ✅ Get collection name from Form metadata
//     const form = await Form.findById(id);
//     if (!form) return res.status(404).json({ message: "Form not found" });

//     // ✅ Dynamically fetch data from the right collection
//     const collectionName = form.collectionName;
//     console.log(mongoose.models)
//   // ✅ Check if the model already exists before compiling it
//   const DynamicModel = mongoose.models[collectionName] 
//   ? mongoose.models[collectionName] 
//   : mongoose.model(collectionName, new mongoose.Schema({}, { strict: false }));

//     const submissions = await DynamicModel.find();
//     console.log(mongoose.models)

//     res.json({ status: "success", data: submissions });
//   } catch (error) {
//     console.log(error)
//     res.status(500).json({ status: "error", message: error.message });
//   }
// });


// ✅ Get paginated and searchable submissions
// app.get("/api/forms/:id/submissions", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { page = 1, limit = 5, search = "" } = req.query;

//     const form = await Form.findById(id);
//     if (!form) return res.status(404).json({ message: "Form not found" });

//     const collectionName = form.collectionName ?? "";
//     // const DynamicModel = mongoose.model(collectionName, new mongoose.Schema({}, { strict: false }));
//       // ✅ Check if the model already exists before compiling it
//   const DynamicModel = mongoose.models[collectionName] 
//   ? mongoose.models[collectionName] 
//   : mongoose.model(collectionName, new mongoose.Schema({}, { strict: false }));

//      // ✅ Extract field mappings (ID -> Label)
//      let fieldMappings = {};
//      form.structure.forEach((row) => {
//        row.columns.forEach((col) => {
//          fieldMappings[`${row.id}-${col.id}`] = col.label;
//        });
//      });
 
//      // ✅ Build Dynamic Search Query
//      let filter = {};
//      if (search) {
//        filter = {
//          $or: Object.keys(fieldMappings).map((fieldId) => ({
//            [`submittedData.${fieldId}`]: { $regex: search, $options: "i" },
//          })),
//        };
//      }
 
//      // ✅ Get paginated results
//      const skip = (page - 1) * limit;
//      const submissions = await DynamicModel.find(filter).skip(skip).limit(Number(limit));
//      const totalSubmissions = await DynamicModel.countDocuments(filter);
 
//      res.json({ status: "success", data: submissions, total: totalSubmissions, fieldMappings });
 
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ status: "error", message: error.message });
//   }
// });


// app.get("/api/forms/:id/submissions", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { page = 1, limit = 5, search = "" } = req.query;

//     // ✅ Get Form Structure
//     const form = await Form.findById(id);
//     const sourceCollection = form.structure.flatMap(data=> {
//       // if(data.colums.source = "collection") return true;
//       return data.columns.filter((col)=>{
//         // console.log("col", col)
//         if(col.source == "collection") return true;
//       })
//     })
//     console.log( "sourceCollection", sourceCollection)
//     console.log( "sourceCollection", sourceCollection[0]['collection'])

//     // console.log("form", form)
//     if (!form) return res.status(404).json({ message: "Form not found" });

//     const collectionName = form.collectionName ?? "";

//     // ✅ Check if model exists before compiling
//     const DynamicModel = mongoose.models[collectionName]
//       ? mongoose.models[collectionName]
//       : mongoose.model(collectionName, new mongoose.Schema({}, { strict: false }));

//     // ✅ Extract field mappings (ID -> Label)
//     let fieldMappings = {};
//     form.structure.forEach((row) => {
//       row.columns.forEach((col) => {
//         fieldMappings[`${row.id}-${col.id}`] = col.label;
//       });
//     });

//     // ✅ Build Dynamic Search Query
//     let searchQuery = {};
//     if (search) {
//       searchQuery = {
//         $or: Object.keys(fieldMappings).map((fieldId) => ({
//           [`submittedData.${fieldId}`]: { $regex: search, $options: "i" },
//         })),
//       };
//     }

//     // ✅ Aggregation Pipeline
//     const pipeline = [
//       { $match: searchQuery }, // 🔍 Apply search filter
//       {
//         $addFields:{
//           "classId": { $toObjectId : "$submittedData.1741690904256-1741690904256" }
//         } 
//       },
   
//       {
//         $lookup: {
//           from: "form_manage_class",
//           localField: "classId",
//           foreignField: "_id",
//           as: "class"
//         }
//       },
//          {
//         $addFields:{
//           "teacherId": { $toObjectId : "$submittedData.1741707916732-1741707916732" }
//         } 
//       },

//       {
//         $lookup: {
//           from: "form_teacher",
//           localField: "teacherId",
//           foreignField: "_id",
//           as: "teacher"
//         }
//       },
//       // {
//       //   $addFields: {
//       //     "submittedData.CityName": { $arrayElemAt: ["$cityDetails.submittedData.1738776781847-1738776781847", 0] },
//       //   },
//       // },
//       // { $unset: "cityDetails" }, // ❌ Remove joined data after extraction
//       { $skip: (page - 1) * Number(limit) },
//       { $limit: Number(limit) },
//     ];

//     // ✅ Run Aggregation
//     const submissions = await DynamicModel.aggregate(pipeline);
//     console.log("submissions", submissions)
//     console.log("submissions", submissions[0]["result"])

//     const totalSubmissions = await DynamicModel.countDocuments(searchQuery);

//     // ✅ Send Response
//     res.json({ status: "success", data: submissions, total: totalSubmissions, fieldMappings });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ status: "error", message: error.message });
//   }
// });

app.get("/api/forms/:id/submissions", async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 5, search = "" } = req.query;

    // ✅ Get Form Structure
    const form = await Form.findById(id);
    if (!form) return res.status(404).json({ message: "Form not found" });

    const collectionName = form.collectionName ?? "";

    // ✅ Check if model exists before compiling
    const DynamicModel = mongoose.models[collectionName]
      ? mongoose.models[collectionName]
      : mongoose.model(collectionName, new mongoose.Schema({}, { strict: false }));

    // ✅ Extract field mappings (ID -> Label)
    let fieldMappings = {};
    form.structure.forEach((row) => {
      row.columns.forEach((col) => {
        fieldMappings[`${row.id}-${col.id}`] = col.label;
      });
    });

    // ✅ Extract fields where `source` is "collection"
    const collectionFields = form.structure.flatMap(row =>
      row
      .columns.filter(col => col.source === "collection" || col.relationType === "Many-to-Many")
      .map(col => ({ ...col, rowId: row.id, relationType: col.relationType })) // ✅ Add `rowId`
    );

    console.log("📌 Collection Fields:", collectionFields);

    // ✅ Fetch referenced collection names dynamically
    const collectionIds = collectionFields.map(col => col.collection);
    const referencedForms = await Form.find({ _id: { $in: collectionIds } });

    // ✅ Create a mapping: { collectionId -> collectionName }
    const collectionMap = {};
    referencedForms.forEach(f => {
      collectionMap[f._id.toString()] = f.collectionName;
    });

    console.log("🔄 Collection Mapping:", collectionMap);

    // ✅ Build Dynamic Search Query
    let searchQuery = {};
    if (search) {
      searchQuery = {
        $or: Object.keys(fieldMappings).map((fieldId) => ({
          [`submittedData.${fieldId}`]: { $regex: search, $options: "i" },
        })),
      };
    }

    // ✅ Start Aggregation Pipeline
    let pipeline = [{ $match: searchQuery }];

    // ✅ Dynamically Add Lookups with `from` set to the actual collection name
    collectionFields.forEach((col) => {
      const fieldPath = `submittedData.${col?.rowId}-${col.id}`;
      const actualCollectionName = collectionMap[col.collection] || col.collection;
      if (col.relationType === "One-to-One" || col.relationType === "One-to-Many" || col.source =="collection") {

      pipeline.push(
        { 
          $addFields: { [`${col.id}_ObjectId`]: { $toObjectId: `$${fieldPath}` } } 
        },
        {
          $lookup: {
            from: actualCollectionName,  // ✅ Dynamically set collection name
            localField: `${col.id}_ObjectId`,
            foreignField: "_id",
            as: `${col.label}_Details`
          }
        },
        {
          $addFields: {
            [`submittedData.${col.label}`]: { $arrayElemAt: [`$${col.label}_Details.submittedData`, 1] }
          }
        },
        // { $unset: `${col.label}_Details` } // ✅ Remove extra lookup results
      );
    }else if(col.relationType === "Many-to-Many"){
      // pipeline.push(
      //   {
      //     $addFields: {
      //       // 🔄 Convert course IDs array elements to ObjectId for lookup
      //       courseIds: {
      //         $map: {
      //           input: {
      //             $reduce: {
      //               input: "$submittedData.1742020856526-1742020856526",
      //               initialValue: [],
      //               in: { $concatArrays: ["$$value", { $ifNull: ["$$this", []] }] }
      //             }
      //           },
      //           as: "id",
      //           in: { $toObjectId: "$$id" }
      //         }
      //       },
      //       collectionTypeId: { $toObjectId: "$submittedData.1742020846297-1742123985115" } // 🔄 Convert collection type to ObjectId
      //     }
      //   },
      //   {
      //     $lookup: {
      //       from: "form_manage_collection", // 🔍 Join with Collection Table
      //       localField: "collectionTypeId",
      //       foreignField: "_id",
      //       as: "collectionTypeDetails"
      //     }
      //   },
      //   {
      //     $lookup: {
      //       from: "form_courses", // 🔍 Join with Courses Table
      //       localField: "courseIds",
      //       foreignField: "_id",
      //       as: "courseDetails"
      //     }
      //   },
      //   {
      //     $project: {
      //       _id: 1,
      //       "submittedData.1742020846297-1742020846297": 1, // ✅ Keep user name
      //       collectionTypeDetails: { $arrayElemAt: ["$collectionTypeDetails", 0] }, // ✅ Extract first object
      //       courseDetails: 1 // ✅ Keep all course details
      //     }
      //   }
      // );

      pipeline.push(
        {
          $lookup: {
            from: actualCollectionName,  // ✅ Dynamically set collection name
            localField: fieldPath ,
            foreignField: "_id",
            as: `${col.label}_Details`
          }
        },
      )
      // {
      //   "$lookup": {
      //     "from": "form_books",
      //     "localField": "submittedData.1742020846297-1742123985115",
      //     "foreignField": "_id",
      //     "as": "type_collection_details"
      //   }
      // },
    }
    });

    // ✅ Add Pagination
    pipeline.push(
      { $skip: (page - 1) * Number(limit) },
      { $limit: Number(limit) }
    );
    console.log("pipeline=========")
    console.dir(pipeline, { depth: null, colors: true });


    // ✅ Run Aggregation
    const submissions = await DynamicModel.aggregate(pipeline);
    console.log("submissions=========")
    console.dir(submissions, { depth: null, colors: true });

    // console.log("submissions['Class_Details']=========", submissions[0]["Class_Details"])


    const totalSubmissions = await DynamicModel.countDocuments(searchQuery);

    // ✅ Send Response
    res.json({ status: "success", data: submissions, total: totalSubmissions, fieldMappings });

  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: error.message });
  }
});


// app.get("/api/forms/:id/submissions", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { page = 1, limit = 5, search = "" } = req.query;

//     // ✅ Fetch Form Schema
//     const form = await Form.findById(id);
//     if (!form) return res.status(404).json({ message: "Form not found" });

//     const collectionName = form.collectionName;
//     const DynamicModel = mongoose.models[collectionName]
//       ? mongoose.models[collectionName]
//       : mongoose.model(collectionName, new mongoose.Schema({}, { strict: false }));

//     // ✅ Identify Relation Fields
//     const relationFields = form.structure.flatMap(row =>
//       row.columns
//       .filter(col => col.source === "relation" || col.source =="collection")
//       .map(col => ({ ...col, rowId: row.id })) // ✅ Add `rowId`

//     );

//         // ✅ Extract field mappings (ID -> Label)
//     let fieldMappings = {};
//     form.structure.forEach((row) => {
//       row.columns.forEach((col) => {
//         fieldMappings[`${row.id}-${col.id}`] = col.label;
//       });
//     });

//         const collectionMap = {};
//     referencedForms.forEach(f => {
//       collectionMap[f._id.toString()] = f.collectionName;
//     });

//     console.log("🔄 Collection Mapping:", collectionMap);

//         // ✅ Build Dynamic Search Query
//     let searchQuery = {};
//     if (search) {
//       searchQuery = {
//         $or: Object.keys(fieldMappings).map((fieldId) => ({
//           [`submittedData.${fieldId}`]: { $regex: search, $options: "i" },
//         })),
//       };
//     }

//     // ✅ Construct Aggregation Pipeline
//     // let pipeline = [{ $match: {} }];
//     let pipeline = [{ $match: searchQuery }];

//     for (const col of relationFields) {
//       if (col.relationType === "One-to-One" || col.relationType === "One-to-Many" || col.source =="collection") {
//         // ✅ Lookup for One-to-One & One-to-Many Relations
//         pipeline.push({
//           $lookup: {
//             from: col.collection,
//             localField: `submittedData.${col.rowId}-${col.id}`,
//             foreignField: "_id",
//             as: `${col.label}_Details`
//           }
//         });
//       } else if (col.relationType === "Many-to-Many") {
//         // ✅ Many-to-Many requires a middle collection
//         const middleCollection = `form_${collectionName}_${col.collection}_relations`;

        // pipeline.push(
        //   {
        //     $lookup: {
        //       from: middleCollection,
        //       localField: "_id",
        //       foreignField: "sourceId",
        //       as: `${col.label}_Relations`
        //     }
        //   },
        //   { $unwind: { path: `$${col.label}_Relations`, preserveNullAndEmptyArrays: true } },
        //   {
        //     $lookup: {
        //       from: col.collection,
        //       localField: `${col.label}_Relations.targetId`,
        //       foreignField: "_id",
        //       as: `${col.label}_Details`
        //     }
        //   }
        // );
//       }
//     }

//     // ✅ Apply Pagination
//     pipeline.push(
//       { $skip: (page - 1) * Number(limit) },
//       { $limit: Number(limit) }
//     );

//     // ✅ Execute Aggregation
//     const submissions = await DynamicModel.aggregate(pipeline);
//     console.dir("submissions")
//     console.dir(submissions, {depth: null})
//     console.dir(pipeline, {depth: null})


//     const totalSubmissions = await DynamicModel.countDocuments(searchQuery);
//     res.json({ status: "success", data: submissions,  total: totalSubmissions });

//   } catch (error) {
//     console.error("Error fetching submissions:", error);
//     res.status(500).json({ status: "error", message: error.message });
//   }
// });






// ✅ **Get BY submissionId OF  Submissions for a Form**
app.get("/api/forms/:id/submissions/:submissionId", async (req, res) => {
  try {
    // const { id, submissionId } = req.params;
    // const submissions = await FormData.find({ _id: submissionId });

    // res.json({ status: "success", data: submissions });
    const { id, submissionId } = req.params;

    // ✅ Get the correct collection name
    const form = await Form.findById(id);
    if (!form) return res.status(404).json({ message: "Form not found" });
    console.log(mongoose.models)

    const collectionName = form.collectionName;
  // ✅ Check if the model already exists before compiling it
  const DynamicModel = mongoose.models[collectionName] 
  ? mongoose.models[collectionName] 
  : mongoose.model(collectionName, new mongoose.Schema({}, { strict: false }));

    const submission = await DynamicModel.findById(submissionId);
    console.log(mongoose.models, submission)

    if (!submission) return res.status(404).json({ message: "Submission not found" });

    res.json({ status: "success", data: submission });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});
// ✅ **Update a Form Submission**
app.put("/api/forms/:formId/submissions/:submissionId", async (req, res) => {
  try {
    const { formId, submissionId } = req.params;
    const { submittedData } = req.body;

    // ✅ Get the correct collection name
    const form = await Form.findById(formId);
    if (!form) return res.status(404).json({ message: "Form not found" });

    let updatedSubmittedData = { ...submittedData };

    // ✅ Identify fields that need ObjectId conversion
    form.structure.forEach((row) => {
      row.columns.forEach((col) => {
        if (col.source === "collection" || col.source === "relation") {
          const key = `${row.id}-${col.id}`;

          // ✅ Convert to ObjectId (for single value fields)
          if (submittedData[key] && typeof submittedData[key] === "string") {
            updatedSubmittedData[key] = new mongoose.Types.ObjectId(submittedData[key]);
          }

          // ✅ Convert to ObjectId (for multi-select Many-to-Many)
          if (Array.isArray(submittedData[key])) {
            updatedSubmittedData[key] = submittedData[key].map((val) =>
              new mongoose.Types.ObjectId(val)
            );
          }
        }
      });
    });

    const collectionName = form.collectionName;
    const DynamicModel = getDynamicModel(collectionName)

    const updatedSubmission = await DynamicModel.findByIdAndUpdate(
      submissionId,
      { submittedData : updatedSubmittedData },
      { new: true }
    );

    if (!updatedSubmission) return res.status(404).json({ status: "error", message: "Submission not found" });

    res.json({ status: "success", data: updatedSubmission });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// ✅ **Delete a Submission**
app.delete("/api/forms/:formId/submissions/:submissionId", async (req, res) => {
  try {
    await FormData.findByIdAndDelete(req.params.submissionId);
    res.json({ status: "success", message: "Submission deleted successfully" });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});


app.get("/api/forms/:formId/collections/search", async (req, res) => {
  try {
    const searchQuery = req.query.query;
    const { formId } = req.params;

    // ✅ Get the correct collection name
    const form = await Form.findById(formId);
    if (!form) return res.status(404).json({ message: "Form not found" });
    const collectionName = form.collectionName;
    const DynamicModel = getDynamicModel(collectionName)
    if (!searchQuery) return res.json({ status: "success", data: [] });

    // ✅ Use MongoDB's `text` index for fast searching
    const results = await DynamicModel.find(
      { name: { $regex: searchQuery, $options: "i" } } // Case-insensitive search
    )
      .limit(10) // Limit results for performance
      .select("name"); // Return only necessary fields

    res.json({ status: "success", data: results });
  } catch (error) {
    console.error("❌ Error searching:", error);
    res.status(500).json({ status: "error", message: "Server Error" });
  }
});


// ✅ Page Schema
const PageSchema = new mongoose.Schema({
  title: String,
  sections: Array,
});
const Page = mongoose.model("Page", PageSchema);

// ✅ Create a New Page
app.post("/api/pages", async (req, res) => {
  try {
    const page = new Page(req.body);
    await page.save();
    res.status(201).json({ status: "success", data: page });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// ✅ Get All Pages
app.get("/api/pages", async (req, res) => {
  try {
    const pages = await Page.find();
    res.status(200).json({ status: "success", data: pages });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// ✅ Get Page by ID
app.get("/api/pages/:id", async (req, res) => {
  try {
    const page = await Page.findById(req.params.id);
    if (!page) return res.status(404).json({ status: "error", message: "Page not found" });
    res.status(200).json({ status: "success", data: page });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// ✅ Update Page
app.put("/api/pages/:id", async (req, res) => {
  try {
    const updatedPage = await Page.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ status: "success", data: updatedPage });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// ✅ Delete Page
app.delete("/api/pages/:id", async (req, res) => {
  try {
    await Page.findByIdAndDelete(req.params.id);
    res.status(200).json({ status: "success", message: "Page deleted successfully" });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// ✅ API to Get Form Submissions with Form Name
app.get("/api/collections", async (req, res) => {
  try {
    // const submissions = await FormData.aggregate([
    //   {
    //     $lookup: {
    //       from: "forms",
    //       localField: "formId",
    //       foreignField: "_id",
    //       as: "formDetails"
    //     }
    //   },
    //   { $unwind: "$formDetails" },
    //   {
    //     $project: {
    //       _id: 1,
    //       "formDetails.name": 1,
    //       submittedData: 1,
    //       createdAt: 1
    //     }
    //   }
    // ]);

    // res.status(200).json({ status: "success", data: submissions });

    // const forms = await Form.find();
    // res.json({ status: "success", data: forms });
    const collections = await Form.find({}, "_id collectionName"); // Fetch only `id` and `name`
    
    res.status(200).json({
      status: "success",
      collections: collections.map((col) => ({
        id: col._id,
        name: col.collectionName,
      })),
    });
  } catch (error) {
    console.error("❌ Error fetching submissions:", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
});

// ✅ **Start Server**
const PORT = 4000;
// app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));

app.listen(PORT, "0.0.0.0", () => console.log(`🚀 Server running on http://localhost:${PORT}`));

