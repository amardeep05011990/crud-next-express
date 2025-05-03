
const express = require("express");
const router = express.Router();
const post = require("../models/post");

// CREATE
router.post("/", async (req, res) => {
  const item = new post(req.body);
  const saved = await item.save();
  res.json(saved);
});

// READ ALL
router.get("/", async (req, res) => {
  const items = await post.find();
  res.json(items);
});

// READ ONE
router.get("/:id", async (req, res) => {
  const item = await post.findById(req.params.id);
  res.json(item);
});

// UPDATE
router.put("/:id", async (req, res) => {
  const updated = await post.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

// DELETE
router.delete("/:id", async (req, res) => {
  await post.findByIdAndDelete(req.params.id);
  res.json({ message: "post deleted" });
});

module.exports = router;
