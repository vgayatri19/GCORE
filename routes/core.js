const express = require('express');
const { index, about, contact, clubs, clubDetails } = require('../controllers/core');

const router = express.Router();

router.get('/', index);
router.get('/about', about);
router.get('/contact', contact);
router.get('/clubs', clubs);
router.get('/clubs/:slug', clubDetails);

// Guidance Routes
const { atsChecker, checkATS, interviewPrep, skillDev, higherStudies, uploadPastEvent } = require('../controllers/core');
const multer = require('multer');
const upload = multer(); // Memory storage for parsing files without saving

router.get('/guidance/ats-checker', atsChecker);
router.post('/guidance/ats-checker', upload.single('resumeFile'), checkATS);

// Club Features
const diskUpload = multer({ dest: 'uploads/' });
router.post('/clubs/:slug/past-events', diskUpload.single('reportFile'), uploadPastEvent);
router.get('/guidance/interview-prep', interviewPrep);
router.get('/guidance/skill-dev', skillDev);
router.get('/guidance/higher-studies', higherStudies);

module.exports = router;
