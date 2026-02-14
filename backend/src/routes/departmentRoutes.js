const express = require('express');
const controller = require('../controllers/departmentController');
const { requireAuth } = require('../middlewares/authMiddleware');
const { allowRoles } = require('../middlewares/rbacMiddleware');
const { validateRequest } = require('../middlewares/validationMiddleware');

const router = express.Router();

router.get('/departments', requireAuth, controller.departmentPage);
router.post('/departments', requireAuth, allowRoles('admin', 'faculty'), controller.validators, validateRequest, controller.createResource);

module.exports = router;
