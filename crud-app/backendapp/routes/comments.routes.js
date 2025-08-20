
const express = require("express");
const { commentsValidator } = require("../validators/comments.validator");
const validate = require("../middlewares/validate");
const router = express.Router();
const comments = require("../models/comments");

/**
 * @swagger
 * tags:
 *   name: comments
 *   description: CRUD operations for comments
 */

// CREATE
/**
 * @swagger
 * /api/comments:
 *   post:
 *     summary: Create a new comments
 *     tags: [comments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/comments'
 *     responses:
 *       200:
 *         description: The created comments
 */
router.post("/", commentsValidator, validate, async (req, res) => {
  const item = new comments(req.body);
  const saved = await item.save();
  res.json(saved);
});

// READ ALL
/**
 * @swagger
 * /api/comments:
 *   get:
 *     summary: Get all comments
 *     tags: [comments]
 *     responses:
 *       200:
 *         description: List of comments
 */
router.get("/", async (req, res) => {
  const items = await comments.find();
  res.json(items);
});

// READ ONE
/**
 * @swagger
 * /api/comments/{id}:
 *   get:
 *     summary: Get a comments by ID
 *     tags: [comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The comments ID
 *     responses:
 *       200:
 *         description: The comments data
 */
router.get("/:id", async (req, res) => {
  const item = await comments.findById(req.params.id);
  res.json(item);
});

// UPDATE
/**
 * @swagger
 * /api/comments/{id}:
 *   put:
 *     summary: Update a comments by ID
 *     tags: [comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The comments ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/comments'
 *     responses:
 *       200:
 *         description: The updated comments
 */
router.put("/:id", commentsValidator, validate, async (req, res) => {
  const updated = await comments.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

// DELETE
/**
 * @swagger
 * /api/comments/{id}:
 *   delete:
 *     summary: Delete a comments by ID
 *     tags: [comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The comments ID
 *     responses:
 *       200:
 *         description: comments deleted
 */
router.delete("/:id", async (req, res) => {
  await comments.findByIdAndDelete(req.params.id);
  res.json({ message: "comments deleted" });
});

module.exports = router;
