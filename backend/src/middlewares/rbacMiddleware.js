const allowRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).render('403', { title: 'Forbidden' });
  }
  next();
};

module.exports = { allowRoles };
