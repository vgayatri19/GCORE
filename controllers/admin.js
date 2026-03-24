const User = require('../models/User');
const Department = require('../models/Department');
const Club = require('../models/Club');
const Event = require('../models/Event');

// @desc    Get Admin Dashboard Stats
// @route   GET /admin/dashboard
// @access  Private/Admin
exports.getDashboard = async (req, res) => {
    try {
        const stats = {
            totalUsers: await User.countDocuments(),
            pendingUsers: await User.countDocuments({ isApproved: false, role: { $ne: 'Admin' } }),
            departments: await Department.countDocuments(),
            clubs: await Club.countDocuments(),
            events: await Event.countDocuments()
        };
        res.render('admin/dashboard', { stats });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// @desc    List All Users for Management
// @route   GET /admin/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });
        res.render('admin/users', { users });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// @desc    Approve User
// @route   POST /admin/users/:id/approve
// @access  Private/Admin
exports.approveUser = async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.params.id, { isApproved: true });
        res.redirect('/admin/users');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// @desc    Reject/Delete User
// @route   POST /admin/users/:id/reject
// @access  Private/Admin
exports.rejectUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.redirect('/admin/users');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// @desc    Create Department
// @route   POST /admin/departments
// @access  Private/Admin
exports.createDepartment = async (req, res) => {
    try {
        await Department.create(req.body);
        res.redirect('/admin/dashboard');
    } catch (err) {
        console.error(err);
        res.status(400).send('Error creating department');
    }
};

// @desc    Create Club
// @route   POST /admin/clubs
// @access  Private/Admin
exports.createClub = async (req, res) => {
    try {
        await Club.create(req.body);
        res.redirect('/admin/dashboard');
    } catch (err) {
        console.error(err);
        res.status(400).send('Error creating club');
    }
};

// @desc    Create Event
// @route   POST /admin/events
// @access  Private/Admin
exports.createEvent = async (req, res) => {
    try {
        await Event.create(req.body);
        res.redirect('/admin/dashboard');
    } catch (err) {
        console.error(err);
        res.status(400).send('Error creating event');
    }
};
