const express = require('express');
const {
    getDepartments,
    getDepartment,
    createDepartment,
    addFaculty,
    addEvent,
    getAchievementAnalysis,
    getAddAchievement,
    createAchievement,
    uploadData,
    uploadAcademicData
} = require('../controllers/departments');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const upload = require('../utils/upload');

router.route('/')
    .get(getDepartments)
    .post(protect, authorize('Admin'), createDepartment);

router.route('/:id/analysis')
    .get(getAchievementAnalysis);

router.route('/:id/achievements')
    .get(protect, authorize('Admin', 'HOD'), getAddAchievement)
    .post(protect, authorize('Admin', 'HOD'), createAchievement);

router.post('/:id/upload', protect, authorize('Admin', 'HOD'), upload.single('file'), uploadData);
router.post('/:id/upload-academics', protect, authorize('Admin', 'HOD'), upload.single('file'), uploadAcademicData);

router.route('/:id')
    .get(getDepartment);

router.route('/:id/faculty')
    .post(protect, authorize('Admin', 'HOD'), addFaculty);

router.route('/:id/events')
    .post(protect, authorize('Admin', 'HOD'), addEvent);

module.exports = router;
