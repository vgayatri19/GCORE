const express = require('express');
const { register, login, logout, getMe, forgotPasswordForm, forgotPassword, verifyResetCode, resetPassword, changePassword } = require('../controllers/auth');

const router = express.Router();

const { protect } = require('../middleware/auth');

// Render views
router.get('/register', (req, res) => res.render('register'));
router.get('/login', (req, res) => res.render('login'));
router.get('/forgot-password', forgotPasswordForm);

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-code', verifyResetCode);
router.post('/reset-password', resetPassword);
router.post('/change-password', protect, changePassword);
router.get('/me', protect, getMe);

module.exports = router;
