const express = require('express');
const { requireAuth } = require('../middlewares/authMiddleware');
const { studentDashboard } = require('../controllers/dashboardController');

const router = express.Router();
router.get('/dashboard', requireAuth, studentDashboard);

module.exports = router;
