const mongoose = require('mongoose');

const connectDB = async (req, res, next) => {
    if (mongoose.connection.readyState >= 1) {
        return next();
    }

    const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/mygym';
    
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB (Serverless)');
        next();
    } catch (err) {
        console.error('MongoDB connection error:', err);
        res.status(500).json({ msg: 'Database connection error', error: err.message });
    }
};

module.exports = connectDB;
