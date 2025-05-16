
const express = require("express");
const router = express.Router();
const users = require("../models/users");
const posts = require("../models/posts");
const comments = require("../models/comments");

// CREATE
router.post("/", async (req, res) => {
  const item = new users(req.body);
  const saved = await item.save();
  res.json(saved);
});

// READ ALL
router.get("/", async (req, res) => {
  const items = await users.find();
  res.json(items);
});

// READ ONE
router.get("/:id", async (req, res) => {
  const item = await users.findById(req.params.id);
  res.json(item);
});

// UPDATE
router.put("/:id", async (req, res) => {
  const updated = await users.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

// DELETE
router.delete("/:id", async (req, res) => {
  await users.findByIdAndDelete(req.params.id);
  res.json({ message: "users deleted" });
});

// router.get("/userwithposts/:id", async (req, res) => {
//   const userId = req.params.id;
//   const userWithPosts = await user.find({ _id: userId }).populate("posts");
//   res.json(userWithPosts);
// }
// );

router.get("/getusers/withposts/:id", async (req, res) => {
  const userId = req.params.id;
  console.log("getuserswithposts");
  // const userWithPosts = await users.find({_id: userId}).populate("posts");
  const userWithPosts = await users.find({}).populate("myPosts");
  // const userWithPosts = await comments.find().populate("posts").populate("users");
  res.json(userWithPosts);
}
);

module.exports = router;
