const express = require('express');
const { body } = require('express-validator');
const controller = require('../controllers/adminController');
const { requireAuth } = require('../middlewares/authMiddleware');
const { allowRoles } = require('../middlewares/rbacMiddleware');
const { validateRequest } = require('../middlewares/validationMiddleware');

const router = express.Router();

router.get('/admin', requireAuth, allowRoles('admin'), controller.adminPage);
router.post('/admin/users/:userId/role', requireAuth, allowRoles('admin'), body('role').isIn(['admin', 'student', 'club_coordinator', 'placement_user', 'faculty']), validateRequest, controller.assignRole);
router.post('/admin/events/:eventId/approve', requireAuth, allowRoles('admin'), body('status').isIn(['approved', 'rejected']), validateRequest, controller.approveEvent);

module.exports = router;
