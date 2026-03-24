const mongoose = require('mongoose');

const PlacementDriveSchema = new mongoose.Schema({
    companyName: {
        type: String,
        required: [true, 'Please add company name'],
        trim: true
    },
    role: {
        type: String,
        required: [true, 'Please add job role']
    },
    eligibilityCriteria: {
        type: String,
        required: [true, 'Please add eligibility criteria']
    },
    package: {
        type: String,
        required: [true, 'Please add package details (LPA)']
    },
    driveDate: {
        type: Date,
        required: [true, 'Please add drive date']
    },
    applicationDeadline: {
        type: Date,
        required: [true, 'Please add application deadline']
    },
    status: {
        type: String,
        enum: ['Active', 'Closed'],
        default: 'Active'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('PlacementDrive', PlacementDriveSchema);
