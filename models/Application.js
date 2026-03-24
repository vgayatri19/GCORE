const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    drive: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PlacementDrive',
        required: true
    },
    status: {
        type: String,
        enum: ['Applied', 'Shortlisted', 'Selected', 'Rejected'],
        default: 'Applied'
    },
    appliedAt: {
        type: Date,
        default: Date.now
    }
});

// Prevent multiple applications to same drive
ApplicationSchema.index({ student: 1, drive: 1 }, { unique: true });

module.exports = mongoose.model('Application', ApplicationSchema);
