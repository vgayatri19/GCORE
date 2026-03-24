const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB...');

        const adminData = {
            name: 'Web Admin',
            email: 'admin_official@gcet.edu.in',
            password: 'AdminPassword123!', // Meets the complexity requirements
            role: 'Admin',
            department: 'Management'
        };

        // Check if user already exists
        const existingUser = await User.findOne({ email: adminData.email });
        if (existingUser) {
            console.log(`User with email ${adminData.email} already exists.`);
            process.exit(0);
        }

        const admin = await User.create(adminData);
        console.log(`✅ Admin user created successfully: ${admin.name} (${admin.email})`);

        process.exit(0);
    } catch (err) {
        console.error('❌ Error creating admin user:', err.message);
        process.exit(1);
    }
};

createAdmin();
