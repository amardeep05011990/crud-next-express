
const express = require("express");
const { postsValidator } = require("../validators/posts.validator");
const validate = require("../middlewares/validate");
const router = express.Router();
const posts = require("../models/posts");
const authenticate = require('./../auth/middleware/authenticate')
const authorize = require('./../auth/middleware/authorize')
/**
 * @swagger
 * tags:
 *   name: posts
 *   description: CRUD operations for posts
 */

// CREATE
/**
 * @swagger
 * /api/posts:
 *   post:
 *     summary: Create a new posts
 *     tags: [posts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/posts'
 *     responses:
 *       200:
 *         description: The created posts
 */
router.post("/", postsValidator, validate, async (req, res) => {
  const item = new posts(req.body);
  const saved = await item.save();
  res.json(saved);
});



// READ ALL
/**
 * @swagger
 * /api/posts:
 *   get:
 *     summary: Get all posts
 *     tags: [posts]
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
 *         description: List of posts
 */
// router.get("/", async (req, res) => {
//   const items = await posts.find();
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
  if (["author", "assignment"].includes(key)) {
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
    //   query["$or"] = ["title","descriptions","category","tags","hobbies","author","assignment","status","isFeatured","coverImage","views","publishedDate"].map((field) => ({
    //     [field]: { $regex: search, $options: "i" }
    //   }));
    // }
    if (search) {
        query["$or"] = ["title","descriptions","category","tags","hobbies","status","isFeatured","coverImage","views"].map((field) => ({
        [field]: { $regex: search, $options: "i" }
      }));
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await posts.countDocuments(query);

    // 🔹 Base query
    let mongooseQuery = posts.find(query).skip(skip).limit(parseInt(limit));

    // 🔹 Auto-populate lookup fields
    mongooseQuery = mongooseQuery.populate("author", "name");
    mongooseQuery = mongooseQuery.populate("assignment", "title");

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
 * /api/posts/{id}:
 *   get:
 *     summary: Get a posts by ID
 *     tags: [posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The posts ID
 *     responses:
 *       200:
 *         description: The posts data
 */
// router.get("/:id", async (req, res) => {
//   const item = await posts.findById(req.params.id);
//   res.json(item);
// });
router.get("/:id", async (req, res) => {
  try {
    let mongooseQuery = posts.findById(req.params.id);

    // 🔹 Auto-populate lookup fields (only if any exist in schema.json)
    mongooseQuery = mongooseQuery.populate("author", "name");
    mongooseQuery = mongooseQuery.populate("assignment", "title");

    const item = await mongooseQuery;

    if (!item) {
      return res.status(404).json({ message: "posts not found" });
    }

    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE
/**
 * @swagger
 * /api/posts/{id}:
 *   put:
 *     summary: Update a posts by ID
 *     tags: [posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The posts ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/posts'
 *     responses:
 *       200:
 *         description: The updated posts
 */
router.put("/:id", postsValidator, validate, async (req, res) => {
  const updated = await posts.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

// DELETE
/**
 * @swagger
 * /api/posts/{id}:
 *   delete:
 *     summary: Delete a posts by ID
 *     tags: [posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The posts ID
 *     responses:
 *       200:
 *         description: posts deleted
 */
router.delete("/:id", async (req, res) => {
  await posts.findByIdAndDelete(req.params.id);
  res.json({ message: "posts deleted" });
});

module.exports = router;
