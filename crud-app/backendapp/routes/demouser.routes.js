
const express = require("express");
const { demouserValidator } = require("../validators/demouser.validator");
const validate = require("../middlewares/validate");
const router = express.Router();
const demouser = require("../models/demouser");
const authenticate = require('./../auth/middleware/authenticate')
const authorize = require('./../auth/middleware/authorize')
/**
 * @swagger
 * tags:
 *   name: demouser
 *   description: CRUD operations for demouser
 */

// CREATE
/**
 * @swagger
 * /api/demouser:
 *   post:
 *     summary: Create a new demouser
 *     tags: [demouser]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/demouser'
 *     responses:
 *       200:
 *         description: The created demouser
 */
router.post("/", demouserValidator, validate, async (req, res) => {
  const item = new demouser(req.body);
  const saved = await item.save();
  res.json(saved);
});



// READ ALL
/**
 * @swagger
 * /api/demouser:
 *   get:
 *     summary: Get all demouser
 *     tags: [demouser]
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
 *         description: List of demouser
 */
// router.get("/", async (req, res) => {
//   const items = await demouser.find();
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
  if ([].includes(key)) {
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
    //   query["$or"] = ["name"].map((field) => ({
    //     [field]: { $regex: search, $options: "i" }
    //   }));
    // }
    if (search) {
        query["$or"] = ["name"].map((field) => ({
        [field]: { $regex: search, $options: "i" }
      }));
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await demouser.countDocuments(query);

    // 🔹 Base query
    let mongooseQuery = demouser.find(query).skip(skip).limit(parseInt(limit));

    // 🔹 Auto-populate lookup fields
    

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
 * /api/demouser/{id}:
 *   get:
 *     summary: Get a demouser by ID
 *     tags: [demouser]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The demouser ID
 *     responses:
 *       200:
 *         description: The demouser data
 */
// router.get("/:id", async (req, res) => {
//   const item = await demouser.findById(req.params.id);
//   res.json(item);
// });
router.get("/:id", async (req, res) => {
  try {
    let mongooseQuery = demouser.findById(req.params.id);

    // 🔹 Auto-populate lookup fields (only if any exist in schema.json)
    

    const item = await mongooseQuery;

    if (!item) {
      return res.status(404).json({ message: "demouser not found" });
    }

    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE
/**
 * @swagger
 * /api/demouser/{id}:
 *   put:
 *     summary: Update a demouser by ID
 *     tags: [demouser]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The demouser ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/demouser'
 *     responses:
 *       200:
 *         description: The updated demouser
 */
router.put("/:id", demouserValidator, validate, async (req, res) => {
  const updated = await demouser.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

// DELETE
/**
 * @swagger
 * /api/demouser/{id}:
 *   delete:
 *     summary: Delete a demouser by ID
 *     tags: [demouser]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The demouser ID
 *     responses:
 *       200:
 *         description: demouser deleted
 */
router.delete("/:id", async (req, res) => {
  await demouser.findByIdAndDelete(req.params.id);
  res.json({ message: "demouser deleted" });
});

module.exports = router;
