
const express = require("express");
const { userpostsValidator } = require("../validators/userposts.validator");
const validate = require("../middlewares/validate");
const router = express.Router();
const userposts = require("../models/userposts");

/**
 * @swagger
 * tags:
 *   name: userposts
 *   description: CRUD operations for userposts
 */

// CREATE
/**
 * @swagger
 * /api/userposts:
 *   post:
 *     summary: Create a new userposts
 *     tags: [userposts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/userposts'
 *     responses:
 *       200:
 *         description: The created userposts
 */
router.post("/", userpostsValidator, validate, async (req, res) => {
  const item = new userposts(req.body);
  const saved = await item.save();
  res.json(saved);
});

// READ ALL
/**
 * @swagger
 * /api/userposts:
 *   get:
 *     summary: Get all userposts
 *     tags: [userposts]
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
 *         description: List of userposts
 */
// router.get("/", async (req, res) => {
//   const items = await userposts.find();
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
      query["$or"] = ["tite","description"].map((field) => ({
        [field]: { $regex: search, $options: "i" }
      }));
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await userposts.countDocuments(query);
    const data = await userposts.find(query).skip(skip).limit(parseInt(limit));

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
 * /api/userposts/{id}:
 *   get:
 *     summary: Get a userposts by ID
 *     tags: [userposts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The userposts ID
 *     responses:
 *       200:
 *         description: The userposts data
 */
router.get("/:id", async (req, res) => {
  const item = await userposts.findById(req.params.id);
  res.json(item);
});

// UPDATE
/**
 * @swagger
 * /api/userposts/{id}:
 *   put:
 *     summary: Update a userposts by ID
 *     tags: [userposts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The userposts ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/userposts'
 *     responses:
 *       200:
 *         description: The updated userposts
 */
router.put("/:id", userpostsValidator, validate, async (req, res) => {
  const updated = await userposts.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

// DELETE
/**
 * @swagger
 * /api/userposts/{id}:
 *   delete:
 *     summary: Delete a userposts by ID
 *     tags: [userposts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The userposts ID
 *     responses:
 *       200:
 *         description: userposts deleted
 */
router.delete("/:id", async (req, res) => {
  await userposts.findByIdAndDelete(req.params.id);
  res.json({ message: "userposts deleted" });
});

module.exports = router;
