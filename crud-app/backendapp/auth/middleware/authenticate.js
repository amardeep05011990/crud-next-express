const { verifyAccess } = require('../lib/auth');
const User = require('../models/user');

async function authenticate(req, res, next) {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ message: 'Missing token' });
    const token = auth.split(' ')[1];
    const payload = verifyAccess(token);
    const user = await User.findById(payload.sub).lean();
    if (!user) return res.status(401).json({ message: 'Invalid token (user not found)' });
    req.user = user; // attach user object for downstream
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

module.exports = authenticate;
