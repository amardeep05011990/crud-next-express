
const mongoose = require("mongoose");

const userformsSchema = new mongoose.Schema({
    name: { type: String },
  email: { type: String }
  ,
  userposts: [{ type: mongoose.Schema.Types.ObjectId, ref: "userposts" }]
});

module.exports = mongoose.model("userforms", userformsSchema);
