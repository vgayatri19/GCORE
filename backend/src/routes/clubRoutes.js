const express = require('express');
const controller = require('../controllers/clubController');
const { requireAuth } = require('../middlewares/authMiddleware');
const { allowRoles } = require('../middlewares/rbacMiddleware');
const { validateRequest } = require('../middlewares/validationMiddleware');

const router = express.Router();

router.get('/clubs', requireAuth, controller.clubPage);
router.post('/clubs', requireAuth, allowRoles('admin', 'club_coordinator'), controller.clubValidators, validateRequest, controller.createClub);
router.post('/clubs/events', requireAuth, allowRoles('admin', 'club_coordinator'), controller.eventValidators, validateRequest, controller.createEvent);
router.post('/clubs/events/:eventId/participate', requireAuth, allowRoles('student'), controller.participate);

module.exports = router;
