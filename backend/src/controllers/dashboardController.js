const Announcement = require('../models/Announcement');
const Notification = require('../models/Notification');
const Event = require('../models/Event');
const JobApplication = require('../models/JobApplication');

const studentDashboard = async (req, res) => {
  const [announcements, notifications, events, applications] = await Promise.all([
    Announcement.find().sort({ createdAt: -1 }).limit(10),
    Notification.find({ $or: [{ user: req.user._id }, { user: { $exists: false } }] }).sort({ createdAt: -1 }).limit(10),
    Event.find({ status: 'approved' }).sort({ date: 1 }).limit(5),
    JobApplication.find({ student: req.user._id }).populate('job').sort({ createdAt: -1 })
  ]);

  res.render('dashboard', { title: 'Dashboard', announcements, notifications, events, applications });
};

module.exports = { studentDashboard };
