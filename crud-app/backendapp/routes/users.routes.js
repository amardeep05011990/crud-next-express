
const express = require("express");
const { usersValidator } = require("../validators/users.validator");
const validate = require("../middlewares/validate");
const router = express.Router();
const users = require("../models/users");
const authenticate = require('./../auth/middleware/authenticate')
const authorize = require('./../auth/middleware/authorize')
/**
 * @swagger
 * tags:
 *   name: users
 *   description: CRUD operations for users
 */

// CREATE
/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new users
 *     tags: [users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/users'
 *     responses:
 *       200:
 *         description: The created users
 */
router.post("/", usersValidator, validate, async (req, res) => {
  const item = new users(req.body);
  const saved = await item.save();
  res.json(saved);
});

// READ ALL
/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [users]
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
 *         description: List of users
 */
// router.get("/", async (req, res) => {
//   const items = await users.find();
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
      query["$or"] = ["name","email","gage"].map((field) => ({
        [field]: { $regex: search, $options: "i" }
      }));
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await users.countDocuments(query);
    const data = await users.find(query).skip(skip).limit(parseInt(limit));

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
 * /api/users/{id}:
 *   get:
 *     summary: Get a users by ID
 *     tags: [users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The users ID
 *     responses:
 *       200:
 *         description: The users data
 */
router.get("/:id", async (req, res) => {
  const item = await users.findById(req.params.id);
  res.json(item);
});

// UPDATE
/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update a users by ID
 *     tags: [users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The users ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/users'
 *     responses:
 *       200:
 *         description: The updated users
 */
router.put("/:id", usersValidator, validate, async (req, res) => {
  const updated = await users.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

// DELETE
/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete a users by ID
 *     tags: [users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The users ID
 *     responses:
 *       200:
 *         description: users deleted
 */
router.delete("/:id", async (req, res) => {
  await users.findByIdAndDelete(req.params.id);
  res.json({ message: "users deleted" });
});

module.exports = router;
