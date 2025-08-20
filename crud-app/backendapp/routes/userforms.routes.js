
const express = require("express");
const { userformsValidator } = require("../validators/userforms.validator");
const validate = require("../middlewares/validate");
const router = express.Router();
const userforms = require("../models/userforms");

/**
 * @swagger
 * tags:
 *   name: userforms
 *   description: CRUD operations for userforms
 */

// CREATE
/**
 * @swagger
 * /api/userforms:
 *   post:
 *     summary: Create a new userforms
 *     tags: [userforms]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/userforms'
 *     responses:
 *       200:
 *         description: The created userforms
 */
router.post("/", userformsValidator, validate, async (req, res) => {
  const item = new userforms(req.body);
  const saved = await item.save();
  res.json(saved);
});

// READ ALL
/**
 * @swagger
 * /api/userforms:
 *   get:
 *     summary: Get all userforms
 *     tags: [userforms]
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
 *         description: List of userforms
 */
// router.get("/", async (req, res) => {
//   const items = await userforms.find();
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
      query["$or"] = ["name","email"].map((field) => ({
        [field]: { $regex: search, $options: "i" }
      }));
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await userforms.countDocuments(query);
    const data = await userforms.find(query).skip(skip).limit(parseInt(limit));

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
 * /api/userforms/{id}:
 *   get:
 *     summary: Get a userforms by ID
 *     tags: [userforms]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The userforms ID
 *     responses:
 *       200:
 *         description: The userforms data
 */
router.get("/:id", async (req, res) => {
  const item = await userforms.findById(req.params.id);
  res.json(item);
});

// UPDATE
/**
 * @swagger
 * /api/userforms/{id}:
 *   put:
 *     summary: Update a userforms by ID
 *     tags: [userforms]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The userforms ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/userforms'
 *     responses:
 *       200:
 *         description: The updated userforms
 */
router.put("/:id", userformsValidator, validate, async (req, res) => {
  const updated = await userforms.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

// DELETE
/**
 * @swagger
 * /api/userforms/{id}:
 *   delete:
 *     summary: Delete a userforms by ID
 *     tags: [userforms]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The userforms ID
 *     responses:
 *       200:
 *         description: userforms deleted
 */
router.delete("/:id", async (req, res) => {
  await userforms.findByIdAndDelete(req.params.id);
  res.json({ message: "userforms deleted" });
});

module.exports = router;
