
const mongoose = require("mongoose");

const userpostsSchema = new mongoose.Schema({
    tite: { type: String },
  description: { type: String }
  ,
  userforms: { type: mongoose.Schema.Types.ObjectId, ref: "userforms" }
});

module.exports = mongoose.model("userposts", userpostsSchema);
