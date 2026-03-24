const mongoose = require('mongoose');

const AcademicRecordSchema = new mongoose.Schema({
    rollNumber: {
        type: String,
        required: [true, 'Please add roll number']
    },
    studentName: {
        type: String,
        required: [true, 'Please add student name']
    },
    department: {
        type: String,
        required: [true, 'Please add department']
    },
    semester: {
        type: String,
        required: [true, 'Please add semester (e.g., Sem 1, Sem 2)']
    },
    cgpa: {
        type: Number,
        required: [true, 'Please add CGPA'],
        min: [0, 'CGPA cannot be less than 0'],
        max: [10, 'CGPA cannot be more than 10']
    },
    backlogs: {
        type: Number,
        default: 0
    },
    passStatus: {
        type: String,
        enum: ['Pass', 'Fail'],
        default: 'Pass'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('AcademicRecord', AcademicRecordSchema);
