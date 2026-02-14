const { validationResult } = require('express-validator');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render('error', {
      title: 'Validation Error',
      error: errors.array().map((e) => e.msg).join(', ')
    });
  }
  next();
};

module.exports = { validateRequest };
