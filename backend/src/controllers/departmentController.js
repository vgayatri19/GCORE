const { body } = require('express-validator');
const DepartmentResource = require('../models/DepartmentResource');

const validators = [
  body('department').trim().notEmpty(),
  body('title').trim().notEmpty(),
  body('content').trim().notEmpty(),
  body('schedule').optional().trim()
];

const departmentPage = async (req, res) => {
  const resources = await DepartmentResource.find().sort({ createdAt: -1 });
  res.render('departments', { title: 'Department Coordination', resources });
};

const createResource = async (req, res) => {
  await DepartmentResource.create({ ...req.body, createdBy: req.user._id });
  res.redirect('/departments');
};

module.exports = { validators, departmentPage, createResource };
