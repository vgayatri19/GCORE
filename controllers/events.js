const Event = require('../models/Event');
const User = require('../models/User');

// @desc    Get event creation form
// @route   GET /events/create
// @access  Private (Club President/VP)
exports.getCreateEvent = (req, res) => {
    res.render('events/create', { title: 'Propose New Event' });
};

// @desc    Create new event (Proposed)
// @route   POST /events
// @access  Private (Club President/VP)
exports.createEvent = async (req, res) => {
    try {
        req.body.createdBy = req.user.id;
        req.body.clubName = req.user.managedClub;
        req.body.status = 'Proposed';
        req.body.approvalStatus = 'Pending';
        req.body.approvalStage = 'Coordinator';
        req.body.isPublic = false;

        await Event.create(req.body);
        res.redirect('/clubs');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// @desc    Get pending approvals for hierarchical roles
// @route   GET /events/approvals
// @access  Private (Coordinator, HOD, Dean, Director)
exports.getApprovals = async (req, res) => {
    try {
        let query = { approvalStatus: 'Pending' };

        // Hierarchical filtering based on role
        if (req.user.role === 'Faculty') {
            query.approvalStage = 'Coordinator';
            // In a real app, we'd filter by department or club coordinator link
        } else if (req.user.role === 'HOD') {
            query.approvalStage = 'HOD';
        } else if (req.user.role === 'Dean') {
            query.approvalStage = 'Dean';
        } else if (req.user.role === 'Director') {
            query.approvalStage = 'Director';
        } else if (req.user.role !== 'Admin') {
            return res.status(403).send('Not authorized');
        }

        const pendingEvents = await Event.find(query).populate('createdBy', 'name');
        res.render('events/approvals', { title: 'Event Approvals', pendingEvents });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// @desc    Approve/Advance event to next stage
// @route   POST /events/:id/approve
// @access  Private (Hierarchical Approvers)
exports.approveEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).send('Event not found');

        const stages = ['Coordinator', 'HOD', 'Dean', 'Director', 'Finalized'];
        const currentIndex = stages.indexOf(event.approvalStage);

        if (currentIndex < stages.length - 1) {
            event.approvalStage = stages[currentIndex + 1];

            // If advanced from Director to Finalized
            if (event.approvalStage === 'Finalized') {
                event.approvalStatus = 'Approved';
                event.status = 'Upcoming';
            }
        }

        await event.save();
        res.redirect('/events/approvals');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// @desc    Reject event
// @route   POST /events/:id/reject
// @access  Private (Hierarchical Approvers)
exports.rejectEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).send('Event not found');

        event.approvalStatus = 'Rejected';
        event.rejectionReason = req.body.reason || 'No reason provided';
        await event.save();

        res.redirect('/events/approvals');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// @desc    Toggle Public visibility
// @route   POST /events/:id/toggle-public
// @access  Private (Coordinator)
exports.togglePublic = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).send('Event not found');

        // Only Approved events can go public
        if (event.approvalStatus !== 'Approved') {
            return res.status(400).send('Event must be fully approved first');
        }

        event.isPublic = !event.isPublic;
        await event.save();

        res.redirect('/clubs');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};
