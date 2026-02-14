const { body } = require('express-validator');
const JobListing = require('../models/JobListing');
const JobApplication = require('../models/JobApplication');
const PlacementDrive = require('../models/PlacementDrive');

const jobValidators = [
  body('company').trim().notEmpty(),
  body('role').trim().notEmpty(),
  body('description').trim().notEmpty(),
  body('deadline').isISO8601().toDate()
];

const driveValidators = [body('title').trim().notEmpty(), body('details').trim().notEmpty(), body('date').isISO8601().toDate()];

const placementPage = async (req, res) => {
  const [jobs, drives, applications] = await Promise.all([
    JobListing.find().sort({ deadline: 1 }),
    PlacementDrive.find().sort({ date: 1 }),
    JobApplication.find().populate('student job', 'name role company')
  ]);
  res.render('placement', { title: 'Placement Services', jobs, drives, applications });
};

const createJob = async (req, res) => {
  await JobListing.create({ ...req.body, createdBy: req.user._id });
  res.redirect('/placement');
};

const applyJob = async (req, res) => {
  await JobApplication.updateOne(
    { student: req.user._id, job: req.params.jobId },
    { student: req.user._id, job: req.params.jobId, status: 'applied' },
    { upsert: true }
  );
  res.redirect('/placement');
};

const createDrive = async (req, res) => {
  await PlacementDrive.create({ ...req.body, coordinator: req.user._id });
  res.redirect('/placement');
};

module.exports = { jobValidators, driveValidators, placementPage, createJob, applyJob, createDrive };
