
const mongoose = require("mongoose");

const assignmentsSchema = new mongoose.Schema({
    title: { type: String }
  ,
  students: { type: mongoose.Schema.Types.ObjectId, ref: "students" }
});

module.exports = mongoose.models.assignments || mongoose.model("assignments", assignmentsSchema);
