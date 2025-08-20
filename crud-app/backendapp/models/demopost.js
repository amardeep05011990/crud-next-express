
const mongoose = require("mongoose");

const demopostSchema = new mongoose.Schema({
    title: { type: String }
  ,
  demouser: { type: mongoose.Schema.Types.ObjectId, ref: "demouser" }
});

module.exports = mongoose.model("demopost", demopostSchema);
