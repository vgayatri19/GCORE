const express = require('express');
const { requireAuth } = require('../middlewares/authMiddleware');
const { allowRoles } = require('../middlewares/rbacMiddleware');
const { validateRequest } = require('../middlewares/validationMiddleware');
const controller = require('../controllers/announcementController');

const router = express.Router();

router.get('/announcements', requireAuth, controller.listAnnouncements);
router.post('/announcements', requireAuth, allowRoles('admin', 'faculty', 'club_coordinator', 'placement_user'), controller.validators, validateRequest, controller.createAnnouncement);
router.post('/announcements/:id/delete', requireAuth, allowRoles('admin', 'faculty'), controller.deleteAnnouncement);

module.exports = router;
