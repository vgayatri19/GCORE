const mongoose = require('mongoose');

const PlacementRecordSchema = new mongoose.Schema({
    studentName: {
        type: String,
        required: [true, 'Please add student name']
    },
    rollNumber: {
        type: String,
        required: [true, 'Please add roll number'],
        unique: true
    },
    department: {
        type: String,
        required: [true, 'Please add department'],
        enum: ['CSE', 'CSE-AIML', 'CSE-DS', 'CSE-CS', 'EEE', 'ECE', 'Civil', 'Mech', 'MBA']
    },
    company: {
        type: String,
        required: [true, 'Please add company name']
    },
    package: {
        type: Number,
        required: [true, 'Please add package in LPA']
    },
    type: {
        type: String,
        enum: ['On-Campus', 'Off-Campus'],
        default: 'On-Campus'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('PlacementRecord', PlacementRecordSchema);
