
const mongoose = require("mongoose");

const postsSchema = new mongoose.Schema({
    title: { type: String },
  descriptions: { type: String }
  ,
  users: { type: mongoose.Schema.Types.ObjectId, ref: "users" }
});

module.exports = mongoose.model("posts", postsSchema);
