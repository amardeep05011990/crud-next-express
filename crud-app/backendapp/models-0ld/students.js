
const mongoose = require("mongoose");

const studentsSchema = new mongoose.Schema({
    city: { type: String },
  gender: { type: String },
  title: { type: String },
  asdf123333: { type: String }
  ,
  assignments: [{ type: mongoose.Schema.Types.ObjectId, ref: "assignments" }]
});

module.exports = mongoose.models.students || mongoose.model("students", studentsSchema);
