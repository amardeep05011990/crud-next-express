
const express = require("express");
const { usersValidator } = require("../validators/users.validator");
const validate = require("../middlewares/validate");
const router = express.Router();
const users = require("../models/users");

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
 *     responses:
 *       200:
 *         description: List of users
 */
router.get("/", async (req, res) => {
  const items = await users.find();
  res.json(items);
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
