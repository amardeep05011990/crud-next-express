
const express = require("express");
const router = express.Router();
const comments = require("../models/comments");

// CREATE
router.post("/", async (req, res) => {
  const item = new comments(req.body);
  const saved = await item.save();
  res.json(saved);
});

// READ ALL
router.get("/", async (req, res) => {
  const items = await comments.find();
  res.json(items);
});

// READ ONE
router.get("/:id", async (req, res) => {
  const item = await comments.findById(req.params.id);
  res.json(item);
});

// UPDATE
router.put("/:id", async (req, res) => {
  const updated = await comments.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

// DELETE
router.delete("/:id", async (req, res) => {
  await comments.findByIdAndDelete(req.params.id);
  res.json({ message: "comments deleted" });
});

router.get("/postwithcomments/:id", async (req, res) => {
  const postId = req.params.id;
  console.log("postId", postId);
  // const postWithComments = await comments.find({ postId: postId }).populate("postId");
  const postWithComments = await comments.find({posts: postId}).populate("posts").populate("users");

  res.json(postWithComments);
}
);
router.get("/userwithcomments/:id", async (req, res) => {
  const userId = req.params.id;
  const userWithComments = await comments.find({ userId: userId }).populate("userId");
  res.json(userWithComments);
}
);
router.get("/userwithpostswithcomments/:id", async (req, res) => {
  const userId = req.params.id;
  const userWithPostsWithComments = await comments.find({ userId: userId }).populate("userId").populate("postId");
  res.json(userWithPostsWithComments);
}
);
router.get("/postwithuserwithcomments/:id", async (req, res) => {
  const postId = req.params.id;
  const postWithUserWithComments = await comments.find({ postId: postId }).populate("postId").populate("userId");
  res.json(postWithUserWithComments);
}
);



module.exports = router;
