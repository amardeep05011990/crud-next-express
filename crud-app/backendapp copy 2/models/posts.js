
const mongoose = require("mongoose");

const postsSchema = new mongoose.Schema({
    title: { type: String },
  description: { type: String }
  ,
  users: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "comments" }]
});

module.exports = mongoose.model("posts", postsSchema);
