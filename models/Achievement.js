const mongoose = require('mongoose');

const AchievementSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title (Event Name)']
    },
    type: {
        type: String,
        enum: ['TECHNICAL', 'NON_TECHNICAL', 'SPORTS', 'CULTURAL', 'OTHER'],
        default: 'TECHNICAL'
    },
    studentName: {
        type: String,
        required: true
    },
    rollNumber: {
        type: String,
        required: true
    },
    level: {
        type: String,
        enum: ['Local', 'State', 'National', 'International', 'N/A'],
        default: 'N/A'
    },
    award: {
        type: String,
        default: 'Participation'
    },
    collegeName: {
        type: String,
        default: 'Geethanjali College of Engineering & Technology'
    },
    phoneNumber: {
        type: String
    },
    totalStudents: {
        type: Number,
        default: 1
    },
    achieverRole: {
        type: String,
        enum: ['PARTICIPANT', 'WINNER', 'RUNNER_UP', 'ORGANIZER', 'OTHER'],
        default: 'PARTICIPANT'
    },
    category: {
        type: String,
        enum: ['HACKATHON', 'WORKSHOP', 'INTERNSHIP', 'COMPETITION', 'RESEARCH', 'CERTIFICATION', 'COURSE', 'OTHER'],
        default: 'COMPETITION'
    },
    year: {
        type: String,
        default: 'N/A'
    },
    department: {
        type: String,
        required: true
    },
    description: String,
    date: {
        type: String,
        default: 'N/A'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Achievement', AchievementSchema);
