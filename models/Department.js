const mongoose = require('mongoose');

const DepartmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a department name'],
        unique: true,
        trim: true
    },
    vision: {
        type: String,
        required: [true, 'Please add a vision statement']
    },
    mission: {
        type: String,
        required: [true, 'Please add a mission statement']
    },
    hodName: {
        type: String,
        required: [true, 'Please add HOD name']
    },
    totalFaculty: {
        type: Number,
        default: 0
    },
    totalStudents: {
        type: Number,
        default: 0
    },
    totalLabs: {
        type: Number,
        default: 0
    },
    placementRate: {
        type: Number,
        default: 0
    },
    description: String,
    peos: [String],
    pos: [String],
    psos: [String],
    wks: [String],
    statsDetailed: {
        intake: Number,
        establishedYear: Number,
        professors: Number,
        assocProfessors: Number,
        asstProfessors: Number,
        seniorAsstProfessors: Number
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Department', DepartmentSchema);
