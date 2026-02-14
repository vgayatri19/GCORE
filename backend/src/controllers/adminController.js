const User = require('../models/User');
const Event = require('../models/Event');
const AuditLog = require('../models/AuditLog');
const { logAdminAction } = require('../services/auditService');

const adminPage = async (req, res) => {
  const [users, pendingEvents, logs] = await Promise.all([
    User.find().sort({ createdAt: -1 }),
    Event.find({ status: 'pending' }).populate('createdBy', 'name'),
    AuditLog.find().populate('admin', 'name').sort({ createdAt: -1 }).limit(50)
  ]);

  res.render('admin', { title: 'Admin Controls', users, pendingEvents, logs });
};

const assignRole = async (req, res) => {
  await User.findByIdAndUpdate(req.params.userId, { role: req.body.role });
  await logAdminAction(req.user._id, 'ASSIGN_ROLE', { userId: req.params.userId, role: req.body.role });
  res.redirect('/admin');
};

const approveEvent = async (req, res) => {
  await Event.findByIdAndUpdate(req.params.eventId, { status: req.body.status });
  await logAdminAction(req.user._id, 'EVENT_APPROVAL', { eventId: req.params.eventId, status: req.body.status });
  res.redirect('/admin');
};

module.exports = { adminPage, assignRole, approveEvent };
