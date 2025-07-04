
const express = require("express");
const { demopostValidator } = require("../validators/demopost.validator");
const validate = require("../middlewares/validate");
const router = express.Router();
const demopost = require("../models/demopost");

/**
 * @swagger
 * tags:
 *   name: demopost
 *   description: CRUD operations for demopost
 */

// CREATE
/**
 * @swagger
 * /api/demopost:
 *   post:
 *     summary: Create a new demopost
 *     tags: [demopost]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/demopost'
 *     responses:
 *       200:
 *         description: The created demopost
 */
router.post("/", demopostValidator, validate, async (req, res) => {
  const item = new demopost(req.body);
  const saved = await item.save();
  res.json(saved);
});

// READ ALL
/**
 * @swagger
 * /api/demopost:
 *   get:
 *     summary: Get all demopost
 *     tags: [demopost]
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
 *         description: List of demopost
 */
// router.get("/", async (req, res) => {
//   const items = await demopost.find();
//   res.json(items);
// });

// READ ALL with search, filter, and pagination
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 10, search, ...filters } = req.query;
    const query = {};

    // Add filters
    Object.keys(filters).forEach((key) => {
      query[key] = filters[key];
    });

    // Add search on all string fields
    if (search) {
      query["$or"] = ["title"].map((field) => ({
        [field]: { $regex: search, $options: "i" }
      }));
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await demopost.countDocuments(query);
    const data = await demopost.find(query).skip(skip).limit(parseInt(limit));

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
 * /api/demopost/{id}:
 *   get:
 *     summary: Get a demopost by ID
 *     tags: [demopost]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The demopost ID
 *     responses:
 *       200:
 *         description: The demopost data
 */
router.get("/:id", async (req, res) => {
  const item = await demopost.findById(req.params.id);
  res.json(item);
});

// UPDATE
/**
 * @swagger
 * /api/demopost/{id}:
 *   put:
 *     summary: Update a demopost by ID
 *     tags: [demopost]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The demopost ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/demopost'
 *     responses:
 *       200:
 *         description: The updated demopost
 */
router.put("/:id", demopostValidator, validate, async (req, res) => {
  const updated = await demopost.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

// DELETE
/**
 * @swagger
 * /api/demopost/{id}:
 *   delete:
 *     summary: Delete a demopost by ID
 *     tags: [demopost]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The demopost ID
 *     responses:
 *       200:
 *         description: demopost deleted
 */
router.delete("/:id", async (req, res) => {
  await demopost.findByIdAndDelete(req.params.id);
  res.json({ message: "demopost deleted" });
});

module.exports = router;
