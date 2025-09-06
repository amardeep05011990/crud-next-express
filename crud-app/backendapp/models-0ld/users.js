
const mongoose = require("mongoose");

const usersSchema = new mongoose.Schema({
    name: { type: String },
  email: { type: String },
  gage: { type: Number }
  ,
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "posts" }]
});

module.exports = mongoose.models.users || mongoose.model("users", usersSchema);
