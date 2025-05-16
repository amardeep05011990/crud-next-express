
const express = require("express");
const { postsValidator } = require("../validators/posts.validator");
const validate = require("../middlewares/validate");
const router = express.Router();
const posts = require("../models/posts");

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
 *     responses:
 *       200:
 *         description: List of posts
 */
router.get("/", async (req, res) => {
  const items = await posts.find();
  res.json(items);
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
router.get("/:id", async (req, res) => {
  const item = await posts.findById(req.params.id);
  res.json(item);
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
