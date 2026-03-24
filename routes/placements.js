const express = require('express');
const {
    getPlacements,
    createDrive,
    applyToDrive,
    getDrive,
    getManagePlacements,
    addPlacementRecord
} = require('../controllers/placements');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// Basic dashboard
router.get('/', getPlacements);

// Management (Admin/PO)
router.get('/manage', protect, authorize('Admin', 'Placement Officer'), getManagePlacements);
router.post('/records', protect, authorize('Admin', 'Placement Officer'), addPlacementRecord);

// Drive management
router.post('/', protect, authorize('Admin', 'Placement Officer'), createDrive);
router.get('/:id', protect, authorize('Admin', 'Placement Officer', 'HOD'), getDrive);
router.post('/:id/apply', protect, authorize('Student'), applyToDrive);

module.exports = router;
