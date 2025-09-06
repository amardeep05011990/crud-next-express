
const express = require("express");
const { assignmentsValidator } = require("../validators/assignments.validator");
const validate = require("../middlewares/validate");
const router = express.Router();
const assignments = require("../models/assignments");
const authenticate = require('./../auth/middleware/authenticate')
const authorize = require('./../auth/middleware/authorize')
/**
 * @swagger
 * tags:
 *   name: assignments
 *   description: CRUD operations for assignments
 */

// CREATE
/**
 * @swagger
 * /api/assignments:
 *   post:
 *     summary: Create a new assignments
 *     tags: [assignments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/assignments'
 *     responses:
 *       200:
 *         description: The created assignments
 */
router.post("/", assignmentsValidator, validate, async (req, res) => {
  const item = new assignments(req.body);
  const saved = await item.save();
  res.json(saved);
});

// READ ALL
/**
 * @swagger
 * /api/assignments:
 *   get:
 *     summary: Get all assignments
 *     tags: [assignments]
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
 *         description: List of assignments
 */
// router.get("/", async (req, res) => {
//   const items = await assignments.find();
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
    const total = await assignments.countDocuments(query);
    const data = await assignments.find(query).skip(skip).limit(parseInt(limit));

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
 * /api/assignments/{id}:
 *   get:
 *     summary: Get a assignments by ID
 *     tags: [assignments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The assignments ID
 *     responses:
 *       200:
 *         description: The assignments data
 */
router.get("/:id", async (req, res) => {
  const item = await assignments.findById(req.params.id);
  res.json(item);
});

// UPDATE
/**
 * @swagger
 * /api/assignments/{id}:
 *   put:
 *     summary: Update a assignments by ID
 *     tags: [assignments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The assignments ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/assignments'
 *     responses:
 *       200:
 *         description: The updated assignments
 */
router.put("/:id", assignmentsValidator, validate, async (req, res) => {
  const updated = await assignments.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

// DELETE
/**
 * @swagger
 * /api/assignments/{id}:
 *   delete:
 *     summary: Delete a assignments by ID
 *     tags: [assignments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The assignments ID
 *     responses:
 *       200:
 *         description: assignments deleted
 */
router.delete("/:id", async (req, res) => {
  await assignments.findByIdAndDelete(req.params.id);
  res.json({ message: "assignments deleted" });
});

module.exports = router;
