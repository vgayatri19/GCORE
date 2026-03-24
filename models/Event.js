const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add an event title']
    },
    type: {
        type: String,
        enum: ['Workshop', 'Seminar', 'Hackathon', 'Other'],
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['Proposed', 'Upcoming', 'Completed', 'Cancelled'],
        default: 'Proposed'
    },
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    clubName: {
        type: String,
        required: true
    },
    approvalStatus: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    approvalStage: {
        type: String,
        enum: ['Coordinator', 'HOD', 'Dean', 'Director', 'Finalized'],
        default: 'Coordinator'
    },
    isPublic: {
        type: Boolean,
        default: false
    },
    description: {
        type: String
    },
    reportUrl: {
        type: String
    },
    rejectionReason: String,
    proposedAt: {
        type: Date,
        default: Date.now
    },
    approvedAt: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Event', EventSchema);
