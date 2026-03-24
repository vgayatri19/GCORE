const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    getDashboard,
    getUsers,
    approveUser,
    rejectUser,
    createDepartment,
    createClub,
    createEvent
} = require('../controllers/admin');

// Admin only area
router.use(protect);
router.use(authorize('Admin'));

router.get('/dashboard', getDashboard);
router.get('/users', getUsers);
router.post('/users/:id/approve', approveUser);
router.post('/users/:id/reject', rejectUser);
router.post('/departments', createDepartment);
router.post('/clubs', createClub);
router.post('/events', createEvent);

module.exports = router;
