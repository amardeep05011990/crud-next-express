
const mongoose = require("mongoose");

const commentsSchema = new mongoose.Schema({
    commentDescription: { type: String }
  ,
  posts: { type: mongoose.Schema.Types.ObjectId, ref: "posts" },
  users: { type: mongoose.Schema.Types.ObjectId, ref: "users" }
});

module.exports = mongoose.model("comments", commentsSchema);
