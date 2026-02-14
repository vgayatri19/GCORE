const { body } = require('express-validator');
const Announcement = require('../models/Announcement');

const validators = [
  body('title').trim().notEmpty().withMessage('Title required'),
  body('message').trim().notEmpty().withMessage('Message required'),
  body('scope').optional().isIn(['global', 'club', 'department', 'placement'])
];

const listAnnouncements = async (req, res) => {
  const announcements = await Announcement.find().populate('createdBy', 'name role').sort({ createdAt: -1 });
  res.render('announcements', { title: 'Announcements', announcements });
};

const createAnnouncement = async (req, res) => {
  await Announcement.create({ ...req.body, createdBy: req.user._id });
  res.redirect('/announcements');
};

const deleteAnnouncement = async (req, res) => {
  await Announcement.findByIdAndDelete(req.params.id);
  res.redirect('/announcements');
};

module.exports = { validators, listAnnouncements, createAnnouncement, deleteAnnouncement };
