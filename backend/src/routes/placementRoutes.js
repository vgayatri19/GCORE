const express = require('express');
const controller = require('../controllers/placementController');
const { requireAuth } = require('../middlewares/authMiddleware');
const { allowRoles } = require('../middlewares/rbacMiddleware');
const { validateRequest } = require('../middlewares/validationMiddleware');

const router = express.Router();

router.get('/placement', requireAuth, controller.placementPage);
router.post('/placement/jobs', requireAuth, allowRoles('admin', 'placement_user'), controller.jobValidators, validateRequest, controller.createJob);
router.post('/placement/jobs/:jobId/apply', requireAuth, allowRoles('student'), controller.applyJob);
router.post('/placement/drives', requireAuth, allowRoles('admin', 'placement_user'), controller.driveValidators, validateRequest, controller.createDrive);

module.exports = router;
