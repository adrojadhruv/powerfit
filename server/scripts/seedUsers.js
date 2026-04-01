const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const User = require('../models/User');

const COMMON_PASSWORD = 'Gym@1234';

const usersToSeed = [
    {
        username: 'trainer',
        email: 'trainer@powerfit.com',
        password: COMMON_PASSWORD,
        age: 30,
        gender: 'male',
        role: 'trainer'
    },
    {
        username: 'admin',
        email: 'admin@powerfit.com',
        password: COMMON_PASSWORD,
        age: 28,
        gender: 'male',
        role: 'admin'
    }
];

const seedUsers = async () => {
    try {
        const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/mygym';
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB.');

        // Delete existing trainer and admin accounts
        const deleted = await User.deleteMany({ role: { $in: ['trainer', 'admin'] } });
        console.log(`Deleted ${deleted.deletedCount} existing trainer/admin account(s).`);

        // Create fresh accounts (password is auto-hashed by pre-save hook)
        for (const userData of usersToSeed) {
            const user = new User(userData);
            await user.save();
            console.log(`Created ${user.role}: ${user.email}`);
        }

        console.log('\n✅ Done! Credentials:');
        console.log('----------------------------------');
        usersToSeed.forEach(u => {
            console.log(`Role:     ${u.role}`);
            console.log(`Email:    ${u.email}`);
            console.log(`Password: ${COMMON_PASSWORD}`);
            console.log('----------------------------------');
        });

        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message || err);
        process.exit(1);
    }
};

seedUsers();
