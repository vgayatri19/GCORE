const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@gcet\.edu\.in$/,
            'Please use a valid @gcet.edu.in email'
        ]
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: [8, 'Password must be at least 8 characters'],
        validate: {
            validator: function (v) {
                return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s]).{8,}$/.test(v);
            },
            message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
        },
        select: false
    },
    role: {
        type: String,
        enum: ['Student', 'Faculty', 'HOD', 'Dean', 'Director', 'Placement Officer', 'Admin'],
        default: 'Student'
    },
    department: {
        type: String,
        required: function () { return this.role !== 'Admin'; } // Admin might not need a department
    },
    clubRole: {
        type: String,
        enum: ['President', 'Vice President', 'Member', 'Faculty Coordinator', 'None'],
        default: 'None'
    },
    managedClub: {
        type: String
    },
    isApproved: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
