const { body } = require('express-validator');
const Club = require('../models/Club');
const Event = require('../models/Event');
const Participation = require('../models/Participation');

const clubValidators = [body('name').trim().notEmpty(), body('description').trim().notEmpty()];
const eventValidators = [body('title').trim().notEmpty(), body('date').isISO8601().toDate()];

const clubPage = async (req, res) => {
  const [clubs, events, participants] = await Promise.all([
    Club.find().populate('coordinator', 'name'),
    Event.find().populate('club').sort({ date: 1 }),
    Participation.find().populate('event student', 'title name')
  ]);
  res.render('clubs', { title: 'Club Management', clubs, events, participants });
};

const createClub = async (req, res) => {
  await Club.create({ ...req.body, coordinator: req.user._id });
  res.redirect('/clubs');
};

const createEvent = async (req, res) => {
  await Event.create({ ...req.body, createdBy: req.user._id, club: req.body.clubId || undefined });
  res.redirect('/clubs');
};

const participate = async (req, res) => {
  await Participation.updateOne(
    { event: req.params.eventId, student: req.user._id },
    { event: req.params.eventId, student: req.user._id },
    { upsert: true }
  );
  res.redirect('/clubs');
};

module.exports = { clubValidators, eventValidators, clubPage, createClub, createEvent, participate };
