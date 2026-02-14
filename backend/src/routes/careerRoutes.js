const express = require('express');
const controller = require('../controllers/careerController');
const { requireAuth } = require('../middlewares/authMiddleware');
const { allowRoles } = require('../middlewares/rbacMiddleware');
const { validateRequest } = require('../middlewares/validationMiddleware');

const router = express.Router();

router.get('/career', requireAuth, controller.careerPage);
router.post('/career', requireAuth, allowRoles('admin', 'faculty', 'placement_user'), controller.validators, validateRequest, controller.createResource);

module.exports = router;
