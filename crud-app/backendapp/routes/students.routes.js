
const express = require("express");
const { studentsValidator } = require("../validators/students.validator");
const validate = require("../middlewares/validate");
const router = express.Router();
const students = require("../models/students");
const authenticate = require('./../auth/middleware/authenticate')
const authorize = require('./../auth/middleware/authorize')
/**
 * @swagger
 * tags:
 *   name: students
 *   description: CRUD operations for students
 */

// CREATE
/**
 * @swagger
 * /api/students:
 *   post:
 *     summary: Create a new students
 *     tags: [students]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/students'
 *     responses:
 *       200:
 *         description: The created students
 */
router.post("/", studentsValidator, validate, async (req, res) => {
  const item = new students(req.body);
  const saved = await item.save();
  res.json(saved);
});

// READ ALL
/**
 * @swagger
 * /api/students:
 *   get:
 *     summary: Get all students
 *     tags: [students]
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
 *         description: List of students
 */
// router.get("/", async (req, res) => {
//   const items = await students.find();
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
      query["$or"] = ["city","gender","title","asdf123333"].map((field) => ({
        [field]: { $regex: search, $options: "i" }
      }));
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await students.countDocuments(query);
    const data = await students.find(query).skip(skip).limit(parseInt(limit));

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
 * /api/students/{id}:
 *   get:
 *     summary: Get a students by ID
 *     tags: [students]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The students ID
 *     responses:
 *       200:
 *         description: The students data
 */
router.get("/:id", async (req, res) => {
  const item = await students.findById(req.params.id);
  res.json(item);
});

// UPDATE
/**
 * @swagger
 * /api/students/{id}:
 *   put:
 *     summary: Update a students by ID
 *     tags: [students]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The students ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/students'
 *     responses:
 *       200:
 *         description: The updated students
 */
router.put("/:id", studentsValidator, validate, async (req, res) => {
  const updated = await students.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

// DELETE
/**
 * @swagger
 * /api/students/{id}:
 *   delete:
 *     summary: Delete a students by ID
 *     tags: [students]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The students ID
 *     responses:
 *       200:
 *         description: students deleted
 */
router.delete("/:id", async (req, res) => {
  await students.findByIdAndDelete(req.params.id);
  res.json({ message: "students deleted" });
});

module.exports = router;
