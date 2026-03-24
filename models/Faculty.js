const mongoose = require('mongoose');

const FacultySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    designation: {
        type: String,
        required: [true, 'Please add a designation']
    },
    qualification: {
        type: String,
        required: [true, 'Please add qualification']
    },
    experience: {
        type: String,
        required: [true, 'Please add experience']
    },
    specialization: {
        type: String,
        required: [true, 'Please add specialization']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    registrationId: String,
    staffType: {
        type: String,
        enum: ['Teaching', 'Non-Teaching'],
        default: 'Teaching'
    },
    department: {
        type: String,
        required: true,
        // enum could be dynamic but for now string is fine or could ref Department model
        // ref: 'Department' would be better if we query populate
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Faculty', FacultySchema);
