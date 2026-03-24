require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGO_URI;
console.log('Attempting to connect with URI:', uri.replace(/:([^:@]+)@/, ':****@')); // Hide password in logs

mongoose.connect(uri)
    .then(() => {
        console.log('✅ SUCCESS: Connected to MongoDB!');
        console.log('Connection state:', mongoose.connection.readyState);
        process.exit(0);
    })
    .catch((err) => {
        console.error('❌ ERROR: Connection failed');
        console.error('Error name:', err.name);
        console.error('Error message:', err.message);
        console.error('Full error:', err);
        process.exit(1);
    });
