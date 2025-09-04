// accepts required permissions array or roles
module.exports = function authorize({ roles = [], permissions = [], requireAll = false } = {}) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).end();

    // Admin bypass
    if (req.user.role === 'admin') return next();

    // check org isolation - if route expects orgId param you can enforce here
    // if (req.params.orgId && req.user.orgId && req.user.orgId.toString() !== req.params.orgId) return res.status(403).end();

    // role check
    if (roles.length && roles.includes(req.user.role)) return next();

    // permissions check
    if (permissions.length) {
      const has = permissions.map(p => req.user.permissions.includes(p));
      const allowed = requireAll ? has.every(Boolean) : has.some(Boolean);
      if (allowed) return next();
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    // if none specified, just pass
    if (!roles.length && !permissions.length) return next();

    return res.status(403).json({ message: 'Forbidden' });
  };
};
