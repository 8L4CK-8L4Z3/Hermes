export const authorizeAdmin = (req, res, next) => {
  if (!req.user || !req.user.roles.includes('admin')) {
    return res.status(403).json({ message: 'Unauthorized: Admin access required' });
  }
  next();
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.roles.some(role => roles.includes(role))) {
      return res.status(403).json({ message: 'Unauthorized: Insufficient permissions' });
    }
    next();
  };
}; 