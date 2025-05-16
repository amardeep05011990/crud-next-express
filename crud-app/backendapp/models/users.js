
const mongoose = require("mongoose");

const usersSchema = new mongoose.Schema({
    name: { type: String },
  age: { type: String },
  email: { type: String }
  ,
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "posts" }],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "comments" }]
});

module.exports = mongoose.model("users", usersSchema);
