const express = require('express');
const controller = require('../controllers/authController');
const { validateRequest } = require('../middlewares/validationMiddleware');

const router = express.Router();

router.get('/login', controller.renderLogin);
router.get('/register', controller.renderRegister);
router.post('/register', controller.registerValidators, validateRequest, controller.register);
router.post('/login', controller.loginValidators, validateRequest, controller.login);
router.post('/logout', controller.logout);

module.exports = router;
