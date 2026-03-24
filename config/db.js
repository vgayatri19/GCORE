const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        if (error.name === 'MongooseServerSelectionError' || error.message.includes('timeout')) {
            console.error('👉 TIP: This might be caused by your IP address not being whitelisted in MongoDB Atlas.');
            console.error('👉 Check your Atlas Network Access settings.');
        }
        process.exit(1);
    }
};

module.exports = connectDB;
