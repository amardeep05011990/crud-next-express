
const mongoose = require("mongoose");

const postsSchema = new mongoose.Schema({
    title: { type: String },
  descriptions: { type: String },
  category: { type: String },
  tags: { type: Array },
  status: { type: String },
  isFeatured: { type: Boolean },
  coverImage: { type: String },
  views: { type: Number },
  publishedDate: { type: Date }
  ,
  users: { type: mongoose.Schema.Types.ObjectId, ref: "users" }
});

module.exports = mongoose.models.posts || mongoose.model("posts", postsSchema);
