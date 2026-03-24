const express = require('express');
const {
    getCreateEvent,
    createEvent,
    getApprovals,
    approveEvent,
    rejectEvent,
    togglePublic
} = require('../controllers/events');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

// Club Leader Routes
router.get('/create', authorize('Student', 'Faculty', 'Admin'), getCreateEvent);
router.post('/', authorize('Student', 'Faculty', 'Admin'), createEvent);

// Approval Routes
router.get('/approvals', authorize('Faculty', 'HOD', 'Dean', 'Director', 'Admin'), getApprovals);
router.post('/:id/approve', authorize('Faculty', 'HOD', 'Dean', 'Director', 'Admin'), approveEvent);
router.post('/:id/reject', authorize('Faculty', 'HOD', 'Dean', 'Director', 'Admin'), rejectEvent);

// Visibility Toggle (Faculty Coordinator)
router.post('/:id/toggle-public', authorize('Faculty', 'Admin'), togglePublic);

module.exports = router;
