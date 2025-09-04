const mongoose = require('mongoose');
const RoleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  permissions: { type: [String], default: [] },
  orgId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: false }
});
module.exports = mongoose.model('Role', RoleSchema);
