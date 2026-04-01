require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const seedUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        // Delete all users except admin and trainer
        const result = await User.deleteMany({
            role: { $nin: ['admin', 'trainer'] }
        });
        console.log(`Deleted ${result.deletedCount} regular users.`);

        const dummyNames = ['dhruv', 'harshil', 'anshu', 'urvesh', 'dhruvil'];
        
        for (const name of dummyNames) {
            const newUser = new User({
                username: name,
                email: `${name}@test.com`,
                password: 'password@123',
                role: 'user'
            });
            await newUser.save();
            console.log(`Created user: ${name}`);
        }

        console.log('Database reset complete!');
    } catch (err) {
        console.error('Error seeding users:', err);
    } finally {
        mongoose.connection.close();
    }
};

seedUsers();
