
const mongoose = require("mongoose");

const demouserSchema = new mongoose.Schema({
    name: { type: String }
  ,
  demopost: [{ type: mongoose.Schema.Types.ObjectId, ref: "demopost" }]
});

module.exports = mongoose.model("demouser", demouserSchema);
