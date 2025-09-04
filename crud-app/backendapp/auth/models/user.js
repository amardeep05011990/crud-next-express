const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  passwordHash: { type: String, required: true },
  role: { type: String, default: 'user' },
  permissions: { type: [String], default: [] }, // explicit permissions
  orgId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: false },
  refreshTokenId: { type: String } // optional for refresh token revocation
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
