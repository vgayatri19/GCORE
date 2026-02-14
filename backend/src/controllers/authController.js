const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const User = require('../models/User');

const registerValidators = [
  body('name').trim().notEmpty().withMessage('Name required'),
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 chars'),
  body('role').optional().isIn(['admin', 'student', 'club_coordinator', 'placement_user', 'faculty'])
];

const loginValidators = [
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password required')
];

const renderLogin = (req, res) => res.render('login', { title: 'Login' });
const renderRegister = (req, res) => res.render('register', { title: 'Register' });

const register = async (req, res) => {
  const existing = await User.findOne({ email: req.body.email });
  if (existing) return res.status(409).render('error', { title: 'Error', error: 'Email already in use' });
  await User.create(req.body);
  res.redirect('/login');
};

const login = async (req, res) => {
  const user = await User.findOne({ email: req.body.email }).select('+password');
  if (!user || !(await user.comparePassword(req.body.password))) {
    return res.status(401).render('error', { title: 'Unauthorized', error: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '8h' });
  req.session.token = token;
  res.cookie('token', token, { httpOnly: true, sameSite: 'strict', secure: false, maxAge: 8 * 60 * 60 * 1000 });
  return res.redirect('/dashboard');
};

const logout = (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('token');
    res.redirect('/login');
  });
};

module.exports = {
  registerValidators,
  loginValidators,
  renderLogin,
  renderRegister,
  register,
  login,
  logout
};
