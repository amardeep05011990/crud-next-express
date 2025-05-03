
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { type: String },
  emai: { type: String },
  // _id: { type: Object }
  // ,
  userid: { type: mongoose.Schema.Types.ObjectId, ref: "post" }
});

module.exports = mongoose.model("user", userSchema);
