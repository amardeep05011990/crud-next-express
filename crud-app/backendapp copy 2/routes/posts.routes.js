
const express = require("express");
const router = express.Router();
const posts = require("../models/posts");

// CREATE
router.post("/", async (req, res) => {
  const item = new posts(req.body);
  const saved = await item.save();
  res.json(saved);
});

// READ ALL
router.get("/", async (req, res) => {
  const items = await posts.find();
  res.json(items);
});

// READ ONE
router.get("/:id", async (req, res) => {
  const item = await posts.findById(req.params.id);
  res.json(item);
});

// UPDATE
router.put("/:id", async (req, res) => {
  const updated = await posts.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

// DELETE
router.delete("/:id", async (req, res) => {
  await posts.findByIdAndDelete(req.params.id);
  res.json({ message: "posts deleted" });
});

module.exports = router;
