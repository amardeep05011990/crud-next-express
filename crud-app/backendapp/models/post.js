
const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
    title: { type: String },
  userid: { type: String }
  ,
  _id: { type: mongoose.Schema.Types.ObjectId, ref: "user" }
});

module.exports = mongoose.model("post", postSchema);
