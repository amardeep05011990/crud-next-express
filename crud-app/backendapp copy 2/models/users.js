
const mongoose = require("mongoose");

const usersSchema = new mongoose.Schema({
    name: { type: String },
  age: { type: String }
  ,
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "posts" }],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "comments" }]
});

// In users model
usersSchema.virtual("myPosts", {
  ref: "posts",
  localField: "_id",
  foreignField: "users"
});

usersSchema.set("toObject", { virtuals: true });
usersSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("users", usersSchema);
