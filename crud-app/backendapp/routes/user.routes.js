
const express = require("express");
const router = express.Router();
const user = require("../models/user");

// CREATE
router.post("/", async (req, res) => {
  const item = new user(req.body);
  const saved = await item.save();
  res.json(saved);
});

// READ ALL
router.get("/", async (req, res) => {
  const items = await user.find();
  res.json(items);
});

// READ ONE
router.get("/:id", async (req, res) => {
  const item = await user.findById(req.params.id);
  res.json(item);
});

// UPDATE
router.put("/:id", async (req, res) => {
  const updated = await user.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

// DELETE
router.delete("/:id", async (req, res) => {
  await user.findByIdAndDelete(req.params.id);
  res.json({ message: "user deleted" });
});

module.exports = router;
