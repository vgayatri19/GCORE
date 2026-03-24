const mongoose = require('mongoose');

const ClubSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a club name'],
        unique: true
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    president: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    facultyCoordinator: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    department: {
        type: String,
        required: [true, 'Please add a department']
    },
    logo: {
        type: String,
        default: 'no-photo.jpg'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Club', ClubSchema);
