const { body } = require('express-validator');
const CareerResource = require('../models/CareerResource');

const validators = [
  body('category').isIn(['resume', 'job_search', 'interview', 'skills']),
  body('title').trim().notEmpty(),
  body('content').trim().notEmpty()
];

const careerPage = async (req, res) => {
  const resources = await CareerResource.find().sort({ createdAt: -1 });
  res.render('career', { title: 'Career Guidance', resources });
};

const createResource = async (req, res) => {
  await CareerResource.create(req.body);
  res.redirect('/career');
};

module.exports = { validators, careerPage, createResource };
